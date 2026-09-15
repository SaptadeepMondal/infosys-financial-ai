import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class DatabaseManager:
    client = None
    db = None

    @classmethod
    async def connect_db(cls):
        uri = settings.MONGODB_URI or ""
        
        # Check if URI contains unconfigured placeholders
        is_placeholder = "<username>" in uri or "<password>" in uri or "<cluster-url>" in uri or not uri

        if not is_placeholder:
            try:
                logger.info("Connecting to live MongoDB...")
                cls.client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=3000)
                await cls.client.admin.command('ping')
                cls.db = cls.client[settings.DATABASE_NAME]
                logger.info("Successfully connected to live MongoDB.")
                return
            except Exception as e:
                logger.warning(f"Could not connect to live MongoDB: {e}. Switching to in-memory MongoDB fallback.")

        # Fallback in-memory MongoDB mock client for offline / demo testing
        import mongomock_motor
        logger.info("Initializing in-memory MongoDB mock engine...")
        cls.client = mongomock_motor.AsyncMongoMockClient()
        cls.db = cls.client[settings.DATABASE_NAME]
        logger.info("In-memory MongoDB initialized successfully.")

    @classmethod
    async def close_db(cls):
        if cls.client:
            try:
                cls.client.close()
            except Exception:
                pass
            logger.info("MongoDB connection closed.")

def get_db():
    if DatabaseManager.db is None:
        import mongomock_motor
        DatabaseManager.client = mongomock_motor.AsyncMongoMockClient()
        DatabaseManager.db = DatabaseManager.client[settings.DATABASE_NAME or "infosys_financial_ai"]
    return DatabaseManager.db
