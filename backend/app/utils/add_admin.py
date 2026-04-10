import sys
from app.utils.security import hash_password
from app.db.connection import get_db_connection

username = sys.argv[1]
password = sys.argv[2]

hashed_password = hash_password(password[:72])
conn = get_db_connection()
cursor = conn.cursor()
cursor.execute(
    "INSERT INTO admin (username, password) VALUES (%s, %s)",
    (username, hashed_password)
)
conn.commit()
cursor.close()
conn.close()

print(f"Admin '{username}' added successfully!")
