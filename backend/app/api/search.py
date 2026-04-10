from fastapi import APIRouter, UploadFile, File, HTTPException
import json
import os
import numpy as np
from app.db.connection import get_db_connection
from app.utils.face import normalize, cosine_similarity, decode_image_to_file, get_embeddings

router = APIRouter()

@router.post("/")
async def search_face(file: UploadFile = File(...)):
    data = await file.read()
    tmp_path = decode_image_to_file(data)

    try:
        embeddings = get_embeddings(tmp_path)
    except Exception:
        raise HTTPException(status_code=400, detail="No face detected. Please upload a clear image.")
    finally:
        if os.path.exists(tmp_path):  # ← safe single delete
            os.unlink(tmp_path)

    if len(embeddings) != 1:
        raise HTTPException(
            status_code=400,
            detail="Multiple faces detected. Please make sure only one face is visible."
        )

    query_embedding = normalize(np.array(embeddings[0]))

    conn = get_db_connection()

    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, face_data, embedded_data FROM faces")
        rows = cursor.fetchall()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch faces")
    finally:
        cursor.close()
        conn.close()

    matches = []
    for face_id, image_data, emb_json in rows:
        stored_vec = normalize(np.array(json.loads(emb_json)))
        score = round(float(cosine_similarity(query_embedding, stored_vec)), 2)

        if score > 0.5:
            matches.append({"face_id": face_id, "image": image_data, "score": score})

    matches.sort(key=lambda x: -x["score"])

    return {"matches": matches, "total": len(matches)}
