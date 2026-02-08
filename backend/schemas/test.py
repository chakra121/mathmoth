from pydantic import BaseModel

class TestCreateSchema(BaseModel):
    title: str
    duration: int  # seconds


class TestResponseSchema(BaseModel):
    id: str
    title: str
    duration: int
    status: str
