from fastapi import APIRouter, Depends, HTTPException, status
from models.session import SessionCreate, SessionResponse,SessionsList
from services.sessionServices import create_session, get_session_by_id,get_sessions_by_user
from .auth import get_current_user_from_token

router = APIRouter(tags=["Sessions"], prefix="/sessions")

@router.get("/", response_model=SessionsList)  # Changed to SessionsList
async def get_user_sessions(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get all sessions for the current user"""
    try:
        user_id = current_user["id"]
        sessions = await get_sessions_by_user(user_id)
        return SessionsList(sessions=sessions)  # Wrap in SessionsList model
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sessions: {str(e)}"
        )
        
@router.post("/create", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_new_session(
    session_data: SessionCreate,
    current_user: dict = Depends(get_current_user_from_token)
):
    try:
        user_id = current_user["id"]
        session_id = await create_session(user_id, session_data.title)
        return {
            "message": "Session created successfully",
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Session creation failed: {str(e)}"
        )



