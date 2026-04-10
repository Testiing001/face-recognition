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
        placeholders = ",".join(["%s"] * len(ids))
        cursor.execute(f"DELETE FROM images WHERE id IN ({placeholders})", ids)
        deleted_count = cursor.rowcount

        cursor.execute("""
            DELETE FROM groups WHERE id NOT IN (
                SELECT group_id FROM (
                    SELECT DISTINCT group_id FROM faces WHERE group_id IS NOT NULL
                ) AS temp
            )
        """)

        conn.commit()
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete photos")
    finally:
        cursor.close()
        conn.close()

    return {"deleted": deleted_count, "message": f"{deleted_count} photo(s) deleted successfully"}