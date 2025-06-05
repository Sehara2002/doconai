from db.database import messages_collection
from bson import ObjectId
from datetime import datetime
from schemas.messageSchema import MessageCreate



def serialize_message(message) -> dict:
    message["_id"] = str(message["_id"])
    return message

async def get_messages_by_session(session_id: str):
    messages = await messages_collection.find({"session_id": session_id}).to_list(length=100)
    return [serialize_message(msg) for msg in messages]

async def create_message(message: MessageCreate):
    message_dict = message.dict()
    message_dict["timestamp"] = datetime.utcnow()
    result = await messages_collection.insert_one(message_dict)
    message_dict["_id"] = str(result.inserted_id)
    return message_dict

async def update_message(message_id: str, message: MessageCreate):
    updated = await messages_collection.find_one_and_update(
        {"_id": ObjectId(message_id)},
        {"$set": message.dict()},
        return_document=True
    )
    return serialize_message(updated) if updated else None

async def delete_message(message_id: str):
    result = await messages_collection.delete_one({"_id": ObjectId(message_id)})
    return result.deleted_count > 0



# from db.database import db
# from schemas.messageSchema import MessageCreate
# from datetime import datetime

# async def create_message(message: MessageCreate):
#     message_data = message.dict()
#     message_data["timestamp"] = datetime.utcnow()
#     result = await db.messages.insert_one(message_data)
#     return str(result.inserted_id)

# async def get_messages_by_session(session_id: str):
#     messages = []
#     async for message in db.messages.find({"session_id": session_id}).sort("timestamp", 1):
#         message["id"] = str(message["_id"])
#         messages.append(message)
#     return messages