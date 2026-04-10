import base64
import json
import os
from typing import List
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.db.connection import get_db_connection
from app.utils.face import decode_image_to_file, get_embeddings, normalize, cosine_similarity

router = APIRouter()

def find_matching_group(cursor, new_embedding: np.ndarray) -> int | None:
    cursor.execute("SELECT group_id, embedded_data FROM faces WHERE group_id IS NOT NULL")
    rows = cursor.fetchall()

    best_score = -1
    best_group_id = None

    for group_id, emb_json in rows:
        stored_vec = normalize(np.array(json.loads(emb_json)))
        score = cosine_similarity(new_embedding, stored_vec)
        if score > best_score:
            best_score = score
            best_group_id = group_id

    return best_group_id if best_score >= 0.5 else None


@router.post("/upload/")
async def upload_photos(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")

    cursor = conn.cursor()
    stored_faces = 0

    try:
        for file in files:
            data = await file.read()
            tmp_path = decode_image_to_file(data)

            try:
                embeddings = get_embeddings(tmp_path)
            except Exception:
                continue
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

            if not embeddings:
                continue

            image = "data:image/jpeg;base64," + base64.b64encode(data).decode("utf-8")
            try:
                cursor.execute("INSERT INTO images (image_data) VALUES (%s)",(image))
                image_id = cursor.lastrowid
            except Exception:
                conn.rollback()
                raise HTTPException(status_code=500, detail="Failed to store image")

            for embedding in embeddings:
                normalized_emb = normalize(np.array(embedding))
                group_id = find_matching_group(cursor, normalized_emb)

                if group_id is None:
                    try:
                        cursor.execute("INSERT INTO groups (thumbnail_id) VALUES (NULL)")
                        group_id = cursor.lastrowid
                    except Exception:
                        conn.rollback()
                        raise HTTPException(status_code=500, detail="Failed to create group")

                try:
                    cursor.execute(
                        "INSERT INTO faces (image_id, group_id, embedded_data) VALUES (%s, %s, %s)",
                        (image_id, group_id, json.dumps(embedding))
                    )
                    face_id = cursor.lastrowid

                    cursor.execute("UPDATE groups SET thumbnail_id = %s WHERE id = %s AND thumbnail_id IS NULL",
                        (face_id, group_id))
                    
                    stored_faces += 1
                except Exception:
                    conn.rollback()
                    raise HTTPException(status_code=500, detail="Failed to store face")

        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {
        "stored_faces": stored_faces, 
        "message": f"{stored_faces} face(s) stored successfully"
    }