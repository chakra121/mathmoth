from pydantic import BaseModel

class AttemptCreateSchema(BaseModel):
    test_id: str
    student_id: str


class AttemptSubmitSchema(BaseModel):
    attempt_id: str
