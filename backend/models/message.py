from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    session_id: str
    sender: str  # Should be 'user' or 'bot'
    content: str
    reply_to_id: Optional[str] = None

class MessageResponse(BaseModel):
    id: Optional[str] = Field(alias="_id")
    session_id: str
    sender: str
    content: str
    timestamp: datetime
    reply_to_id: Optional[str] = None






# from pydantic import BaseModel, Field
# from typing import Optional
# from datetime import datetime

# class Message(BaseModel):
#     id: Optional[str] = Field(alias="_id")
#     session_id: str
#     sender: str  
#     content: str
#     timestamp: datetime
#     reply_to_id: Optional[str] = None