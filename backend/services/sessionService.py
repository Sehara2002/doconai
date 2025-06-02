from db.database import db
from schemas.chatSessionSchema import SessionCreate
from datetime import datetime

async def create_session(session: SessionCreate):
    session_data = session.dict()
    session_data["created_at"] = datetime.utcnow()
    result = await db.sessions.insert_one(session_data)
    return str(result.inserted_id)

async def get_sessions_by_user(user_id: str):
    sessions = []
    async for session in db.sessions.find({"user_id": user_id}):
        session["id"] = str(session["_id"])
        sessions.append(session)
    return sessions