from pydantic import BaseModel
from datetime import datetime

class SessionCreate(BaseModel):
    user_id: str
    title: str

class SessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime