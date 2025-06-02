from db.database import db
from schemas.userSchema import UserCreate

async def create_user(user: UserCreate):
    result = await db.users.insert_one(user.dict())
    return str(result.inserted_id)