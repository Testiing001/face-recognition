from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import json
import os
import base64
from app.db.connection import get_db_connection
from app.utils.face import normalize, get_embeddings, decode_image_to_file

router = APIRouter(prefix="/admin")

@router.post("/upload/")
async def upload_photos(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")
    
    cursor = conn.cursor()
    stored_faces = 0

    for file in files:
        data = await file.read()
        tmp_path = decode_image_to_file(data)

        try:
            embeddings = get_embeddings(tmp_path)
        except Exception:
            os.unlink(tmp_path)
            continue
        finally:
            os.unlink(tmp_path)

        if not embeddings:
            continue

        image_b64 = "data:image/png;base64," + base64.b64encode(data).decode("utf-8")

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
    cursor.close()
    conn.close()

    return {"stored_faces": stored_faces, "message": f"{stored_faces} face(s) stored successfully"}


@router.get("/view/")
def view_faces():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, face_data FROM faces")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    faces = [{"id": r[0], "image": r[1]} for r in rows]
    return {"total_faces": len(faces), "faces": faces}


@router.delete("/delete/")
def delete_faces(ids: List[int]):
    if not ids:
        raise HTTPException(status_code=400, detail="No IDs provided")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        format_ids = ",".join([str(i) for i in ids])
        cursor.execute(f"DELETE FROM faces WHERE id IN ({format_ids})")
        conn.commit()
        deleted_count = cursor.rowcount
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete faces")
    finally:
        cursor.close()
        conn.close()

    return {"deleted": deleted_count, "message": f"{deleted_count} face(s) deleted successfully"}
