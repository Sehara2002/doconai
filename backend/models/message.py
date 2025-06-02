from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Message(BaseModel):
    id: Optional[str] = Field(alias="_id")
    session_id: str
    sender: str  
    content: str
    timestamp: datetime
    reply_to_id: Optional[str] = None