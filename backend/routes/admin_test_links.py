from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime
from models.test_link import TestLinkModel
from database import get_db
from schemas.test_link import (
    TestLinkCreateSchema,
    TestLinkUpdateSchema,
)

router = APIRouter(tags=["Admin Test Links"])


# =====================================================
# GET ALL TEST LINKS (ADMIN)
# =====================================================
@router.get("/test-links")
def get_all_test_links():
    db = get_db()

    links = list(db.test_links.find())

    return [
        {
            "id": str(l["_id"]),
            "title": l["title"],
            "url": l["url"],
            "active": l["active"],
        }
        for l in links
    ]


# =====================================================
# CREATE TEST LINK
# =====================================================
@router.post("/test-links")
def create_test_link(payload: TestLinkCreateSchema):
    db = get_db()

    link = TestLinkModel(
        title=payload.title,
        url=payload.url,
        active=payload.active,
    )

    result = db.test_links.insert_one(link.to_dict())

    return {"id": str(result.inserted_id)}


# =====================================================
# UPDATE TEST LINK
# =====================================================
@router.patch("/test-links/{link_id}")
def update_test_link(link_id: str, payload: TestLinkUpdateSchema):
    db = get_db()

    update_data = {}

    for key, value in payload.dict().items():
        if value is None:
            continue
        if key == "url":
            update_data[key] = str(value)
        else:
            update_data[key] = value


    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No data provided for update",
        )

    result = db.test_links.update_one(
        {"_id": ObjectId(link_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Test link not found",
        )

    return {"message": "Test link updated"}


# =====================================================
# DELETE TEST LINK
# =====================================================
@router.delete("/test-links/{link_id}")
def delete_test_link(link_id: str):
    db = get_db()

    result = db.test_links.delete_one(
        {"_id": ObjectId(link_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Test link not found",
        )

    return {"message": "Test link deleted"}
