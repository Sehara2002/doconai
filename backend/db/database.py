import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI","mongodb+srv://Thanuka:2002@cluster0.m2mrpxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DB_NAME = os.getenv("DB_NAME","LawganIdealize2025")

if not MONGO_URI:
    raise EnvironmentError("❌ MONGO_URI environment variable is not set.")
if not DB_NAME:
    raise EnvironmentError("❌ DB_NAME environment variable is not set.")


client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
sessions_collection = db["sessions"]
messages_collection = db["messages"]

async def connect_to_mongo():
    print("📦 Connected to MongoDB!")

async def close_mongo_connection():
    client.close()
    print("🔌 Disconnected from MongoDB!")
