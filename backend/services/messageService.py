from db.database import messages_collection
from bson import ObjectId
from datetime import datetime
from schemas.messageSchema import MessageCreate

async def get_messages_by_session(session_id: ObjectId, skip: int = 0, limit: int = 100):
    messages = await messages_collection.find({"session_id": str(session_id)}) \
        .sort("timestamp", 1) \
        .skip(skip) \
        .limit(limit) \
        .to_list(length=None)
    return [serialize_message(msg) for msg in messages]

async def create_message(message: MessageCreate):
    message_dict = message.dict()
    message_dict["timestamp"] = datetime.utcnow()
    result = await messages_collection.insert_one(message_dict)
    new_message = await messages_collection.find_one({"_id": result.inserted_id})
    return serialize_message(new_message)

async def update_message(message_id: ObjectId, message: MessageCreate):
    # Preserve original timestamp
    original = await messages_collection.find_one({"_id": message_id})
    if not original:
        return None
        
    update_data = message.dict()
    update_data["timestamp"] = original["timestamp"]
    
    updated = await messages_collection.find_one_and_update(
        {"_id": message_id},
        {"$set": update_data},
        return_document=True
    )
    return serialize_message(updated) if updated else None

async def delete_message(message_id: ObjectId):
    result = await messages_collection.delete_one({"_id": message_id})
    return result.deleted_count > 0

def serialize_message(message) -> dict:
    if message:
        return {
            "id": str(message["_id"]),
            "session_id": message["session_id"],
            "sender": message["sender"],
            "content": message["content"],
            "reply_to_id": message.get("reply_to_id", None),  # default None if missing
            "timestamp": message["timestamp"],
        }
    return None
