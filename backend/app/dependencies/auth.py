import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.db.connection import get_db_connection
from dotenv import load_dotenv

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="DB connection error")

        cursor = conn.cursor()
        cursor.execute(
            "SELECT fullname, email FROM admin WHERE username = %s",
            (username,)
        )
        admin = cursor.fetchone()
        cursor.close()
        conn.close()

        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")

        return {
            "fullname": admin[0],
            "email": admin[1]
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
