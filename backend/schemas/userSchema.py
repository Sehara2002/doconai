from datetime import date
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str
    birthday: date

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserInDB(UserBase):
    hashed_password: str

class UserOut(UserBase):
    id: str

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str