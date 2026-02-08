from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime

from database import get_db
from schemas.submission import SubmitTestSchema
from models.submission import SubmissionModel, SubmissionAnswerModel

router = APIRouter(prefix="/student", tags=["Student Submissions"])


# =====================================================
# SUBMIT TEST (ONLY ONE SOURCE OF TRUTH)
# =====================================================
@router.post("/tests/{test_id}/submit")
def submit_test(test_id: str, payload: SubmitTestSchema):
    db = get_db()

    test = db.tests.find_one(
        {"_id": ObjectId(test_id), "status": "published"}
    )
    if not test:
        raise HTTPException(404, "Test not found or not published")

    questions = list(
        db.questions.find({"test_id": ObjectId(test_id)})
    )
    if not questions:
        raise HTTPException(400, "No questions found")

    # attempt count
    attempt = (
        db.submissions.count_documents(
            {
                "student_id": ObjectId(payload.student_id),
                "test_id": ObjectId(test_id),
            }
        )
        + 1
    )

    # correct answers map
    correct_map = {
        str(q["_id"]): sorted(q["correct_options"])
        for q in questions
    }

    submission = SubmissionModel(
        student_id=ObjectId(payload.student_id),
        test_id=ObjectId(test_id),
        attempt=attempt,
        score=0,
        total_questions=len(questions),
    )

    submission_id = db.submissions.insert_one(
        submission.to_dict()
    ).inserted_id

    score = 0
    answer_docs = []

    for qid, selected in payload.answers.items():
        correct = correct_map.get(qid, [])
        is_correct = sorted(selected) == correct

        if is_correct:
            score += 1

        answer_docs.append(
            SubmissionAnswerModel(
                submission_id=submission_id,
                question_id=ObjectId(qid),
                selected_options=selected,
                is_correct=is_correct,
            ).to_dict()
        )

    if answer_docs:
        db.submission_answers.insert_many(answer_docs)

    db.submissions.update_one(
        {"_id": submission_id},
        {"$set": {"score": score, "submitted_at": datetime.utcnow()}},
    )

    return {
        "submission_id": str(submission_id),
        "score": score,
        "total": len(questions),
        "attempt": attempt,
    }


# =====================================================
# STUDENT SUBMISSION HISTORY
# =====================================================
@router.get("/submissions/{student_id}")
def get_student_submissions(student_id: str):
    db = get_db()

    submissions = list(
        db.submissions.find(
            {"student_id": ObjectId(student_id)}
        ).sort("submitted_at", -1)
    )

    results = []
    for s in submissions:
        test = db.tests.find_one({"_id": s["test_id"]})
        results.append({
            "id": str(s["_id"]),
            "test_title": test["title"] if test else "Unknown Test",
            "score": s["score"],
            "total": s["total_questions"],
            "attempt": s["attempt"],
            "submitted_at": s["submitted_at"],
        })

    return results

@router.get("/submissions/{submission_id}/detail")
def get_submission_detail(submission_id: str):
    db = get_db()

    submission = db.submissions.find_one(
        {"_id": ObjectId(submission_id)}
    )
    if not submission:
        raise HTTPException(404, "Submission not found")

    test = db.tests.find_one({"_id": submission["test_id"]})
    questions = list(
        db.questions.find({"test_id": submission["test_id"]})
    )

    answers = list(
        db.submission_answers.find(
            {"submission_id": ObjectId(submission_id)}
        )
    )

    answer_map = {
        str(a["question_id"]): a
        for a in answers
    }

    return {
        "test_title": test["title"] if test else "Unknown Test",
        "score": submission["score"],
        "total": submission["total_questions"],
        "submitted_at": submission["submitted_at"],
        "questions": [
            {
                "id": str(q["_id"]),
                "question_text": q["question_text"],
                "options": q["options"],
                "correct_options": q["correct_options"],
                "selected_options": answer_map.get(
                    str(q["_id"]), {}
                ).get("selected_options", []),
            }
            for q in questions
        ],
    }
