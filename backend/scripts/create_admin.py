from database import get_db
from utils.security import hash_password

db = get_db()

admin_email = "admin@mathmoth.com"
admin_password = "Shreyas@123"

existing = db.users.find_one({"email": admin_email})

if existing:
    print("Admin already exists")
else:
    db.users.insert_one({
        "name": "Admin",
        "email": admin_email,
        "password": hash_password(admin_password),
        "role": "ADMIN",
        "slug": None,
    })
    print("Admin created successfully")