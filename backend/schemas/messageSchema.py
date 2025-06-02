from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MessageCreate(BaseModel):
    session_id: str
    sender: str
    content: str
    reply_to_id: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    session_id: str
    sender: str
    content: str
    timestamp: datetime
    reply_to_id: Optional[str] = None