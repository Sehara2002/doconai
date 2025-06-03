from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
from bson import ObjectId

class SessionCreate(BaseModel):
    title: str

class SessionResponse(BaseModel):
    id: str  # Remove alias
    title: str
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SessionsList(BaseModel):
    sessions: List[SessionResponse]