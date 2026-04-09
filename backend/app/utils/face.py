import numpy as np
import insightface
from insightface.app import FaceAnalysis
import cv2
import tempfile

app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=-1)

def normalize(vec: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vec)
    return vec / norm if norm != 0 else vec

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(normalize(a), normalize(b)))

def decode_image_to_file(data: bytes) -> str:
    tmp = tempfile.NamedTemporaryFile(suffix=".jpeg", delete=False)
    tmp.write(data)
    tmp.close()
    return tmp.name

def get_embeddings(img_path: str) -> list:
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError("Cannot read image")

    faces = app.get(img)
    embeddings = [f.embedding.tolist() for f in faces] if faces else []
    return embeddings

def detect_faces(img_path: str) -> list:
    img = cv2.imread(img_path)
    if img is None:
        return []

    faces = app.get(img)
    boxes = []
    for f in faces:
        x1, y1, x2, y2 = map(int, f.bbox.astype(float))
        boxes.append([x1, y1, x2, y2])
    return boxes