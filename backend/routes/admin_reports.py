from fastapi import APIRouter, Query, HTTPException
from bson import ObjectId
from datetime import datetime, time

from database import get_db

router = APIRouter(prefix="/admin", tags=["Admin Reports"])


@router.get("/reports/tests")
def get_test_reports():
    db = get_db()

    tests = list(db.tests.find({}, {"title": 1}))
    submissions = list(db.submissions.find({}))

    # Group submissions by test_id
    report_map = {}

    for s in submissions:
        tid = str(s["test_id"])
        report_map.setdefault(tid, {
            "total_attempts": 0,
            "total_score": 0,
            "students": set(),
            "max_marks": s["total_questions"],
        })

        report_map[tid]["total_attempts"] += 1
        report_map[tid]["total_score"] += s["score"]
        report_map[tid]["students"].add(str(s["student_id"]))

    results = []

    for t in tests:
        tid = str(t["_id"])
        stats = report_map.get(tid)

        if not stats:
            results.append({
                "test_id": tid,
                "test_title": t["title"],
                "max_marks": 0,
                "avg_marks": 0,
                "students_attempted": 0,
                "total_attempts": 0,
                "avg_percentage": 0,
            })
            continue

        avg_marks = (
            stats["total_score"] / stats["total_attempts"]
            if stats["total_attempts"] > 0
            else 0
        )

        avg_percentage = (
            (avg_marks / stats["max_marks"]) * 100
            if stats["max_marks"] > 0
            else 0
        )

        results.append({
            "test_id": tid,
            "test_title": t["title"],
            "max_marks": stats["max_marks"],
            "avg_marks": round(avg_marks, 2),
            "students_attempted": len(stats["students"]),
            "total_attempts": stats["total_attempts"],
            "avg_percentage": round(avg_percentage, 2),
        })

    return results

@router.get("/reports/students")
def list_students_for_reports():
    db = get_db()

    students = list(
        db.users.find(
            {"role": "STUDENT"},
            {"name": 1, "email": 1}
        )
    )

    results = []
    for s in students:
        attempts = db.submissions.count_documents(
            {"student_id": s["_id"]}
        )

        results.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "email": s["email"],
            "total_attempts": attempts,
        })

    return results

@router.get("/reports/students/{student_id}")
def get_student_weekly_report(
    student_id: str,
    from_date: str = Query(..., alias="from"),
    to_date: str = Query(..., alias="to"),
):
    db = get_db()

    start = datetime.combine(
        datetime.fromisoformat(from_date).date(),
        time.min
    )
    end = datetime.combine(
        datetime.fromisoformat(to_date).date(),
        time.max
    )

    submissions = list(
        db.submissions.find({
            "student_id": ObjectId(student_id),
            "submitted_at": {"$gte": start, "$lte": end},
        })
    )

    # 🔐 ALWAYS return an array
    if not submissions:
        return []

    by_test = {}

    for s in submissions:
        tid = str(s["test_id"])
        by_test.setdefault(tid, []).append(s)

    report = []

    for tid, attempts in by_test.items():
        best = max(attempts, key=lambda x: x["score"])
        test = db.tests.find_one({"_id": ObjectId(tid)})

        report.append({
            "test_id": tid,
            "test_title": test["title"] if test else "Unknown",
            "best_score": best["score"],
            "total": best["total_questions"],
            "attempts": len(attempts),
            "submitted_at": best["submitted_at"],
        })

    return report


@router.get("/reports/students/{student_id}/test/{test_id}")
def get_student_test_breakdown(student_id: str, test_id: str):
    db = get_db()

    attempts = list(
        db.submissions.find({
            "student_id": ObjectId(student_id),
            "test_id": ObjectId(test_id),
        })
    )

    if not attempts:
        return {}

    best = max(attempts, key=lambda x: x["score"])

    answers = list(
        db.submission_answers.find({
            "submission_id": best["_id"]
        })
    )

    correct = sum(1 for a in answers if a["is_correct"])
    wrong = sum(1 for a in answers if not a["is_correct"])
    unanswered = best["total_questions"] - len(answers)

    return {
        "attempts": len(attempts),
        "best_score": best["score"],
        "total": best["total_questions"],
        "correct": correct,
        "wrong": wrong,
        "unanswered": unanswered,
    }

@router.get("/students/{student_id}")
def get_student_basic_info(student_id: str):
    db = get_db()

    student = db.users.find_one(
        {
            "_id": ObjectId(student_id),
            "role": "STUDENT",
        },
        {
            "name": 1,
            "email": 1,
            "created_at": 1,
        },
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return {
        "id": str(student["_id"]),
        "name": student.get("name"),
        "email": student.get("email"),
        "joined_at": student.get("created_at"),
    }
