from datetime import date
from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str
    birthday: date

    @validator('birthday', pre=True)
    def parse_birthday(cls, value):
        if isinstance(value, str):
            # Convert ISO string to date object
            return date.fromisoformat(value)
        return value

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
    

class UserLogin(BaseModel):
    email: EmailStr
    password: str