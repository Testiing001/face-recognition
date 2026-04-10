from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
import jwt
import os
from dotenv import load_dotenv
from app.db.connection import get_db_connection
from app.utils.security import verify_password

load_dotenv()

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_TOKEN_EXPIRE_MINUTES"))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    cursor = conn.cursor(dictionary=True, buffered=True)
    try:
        cursor.execute("SELECT * FROM admin WHERE username=%s", (form_data.username,))
        admin = cursor.fetchone()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch admin")
    finally:
        cursor.close()
        conn.close()

    if not admin or not verify_password(form_data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token({"sub": admin["username"]})
    return {"access_token": access_token, "token_type": "bearer"}
