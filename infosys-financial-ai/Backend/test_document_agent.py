import asyncio
import sys
import os
from pathlib import Path
import pymupdf

from dotenv import load_dotenv

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load .env BEFORE importing any app modules
load_dotenv(backend_dir / ".env")

from app.agents.document_agent import DocumentProcessor
from app.core.database import get_db, DatabaseManager

async def test():
    print("Connecting to DB...")
    await DatabaseManager.connect_db()
    
    # 1. Use the existing sample PDF file
    dummy_pdf_path = "sample1.pdf"
    
    if not os.path.exists(dummy_pdf_path):
        print(f"File not found: {dummy_pdf_path}")
        return

    try:
        # 2. Process the document
        doc_id = "test_doc_agent_sample1"
        print(f"\nProcessing document ID: {doc_id} ...")
        result = await DocumentProcessor.process_document(doc_id, dummy_pdf_path)
        
        print("\n=== PROCESSING RESULT ===")
        print(result)
        
        # 3. Verify in MongoDB
        db = get_db()
        collection = db["parsed_chunks"]
        chunks = await collection.find({"document_id": doc_id}).to_list(length=100)
        
        print(f"\n=== DB VERIFICATION ===")
        print(f"Found {len(chunks)} chunks in DB for document {doc_id}.")
        for idx, chunk in enumerate(chunks):
            has_embedding = "embedding" in chunk and chunk["embedding"] is not None
            text_preview = chunk["text"][:50].replace("\n", " ") + "..."
            print(f"Chunk {idx+1}: type={chunk['type']}, has_embedding={has_embedding}, text='{text_preview}'")
            
    except Exception as e:
        print(f"Failed during processing: {e}")

if __name__ == "__main__":
    asyncio.run(test())
