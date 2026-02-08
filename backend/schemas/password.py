from pydantic import BaseModel, Field

class ChangePasswordSchema(BaseModel):
    user_id: str = Field(..., description="User ID")
    new_password: str = Field(min_length=6)
