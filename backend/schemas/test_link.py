from pydantic import BaseModel, HttpUrl
from typing import Optional

class TestLinkCreateSchema(BaseModel):
    title: str
    url: HttpUrl   # 🔒 HTTPS enforced
    active: bool = True


class TestLinkUpdateSchema(BaseModel):
    title: Optional[str] = None
    url: Optional[HttpUrl] = None
    active: Optional[bool] = None
