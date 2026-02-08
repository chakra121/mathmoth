from pydantic import BaseModel, conlist
from typing import List

class QuestionCreateSchema(BaseModel):
    question_text: str
    options: conlist(str, min_length=4, max_length=4)
    correct_options: List[int]
    order: int
