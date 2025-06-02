from pydantic import BaseModel, Field
from typing import Optional

class ChatSession(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    title: str