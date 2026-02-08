from fastapi import APIRouter, HTTPException
from bson import ObjectId
from pydantic import BaseModel
from typing import List
from database import get_db
from models.question import QuestionModel
from schemas.question import QuestionCreateSchema

router = APIRouter(prefix="/admin", tags=["Admin Questions"])


# ==============================
# ORDER UPDATE SCHEMA
# ==============================
class QuestionOrderUpdate(BaseModel):
    id: str
    order: int


# ==============================
# CREATE QUESTION
# ==============================
@router.post("/tests/{test_id}/questions")
def add_question(test_id: str, payload: QuestionCreateSchema):
    db = get_db()

    # 🔑 AUTO-DETERMINE QUESTION TYPE
    question_type = (
        "multiple"
        if len(payload.correct_options) > 1
        else "single"
    )

    question = QuestionModel(
        test_id=ObjectId(test_id),
        question_text=payload.question_text,
        options=payload.options,
        correct_options=payload.correct_options,
        order=payload.order,
        question_type=question_type,
    )

    result = db.questions.insert_one(question.__dict__)

    return {"id": str(result.inserted_id)}


# ==============================
# GET QUESTIONS (ADMIN)
# ==============================
@router.get("/tests/{test_id}/questions")
def get_questions(test_id: str):
    db = get_db()

    questions = (
        db.questions.find({"test_id": ObjectId(test_id)})
        .sort("order", 1)
    )

    return [
        {
            "id": str(q["_id"]),
            "question_text": q["question_text"],
            "options": q["options"],
            "correct_options": q["correct_options"],
            "order": q["order"],
            "question_type": q.get("question_type", "single"),
        }
        for q in questions
    ]


# ==============================
# UPDATE QUESTION
# ==============================
@router.patch("/questions/{question_id}")
def update_question(question_id: str, payload: QuestionCreateSchema):
    db = get_db()

    question_type = (
        "multiple"
        if len(payload.correct_options) > 1
        else "single"
    )

    result = db.questions.update_one(
        {"_id": ObjectId(question_id)},
        {
            "$set": {
                "question_text": payload.question_text,
                "options": payload.options,
                "correct_options": payload.correct_options,
                "order": payload.order,
                "question_type": question_type,
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404, detail="Question not found"
        )

    return {"message": "Question updated"}


# ==============================
# DELETE QUESTION
# ==============================
@router.delete("/questions/{question_id}")
def delete_question(question_id: str):
    db = get_db()

    result = db.questions.delete_one(
        {"_id": ObjectId(question_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404, detail="Question not found"
        )

    return {"message": "Question deleted"}


# ==============================
# REORDER QUESTIONS
# ==============================
@router.patch("/tests/{test_id}/questions/reorder")
def reorder_questions(
    test_id: str, payload: List[QuestionOrderUpdate]
):
    db = get_db()

    for item in payload:
        db.questions.update_one(
            {
                "_id": ObjectId(item.id),
                "test_id": ObjectId(test_id),
            },
            {"$set": {"order": item.order}},
        )

    return {"message": "Question order updated"}
