from fastapi import APIRouter, HTTPException, status
from database import get_db
from models.user import UserModel
from schemas.user import UserRegisterSchema, UserLoginSchema, GoogleUserSchema
from utils.security import hash_password, verify_password
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register_user(payload: UserRegisterSchema):
    db = get_db()
    users = db.users

    existing_user = users.find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    slug = payload.name.lower().replace(" ", "")

    user = UserModel(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role="STUDENT",
        slug=slug,
    )

    result = users.insert_one(user.to_dict())

    return {
        "id": str(result.inserted_id),
        "name": payload.name,
        "email": payload.email,
        "role": "STUDENT",
        "slug": slug,
    }

@router.post("/login")
def login_user(payload: UserLoginSchema):
    db = get_db()
    users = db.users

    user = users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "slug": user.get("slug"),
    }

@router.post("/google")
def google_auth(payload: GoogleUserSchema):
    db = get_db()
    users = db.users

    user = users.find_one({"email": payload.email})

    if user:
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "slug": user.get("slug"),
        }

    slug = payload.name.lower().replace(" ", "")

    new_user = UserModel(
        name=payload.name,
        email=payload.email,
        password="",
        role="STUDENT",
        slug=slug,
    )

    result = users.insert_one(new_user.to_dict())

    return {
        "id": str(result.inserted_id),
        "name": payload.name,
        "email": payload.email,
        "role": "STUDENT",
        "slug": slug,
    }
