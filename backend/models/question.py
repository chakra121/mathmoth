from typing import List
from bson import ObjectId

class QuestionModel:
    def __init__(
        self,
        test_id: ObjectId,
        question_text: str,
        options: List[str],
        correct_options: List[int],
        order: int,
        question_type: str,
    ):
        self.test_id = test_id
        self.question_text = question_text
        self.options = options
        self.correct_options = correct_options
        self.order = order
        self.question_type = question_type
