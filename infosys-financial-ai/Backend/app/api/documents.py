# MARK: Imports
import uuid
import os
import logging
import aiofiles
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile, File, Form, status, Query, HTTPException
from app.schemas import DocumentResponse, DocumentListResponse
from app.core.database import get_db
from app.core.security import get_current_user_token
from app.agents.document_agent import DocumentProcessor

logger = logging.getLogger(__name__)

# MARK: Constants
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# MARK: Router Setup
router = APIRouter(prefix="/documents", tags=["Financial Documents"])

# MARK: Endpoints
async def _run_document_processor(doc_id: str, file_path: str):
    """Background task: runs the full PDF parsing → chunking → embedding → MongoDB pipeline.
    Updates the document status to INDEXED on success or FAILED on error.
    """
    db = get_db()
    docs_col = db["documents"]
    try:
        logger.info(f"[BG] Starting DocumentProcessor for {doc_id}")
        result = await DocumentProcessor.process_document(doc_id, file_path)
        chunks_count = result.get("chunks_extracted", 0) + result.get("tables_extracted", 0)
        await docs_col.update_one(
            {"_id": doc_id},
            {"$set": {"status": "INDEXED", "chunks_count": chunks_count}}
        )
        logger.info(f"[BG] Document {doc_id} indexed successfully — {chunks_count} chunks stored.")
    except Exception as e:
        logger.error(f"[BG] DocumentProcessor failed for {doc_id}: {e}")
        await docs_col.update_one(
            {"_id": doc_id},
            {"$set": {"status": "FAILED"}}
        )


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    workspace_id: str = Form(...),
    company_name: str = Form("Infosys Limited"),
    filing_type: str = Form("Annual Report"),
    fiscal_year: int = Form(2024),
    token_data: dict = Depends(get_current_user_token)
):
    user_id = token_data.get("sub")
    db = get_db()
    ws_col = db["workspaces"]
    docs_col = db["documents"]
    
    ws = await ws_col.find_one({"_id": workspace_id, "user_id": user_id})
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    file_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, file_filename)
    
    content = await file.read()
    file_size = len(content)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        await out_file.write(content)
    
    doc = {
        "_id": doc_id,
        "title": file.filename,
        "company_name": company_name or "Unknown Company",
        "filing_type": filing_type or "Financial Filing",
        "fiscal_year": int(fiscal_year) if fiscal_year else 2024,
        "workspace_id": workspace_id,
        "user_id": user_id,
        "file_path": f"uploads/{file_filename}",
        "file_size": file_size,
        # Status starts as PROCESSING — background task will update it to INDEXED or FAILED
        "status": "PROCESSING",
        "is_seed": False,
        "chunks_count": 0,
        "uploaded_at": now_str
    }
    
    await docs_col.insert_one(doc)
    
    await ws_col.update_one(
        {"_id": workspace_id},
        {"$inc": {"documents_count": 1}, "$set": {"updated_at": now_str}}
    )

    # Kick off the Document Agent pipeline in the background (non-blocking)
    background_tasks.add_task(_run_document_processor, doc_id, file_path)
    
    return DocumentResponse(
        id=doc_id,
        title=doc["title"],
        company_name=doc["company_name"],
        filing_type=doc["filing_type"],
        fiscal_year=doc["fiscal_year"],
        workspace_id=doc["workspace_id"],
        user_id=doc["user_id"],
        file_path=doc["file_path"],
        file_size=doc["file_size"],
        status=doc["status"],
        is_seed=doc["is_seed"],
        chunks_count=doc["chunks_count"],
        uploaded_at=doc["uploaded_at"]
    )

@router.get("", response_model=DocumentListResponse)
@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    workspace_id: Optional[str] = Query(None),
    token_data: dict = Depends(get_current_user_token)
):
    user_id = token_data.get("sub")
    db = get_db()
    docs_col = db["documents"]
    
    query = {"user_id": user_id}
    if workspace_id:
        query["workspace_id"] = workspace_id
        
    cursor = docs_col.find(query).sort("uploaded_at", -1)
    items = []
    async for doc in cursor:
        items.append(DocumentResponse(
            id=doc["_id"],
            title=doc["title"],
            company_name=doc["company_name"],
            filing_type=doc["filing_type"],
            fiscal_year=doc["fiscal_year"],
            workspace_id=doc["workspace_id"],
            user_id=doc["user_id"],
            file_path=doc["file_path"],
            file_size=doc["file_size"],
            status=doc["status"],
            is_seed=doc.get("is_seed", False),
            chunks_count=doc.get("chunks_count", 0),
            uploaded_at=doc["uploaded_at"]
        ))
    return DocumentListResponse(documents=items, total=len(items))

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    docs_col = db["documents"]
    
    doc = await docs_col.find_one({"_id": document_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    return DocumentResponse(
        id=doc["_id"],
        title=doc["title"],
        company_name=doc["company_name"],
        filing_type=doc["filing_type"],
        fiscal_year=doc["fiscal_year"],
        workspace_id=doc["workspace_id"],
        user_id=doc["user_id"],
        file_path=doc["file_path"],
        file_size=doc["file_size"],
        status=doc["status"],
        is_seed=doc.get("is_seed", False),
        chunks_count=doc.get("chunks_count", 0),
        uploaded_at=doc["uploaded_at"]
    )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    docs_col = db["documents"]
    ws_col = db["workspaces"]
    
    doc = await docs_col.find_one({"_id": document_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    await docs_col.delete_one({"_id": document_id})
    
    if doc.get("workspace_id"):
        await ws_col.update_one(
            {"_id": doc["workspace_id"]},
            {"$inc": {"documents_count": -1}}
        )
        
    return None
