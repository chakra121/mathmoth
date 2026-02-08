from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class GoogleUserSchema(BaseModel):
    name: str
    email: EmailStr

class UserResponseSchema(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    slug: Optional[str]
