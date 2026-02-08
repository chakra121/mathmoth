from pydantic import BaseModel
from typing import Dict, List


class SubmitTestSchema(BaseModel):
    student_id: str
    answers: Dict[str, List[int]]
