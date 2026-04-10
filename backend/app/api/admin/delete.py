from typing import List
from fastapi import APIRouter, HTTPException
from app.db.connection import get_db_connection

router = APIRouter()

@router.delete("/delete/")
def delete_faces(ids: List[int]):
    if not ids:
        raise HTTPException(status_code=400, detail="No IDs provided")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")
    
    cursor = conn.cursor()
    try:
        format_ids = ",".join(["%s"] * len(ids))
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