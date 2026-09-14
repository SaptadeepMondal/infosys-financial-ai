import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class DatabaseManager:
    client = None
    db = None

    @classmethod
    async def connect_db(cls):
        if not settings.MONGODB_URI:
            raise ValueError("MONGODB_URI is not set in environment variables.")
            
        try:
            logger.info("Connecting to MongoDB...")
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
            await cls.client.admin.command('ping')
            cls.db = cls.client[settings.DATABASE_NAME]
            logger.info("Successfully connected to live MongoDB.")
        except Exception as e:
            logger.error(f"Could not connect to MongoDB: {e}")
            raise e

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")

def get_db():
    if DatabaseManager.db is None:
        raise Exception("Database is not initialized. Call connect_db first.")
    return DatabaseManager.db
