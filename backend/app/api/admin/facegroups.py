import json
import numpy as np
from fastapi import APIRouter
from sklearn.cluster import DBSCAN
from app.db.connection import get_db_connection

router = APIRouter()

@router.get("/facegroups/")
def get_face_groups():
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

    if not rows:
        return {"groups": []}

    embeddings = []
    images = []

    for r in rows:
        embeddings.append(json.loads(r[2]))
        image_str = r[1].decode() if isinstance(r[1], bytes) else r[1]
        images.append({"id": r[0], "image": image_str})

    embeddings = np.array(embeddings)
    
    try:
        clustering = DBSCAN(eps=0.5, min_samples=1, metric="cosine").fit(embeddings)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to cluster faces")
    
    labels = clustering.labels_

    groups = {}
    for label, img in zip(labels, images):
        if label not in groups:
            groups[label] = []
        groups[label].append(img)

    result = [
        {
            "group_id": int(group_id),
            "thumbnail": items[0]["image"],
            "images": items,
        }
        for group_id, items in groups.items()
    ]

    return {"groups": result}