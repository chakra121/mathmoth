from fastapi import APIRouter, HTTPException, Body
from bson import ObjectId
from datetime import datetime

from database import get_db
from models.test import TestModel
from schemas.test import TestCreateSchema

router = APIRouter(prefix="/admin/tests", tags=["Admin Tests"])

@router.post("")
def create_test(payload: TestCreateSchema):
    db = get_db()

    test = TestModel(
        title=payload.title,
        duration=payload.duration,
    )

    result = db.tests.insert_one(test.__dict__)

    return {
        "id": str(result.inserted_id),
        "status": "draft",
    }

@router.get("")
def get_all_tests():
    db = get_db()

    tests = db.tests.find()

    return [
        {
            "id": str(t["_id"]),
            "title": t["title"],
            "duration": t["duration"],
            "status": t["status"],
        }
        for t in tests
    ]

@router.get("/{test_id}")
def get_test(test_id: str):
    db = get_db()

    test = db.tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    return {
        "id": str(test["_id"]),
        "title": test["title"],
        "duration": test["duration"],
        "status": test["status"],
    }

@router.patch("/{test_id}")
def update_test(test_id: str, payload: TestCreateSchema):
    db = get_db()

    result = db.tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {
            "title": payload.title,
            "duration": payload.duration,
        }},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")

    return {"message": "Test updated"}

@router.patch("/{test_id}/publish")
def publish_test(test_id: str, _: dict = Body(default={})):
    db = get_db()

    question_count = db.questions.count_documents(
        {"test_id": ObjectId(test_id)}
    )

    if question_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot publish test without questions",
        )

    result = db.tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {
            "status": "published",
            "published_at": datetime.utcnow(),
        }},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")

    return {"message": "Test published"}

@router.patch("/{test_id}/draft")
def unpublish_test(test_id: str, _: dict = Body(default={})):
    db = get_db()

    result = db.tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {
            "status": "draft",
            "published_at": None,
        }},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")

    return {"message": "Test moved to draft"}

@router.delete("delete/{test_id}")
def delete_test(test_id: str):
    db = get_db()

    oid = ObjectId(test_id)

    # delete answers
    db.submission_answers.delete_many({"test_id": oid})

    # delete submissions
    db.submissions.delete_many({"test_id": oid})

    # delete questions
    db.questions.delete_many({"test_id": oid})

    # delete test
    result = db.tests.delete_one({"_id": oid})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")

    return {"message": "Test and related data deleted"}