from datetime import datetime
from typing import Optional


class TestLinkModel:
    def __init__(
        self,
        title: str,
        url: str,
        active: bool = True,
        created_at: Optional[datetime] = None,
    ):
        self.title = title
        self.url = url
        self.active = active
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "title": self.title,
            "url": str(self.url),  # ✅ convert HttpUrl → str
            "active": self.active,
            "created_at": self.created_at,
    }

