import asyncio
import sys
from pathlib import Path

# Add Backend directory to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.agents.extraction_agent import ExtractionProcessor
from app.core.database import get_db, DatabaseManager as db_manager


async def test():
    # Connect to database first
    await db_manager.connect_db()
    db = get_db()
    
    # Automatically find a document that was already uploaded
    doc = await db["documents"].find_one({})
    
    if not doc:
        print("❌ No documents found. Upload one first via the app!")
        return
    
    doc_id = doc["_id"]
    company_name = doc.get("company_name", "Unknown")
    
    print(f"✓ Testing with: {doc_id} ({company_name})")
    result = await ExtractionProcessor.process_extraction(doc_id, company_name)
    print(result)

asyncio.run(test())