from db.database import db
from schemas.messageSchema import MessageCreate
from datetime import datetime

async def create_message(message: MessageCreate):
    message_data = message.dict()
    message_data["timestamp"] = datetime.utcnow()
    result = await db.messages.insert_one(message_data)
    return str(result.inserted_id)

async def get_messages_by_session(session_id: str):
    messages = []
    async for message in db.messages.find({"session_id": session_id}).sort("timestamp", 1):
        message["id"] = str(message["_id"])
        messages.append(message)
    return messages