from app.db.connection import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()

try:
    cursor.execute("""
        ALTER TABLE faces
        ADD COLUMN bbox TEXT
    """)
    print("Column 'bbox' added successfully.")
except Exception as e:
    print("Error:", e)

conn.commit()
cursor.close()
conn.close()
