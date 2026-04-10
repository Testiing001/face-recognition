from fastapi import APIRouter, HTTPException
from app.db.connection import get_db_connection

router = APIRouter()

@router.get("/facegroups/")
def get_face_groups():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")

    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                g.id,
                i.image_data AS thumbnail,
                COUNT(DISTINCT f.image_id) AS total_photos
            FROM groups g
            JOIN faces f_thumb ON g.face_id = f_thumb.id
            JOIN images i ON f_thumb.image_id = i.id
            JOIN faces f ON f.group_id = g.id
            GROUP BY g.id, i.image_data
        """)
        rows = cursor.fetchall()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch face groups")
    finally:
        cursor.close()
        conn.close()

    groups = [
        {
            "group_id": r[0],
            "thumbnail": r[1],
            "total_photos": r[2],
        }
        for r in rows
    ]
    return {"total_groups": len(groups), "groups": groups}

@router.get("/facegroups/{group_id}")
def get_group_detail(group_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB connection error")

    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM groups WHERE id = %s", (group_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Group not found")

        cursor.execute("""
            SELECT DISTINCT i.id, i.image_data 
            FROM faces f
            JOIN images i ON f.image_id = i.id 
            WHERE f.group_id = %s""", (group_id,)
        )

        rows = cursor.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch group images")
    finally:
        cursor.close()
        conn.close()

    images = [
        {"id": r[0], "image": r[1]}
        for r in rows
    ]
    return {
        "group_id": group_id, 
        "total_photos": len(images), 
        "images": images
    }