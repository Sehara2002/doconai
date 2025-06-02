from fastapi import APIRouter
from schemas.chatSessionSchema import SessionCreate, SessionResponse
from services import sessionService

router = APIRouter(tags=["Sessions"], prefix="/sessions")

@router.post("/", response_model=dict)
async def create_session(session: SessionCreate):
    session_id = await sessionService.create_session(session)
    return {"message": "Session created", "session_id": session_id}

@router.get("/{user_id}", response_model=list[SessionResponse])
async def get_sessions(user_id: str):
    return await sessionService.get_sessions_by_user(user_id)