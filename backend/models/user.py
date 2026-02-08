from datetime import datetime
from bson import ObjectId

class UserModel:
    def __init__(
        self,
        name: str,
        email: str,
        password: str,
        role: str,
        slug: str | None = None,
    ):
        self.name = name
        self.email = email
        self.password = password
        self.role = role  # "ADMIN" | "STUDENT"
        self.slug = slug
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "role": self.role,
            "slug": self.slug,
            "created_at": self.created_at,
        }
