import sys
from app.utils.security import hash_password
from app.db.connection import get_db_connection

username = sys.argv[1]
password = sys.argv[2]
fullname = sys.argv[3]
email = sys.argv[4]

hashed_password = hash_password(password[:72])
conn = get_db_connection()
if not conn:
    raise HTTPException(status_code=500, detail="DB connection error")

cursor = conn.cursor()
cursor.execute(
    "INSERT INTO admin (username, password, fullname, email) VALUES (%s, %s, %s, %s)",
    (username, hashed_password, fullname, email)
)
conn.commit()
cursor.close()
conn.close()

print(f"Admin '{username}' added successfully!")
