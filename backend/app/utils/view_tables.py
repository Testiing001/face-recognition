from app.db.connection import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()

tables = ["admin", "images", "faces", "groups"]

for table in tables:
    print(f"\n--- {table} ---")
    cursor.execute(f"DESCRIBE {table}")
    rows = cursor.fetchall()
    for row in rows:
        print(row)

cursor.close()
conn.close()