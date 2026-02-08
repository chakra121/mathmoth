from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime
from typing import Dict, List

from database import get_db

router = APIRouter(tags=["Student Tests"])


# =====================================================
# GET PUBLISHED TEST (SAFE FOR STUDENTS)
# =====================================================
@router.get("/tests/{test_id}")
def get_test_for_student(test_id: str):
    db = get_db()

    test = db.tests.find_one(
        {"_id": ObjectId(test_id), "status": "published"}
    )

    questions = list(
        db.questions.find(
            {"test_id": ObjectId(test_id)},
            {
                "correct_options": 0,  # 🔒 hide answers
            },
        ).sort("order", 1)
    )

    return {
        "id": str(test["_id"]),
        "title": test["title"],
        "duration": test["duration"],
        "questions": [
            {
                "id": str(q["_id"]),
                "question_text": q["question_text"],
                "options": q["options"],
                "order": q["order"],
                "question_type": q.get("question_type", "single"),
            }
            for q in questions
        ],
    }



# =====================================================
# LIST ALL PUBLISHED TESTS (STUDENT)
# =====================================================
@router.get("/tests")
def list_published_tests():
    db = get_db()

    tests = list(
        db.tests.find(
            {"status": "published"},
            {"title": 1, "duration": 1},
        )
    )

    return [
        {
            "id": str(t["_id"]),
            "title": t["title"],
            "duration": t["duration"],
        }
        for t in tests
    ]

# =====================================================
# STUDENT TEST LINKS
# =====================================================
@router.get("/test-links")
def get_active_test_links():
    db = get_db()

    links = list(
        db.test_links.find(
            {"active": True},
            {"title": 1, "url": 1}
        )
    )

    return [
        {
            "id": str(l["_id"]),
            "title": l["title"],
            "url": l["url"],
        }
        for l in links
    ]

# =====================================================
# STUDENT: GET ACTIVE TEST LINKS
# =====================================================
@router.get("/test-links")
def get_active_test_links():
    db = get_db()

    links = list(
        db.test_links.find(
            {"active": True},
            {"title": 1, "url": 1},
        )
    )

    return [
        {
            "id": str(l["_id"]),
            "title": l["title"],
            "url": l["url"],
        }
        for l in links
    ]
