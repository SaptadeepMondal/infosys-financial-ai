import os
import uuid
import time
import json
import logging
from openai import AsyncOpenAI
import pymupdf
import pandas as pd
from crewai import Agent, Task, Crew
from app.core.database import get_db

logger = logging.getLogger(__name__)

# ============================================================
# CONSTANTS & CONFIGURATION
# ============================================================
COLLECTION_CHUNKS = "parsed_chunks"
# Assuming standard overlapping chunks
CHUNK_SIZE = 4000
OVERLAP = 400

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = OVERLAP):
    chunks = []
    if not text:
        return chunks
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = end - overlap
    return chunks

class DocumentProcessor:
    @staticmethod
    async def process_document(document_id: str, file_path: str):
        logger.info(f"Starting optimized document processing for {document_id}")
        client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_API_BASE")
)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        # 1. Extract text and tables using PyMuPDF
        pdf = pymupdf.open(file_path)
        pages_text = []
        tables_data = []

        for page_num in range(len(pdf)):
            page = pdf[page_num]
            text = page.get_text("text")
            pages_text.append({"page_number": page_num + 1, "text": text})
            
            # Fast table extraction
            try:
                tabs = page.find_tables()
                if tabs and tabs.tables:
                    for t_idx, tab in enumerate(tabs.tables):
                        df = tab.to_pandas()
                        if not df.empty:
                            csv_str = df.to_csv(index=False)
                            tables_data.append({
                                "page_number": page_num + 1,
                                "table_number": t_idx + 1,
                                "content": csv_str
                            })
            except Exception as e:
                logger.warning(f"Failed to extract tables on page {page_num + 1}: {e}")

        pdf.close()

        # 2. Chunk text
        chunks = []
        current_section = "General"
        
        for page in pages_text:
            text = page["text"]
            if not text.strip(): continue
            
            page_chunks = chunk_text(text)
            for pc in page_chunks:
                chunks.append({
                    "chunk_id": str(uuid.uuid4()),
                    "document_id": document_id,
                    "page_number": page["page_number"],
                    "section_type": current_section,
                    "text": pc,
                    "type": "text_chunk"
                })
                
        # 3. Add tables as chunks too
        for tab in tables_data:
            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "document_id": document_id,
                "page_number": tab["page_number"],
                "section_type": "Table",
                "text": tab["content"],
                "type": "table_chunk"
            })
            
        if not chunks:
            logger.warning(f"No chunks extracted from document {document_id}")
            return {"status": "success", "chunks_extracted": 0, "tables_extracted": len(tables_data)}

        # 4. Generate Embeddings (parallelized)
        logger.info(f"Generating embeddings for {len(chunks)} chunks...")
        import asyncio
        
        async def embed_chunk(chunk):
            try:
                res = await client.embeddings.create(input=chunk["text"], model="openai/text-embedding-3-small")
                chunk["embedding"] = res.data[0].embedding
            except Exception as e:
                logger.error(f"Embedding failed for chunk {chunk['chunk_id']}: {e}")
                chunk["embedding"] = None
            return chunk

        # Process embeddings in batches to respect rate limits
        batch_size = 50
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            await asyncio.gather(*(embed_chunk(c) for c in batch))

        # 5. Save to MongoDB
        db = get_db()
        collection = db[COLLECTION_CHUNKS]
        
        # Clear existing chunks for this document to avoid duplicates
        await collection.delete_many({"document_id": document_id})
        
        # Insert new chunks
        valid_chunks = [c for c in chunks if c.get("embedding") is not None]
        if valid_chunks:
            await collection.insert_many(valid_chunks)
            
        logger.info(f"Successfully processed and stored {len(valid_chunks)} chunks for {document_id}")
        
        return {
            "status": "success",
            "chunks_extracted": len([c for c in valid_chunks if c["type"] == "text_chunk"]),
            "tables_extracted": len([c for c in valid_chunks if c["type"] == "table_chunk"]),
            "document_id": document_id
        }

# Agent definition for CrewAI (if still needed)
document_agent = Agent(
    role="Financial Document Processing Specialist",
    goal="Process uploaded financial documents into vectorized database chunks.",
    backstory="You process PDF filings and prepare structured context in the vector database.",
    verbose=True,
    allow_delegation=False
)