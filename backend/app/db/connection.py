import mysql.connector
from mysql.connector import Error
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )

        if connection.is_connected():
            return connection
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")

    except Error:
        raise HTTPException(status_code=500, detail="Database connection failed")