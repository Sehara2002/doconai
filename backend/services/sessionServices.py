from datetime import datetime
from db.database import sessions_collection
from models.session import SessionResponse
from bson import ObjectId
from typing import List

async def create_session(user_id: str, title: str) -> str:
    session_data = {
        "user_id": user_id,
        "title": title,
        "created_at": datetime.utcnow()
    }
    result = await sessions_collection.insert_one(session_data)
    return str(result.inserted_id)

async def get_session_by_id(session_id: str, user_id: str):
    session = await sessions_collection.find_one(
        {"_id": ObjectId(session_id), "user_id": user_id}
    )
    if not session:
        return None
    session["_id"] = str(session["_id"])
    return session

async def get_sessions_by_user(user_id: str) -> List[SessionResponse]:
    """Get all sessions for a specific user"""
    sessions = []
    async for doc in sessions_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1):
        # Convert MongoDB document to SessionResponse model
        sessions.append(SessionResponse(
            id=str(doc["_id"]),  # Convert ObjectId to string
            title=doc["title"],
            created_at=doc["created_at"]
        ))
    return sessions