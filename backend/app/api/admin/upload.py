import base64
import json
import os
from typing import List
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.db.connection import get_db_connection
from app.utils.face import decode_image_to_file, get_embeddings

router = APIRouter()

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

            image_b64 = "data:image/jpeg;base64," + base64.b64encode(data).decode("utf-8")

            try:
                for embedding in embeddings:
                    cursor.execute(
                        "INSERT INTO faces (face_data, embedded_data) VALUES (%s, %s)",
                        (image_b64, json.dumps(embedding))
                    )
                stored_faces += len(embeddings)
            except Exception:
                conn.rollback()
                raise HTTPException(status_code=500, detail="Failed to store image")

        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {"stored_faces": stored_faces, "message": f"{stored_faces} face(s) stored successfully"}