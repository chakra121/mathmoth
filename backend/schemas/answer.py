from pydantic import BaseModel
from typing import List

class AnswerCreateSchema(BaseModel):
    attempt_id: str
    question_id: str
    selected_options: List[int]
