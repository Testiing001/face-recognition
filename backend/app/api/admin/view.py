from fastapi import APIRouter, HTTPException, Query
from app.db.connection import get_db_connection
import math

router = APIRouter()

@router.get("/view/")
def view_faces(page: int = Query(1, ge=1), limit: int = Query(40, ge=1)):
    conn = get_db_connection()

    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")
    
    cursor = conn.cursor()
    try:
        offset = (page - 1) * limit

        cursor.execute("SELECT COUNT(*) FROM images")
        total_faces = cursor.fetchone()[0]

        cursor.execute("""
            SELECT id, image_data
            FROM images
            ORDER BY id DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))

        rows = cursor.fetchall()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch photos")
    finally:
        cursor.close()
        conn.close()

    faces = [
        {"id": r[0], "image": r[1]}
        for r in rows
    ]

    total_pages = math.ceil(total_faces / limit) if total_faces > 0 else 1

    return {
        "faces": faces,
        "limit": limit,
        "page": page,
        "total_pages": total_pages,
    }