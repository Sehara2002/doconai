from fastapi import APIRouter, HTTPException
from schemas.messageSchema import MessageCreate, MessageResponse
from services import messageService

router = APIRouter(tags=["Messages"], prefix="/messages")

@router.get("/{session_id}", response_model=list[MessageResponse])
async def get_messages(session_id: str):
    return await messageService.get_messages_by_session(session_id)

@router.post("/", response_model=MessageResponse)
async def add_message(message: MessageCreate):
    return await messageService.create_message(message)

@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(message_id: str, message: MessageCreate):
    updated = await messageService.update_message(message_id, message)
    if not updated:
        raise HTTPException(status_code=404, detail="Message not found")
    return updated

@router.delete("/{message_id}")
async def delete_message(message_id: str):
    deleted = await messageService.delete_message(message_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"detail": "Message deleted"}
