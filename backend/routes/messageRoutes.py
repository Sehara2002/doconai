from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId
from schemas.messageSchema import MessageCreate, MessageResponse
from services import messageService
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from util.gemini import get_ai_reply
from typing import Optional

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise credentials_exception

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

router = APIRouter(tags=["Messages"], prefix="/messages")

def validate_object_id(id: str) -> ObjectId:
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    return ObjectId(id)

@router.get("/{session_id}", response_model=list[MessageResponse])
async def get_messages(
    session_id: str,
    skip: int = 0,
    limit: int = 100,
    # user: dict = Depends(get_current_user)
):
    try:
        session_oid = validate_object_id(session_id)
        messages = await messageService.get_messages_by_session(session_oid, skip, limit)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load messages: {str(e)}")

@router.post("/addMessage", response_model=MessageResponse)
async def add_message(
    message: MessageCreate,
    # user: dict = Depends(get_current_user)
):
    try:
        # 1. Validate and set the session ObjectId
        session_oid = validate_object_id(message.session_id)
        
        # Create a copy of the message with validated session_id
        message_data = message.model_copy()
        message_data.session_id = str(session_oid)
        
        # Handle reply_to_id - convert empty string to None
        if hasattr(message_data, 'reply_to_id') and message_data.reply_to_id == "":
            message_data.reply_to_id = None

        # 2. Save the user's message first
        user_message = await messageService.create_message(message_data)

        # 3. Only generate AI reply if the sender is 'user'
        if message.sender == "user":
            try:
                # Generate a reply using the AI
                prompt = message.content
                ai_reply = get_ai_reply(prompt)

                # 4. Create a new MessageCreate instance for the reply
                reply_message = MessageCreate(
                    session_id=str(session_oid),
                    sender="bot",
                    content=ai_reply,
                    reply_to_id=user_message.get("id") if isinstance(user_message, dict) else str(user_message.id)
                )
                
                # 5. Save the reply message
                await messageService.create_message(reply_message)
                
            except Exception as ai_error:
                # Log the AI error but don't fail the entire request
                print(f"AI reply generation failed: {str(ai_error)}")
                # Continue without AI reply

        # 6. Return the user message
        return user_message

    except ValueError as ve:
        # Handle validation errors
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Handle other errors
        print(f"Error in add_message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")

@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    message: MessageCreate,
    user: dict = Depends(get_current_user)
):
    try:
        message_oid = validate_object_id(message_id)
        session_oid = validate_object_id(message.session_id)
        
        # Create a copy and update session_id
        message_data = message.model_copy()
        message_data.session_id = str(session_oid)
        
        updated = await messageService.update_message(message_oid, message_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Message not found")
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update message: {str(e)}")

@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    user: dict = Depends(get_current_user)
):
    try:
        message_oid = validate_object_id(message_id)
        deleted = await messageService.delete_message(message_oid)
        if not deleted:
            raise HTTPException(status_code=404, detail="Message not found")
        return {"detail": "Message deleted successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete message: {str(e)}")

# Additional utility endpoint to get a single message by ID
@router.get("/message/{message_id}", response_model=MessageResponse)
async def get_message_by_id(
    message_id: str,
    # user: dict = Depends(get_current_user)
):
    try:
        message_oid = validate_object_id(message_id)
        message = await messageService.get_message_by_id(message_oid)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        return message
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get message: {str(e)}")