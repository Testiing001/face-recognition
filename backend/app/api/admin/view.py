from fastapi import APIRouter
from app.db.connection import get_db_connection

router = APIRouter()

@router.get("/view/")
def view_faces():
    conn = get_db_connection()

    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, face_data FROM faces")
        rows = cursor.fetchall()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch faces")
    finally:
        cursor.close()
        conn.close()

    faces = [{"id": r[0], "image": r[1].decode() if isinstance(r[1], bytes) else r[1]} for r in rows]
    return {"total_faces": len(faces), "faces": faces}