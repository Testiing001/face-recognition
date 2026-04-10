from app.db.connection import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()

queries = [
    "ALTER TABLE images MODIFY COLUMN image_data LONGBLOB NOT NULL",
]

try:
    for query in queries:
        cursor.execute(query)
    conn.commit()
    print("All tables altered successfully")
except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
finally:
    cursor.close()
    conn.close()