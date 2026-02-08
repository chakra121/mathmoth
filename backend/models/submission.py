from datetime import datetime
from bson import ObjectId


class SubmissionModel:
    def __init__(
        self,
        student_id: ObjectId,
        test_id: ObjectId,
        attempt: int,
        score: int,
        total_questions: int,
    ):
        self.student_id = student_id
        self.test_id = test_id
        self.attempt = attempt
        self.score = score
        self.total_questions = total_questions
        self.submitted_at = datetime.utcnow()

    def to_dict(self):
        return self.__dict__


class SubmissionAnswerModel:
    def __init__(
        self,
        submission_id: ObjectId,
        question_id: ObjectId,
        selected_options: list[int],
        is_correct: bool,
    ):
        self.submission_id = submission_id
        self.question_id = question_id
        self.selected_options = selected_options
        self.is_correct = is_correct

    def to_dict(self):
        return self.__dict__
