import asyncio
import sys
import os
from pathlib import Path

from dotenv import load_dotenv

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load .env BEFORE importing any app modules
load_dotenv(backend_dir / ".env")

from app.agents.extraction_agent import ExtractionProcessor
from app.core.database import DatabaseManager

async def test():
    # 1. Init DB connection
    await DatabaseManager.connect_db()

    # 2. Process the extraction using the dummy document id we used in document_agent
    doc_id = "test_doc_agent_sample1"
    
    # Let's use Apple Inc based on the document output we saw earlier
    company_name = "Apple Inc"
    
    print(f"\nProcessing extraction for document ID: {doc_id} ({company_name}) ...")
    
    try:
        result = await ExtractionProcessor.process_extraction(doc_id, company_name)
        print("\n=== EXTRACTION RESULT ===")
        print(result)
    except Exception as e:
        print(f"Extraction failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())
