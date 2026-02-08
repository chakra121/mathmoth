from datetime import datetime

class TestModel:
    def __init__(self, title: str, duration: int):
        self.title = title
        self.duration = duration
        self.status = "draft"
        self.created_at = datetime.utcnow()
        self.published_at = None
