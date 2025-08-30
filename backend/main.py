from fastapi import FastAPI
from pydantic import BaseModel
import psycopg2

app = FastAPI()

# AWS PostgreSQL Config
DB_CONFIG = {
    "host": "barangay-db2.c5uqgk46i3nn.ap-southeast-2.rds.amazonaws.com",
    "port": 5432,
    "dbname": "barangaydb",
    "user": "postgres",
    "password": "Barangay#2025"
}

# Model from frontend
class User(BaseModel):
    firstName: str
    middleName: str
    lastName: str
    dob: str
    gender: str
    civilStatus: str
    contact: str
    purok: str
    barangay: str
    city: str
    province: str
    postalCode: str
    password: str
    photo: str | None = None
    role: str = "resident"

@app.post("/register/")
def register_user(user: User):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO users 
            (firstName, middleName, lastName, dob, gender, civilStatus, contact,
             purok, barangay, city, province, postalCode, password, photo, role)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            user.firstName, user.middleName, user.lastName, user.dob, user.gender, user.civilStatus,
            user.contact, user.purok, user.barangay, user.city, user.province,
            user.postalCode, user.password, user.photo, user.role
        ))
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "✅ User saved to PostgreSQL"}
    except Exception as e:
        return {"error": str(e)}
