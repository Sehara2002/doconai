from fastapi import APIRouter
from schemas.messageSchema import MessageCreate, MessageResponse
from services import messageService

router = APIRouter(tags=["Messages"], prefix="/messages")

@router.post("/", response_model=dict)
async def create_message(message: MessageCreate):
    message_id = await messageService.create_message(message)
    return {"message": "Message created", "message_id": message_id}

@router.get("/{session_id}", response_model=list[MessageResponse])
async def get_messages(session_id: str):
    return await messageService.get_messages_by_session(session_id)