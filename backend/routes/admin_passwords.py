from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from passlib.context import CryptContext

from database import get_db
from schemas.password import ChangePasswordSchema

router = APIRouter(prefix="/admin", tags=["Admin Passwords"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


@router.patch("/passwords/change")
def change_user_password(payload: ChangePasswordSchema):
    db = get_db()

    hashed = hash_password(payload.new_password)

    result = db.users.update_one(
        {"_id": ObjectId(payload.user_id)},
        {"$set": {"password": hashed}},
    )

    if result.matched_count == 0:
        raise HTTPException(404, "User not found")

    return {"message": "Password updated successfully"}

@router.get("/users")
def list_users():
    db = get_db()
    users = db.users.find({}, {"name": 1, "role": 1})
    return [
        {"id": str(u["_id"]), "name": u["name"], "role": u["role"]}
        for u in users
    ]

