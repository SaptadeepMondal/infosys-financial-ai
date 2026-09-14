import uuid
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user_token
from app.schemas import ReportResponse
from app.agents.crew_runner import FinancialCrewRunner

router = APIRouter(prefix="/analysis", tags=["Analysis Engine"])

class AnalysisRequest(BaseModel):
    workspace_id: str
    query: Optional[str] = None
    company_name: Optional[str] = "Infosys Limited"

async def run_analysis_pipeline_task(report_id: str, workspace_id: str, query: str, company_name: str, document_text: str):
    """
    Background task to run the CrewAI pipeline and update the database.
    """
    db = get_db()
    reports_col = db["reports"]
    
    try:
        # Run the compute-heavy CrewAI pipeline in a thread to avoid blocking the event loop
        result_sections = await asyncio.to_thread(
            FinancialCrewRunner.run_pipeline,
            workspace_id=workspace_id,
            document_text=document_text,
            query=query,
            company_name=company_name
        )
        
        # Update report status to COMPLETED and attach sections
        await reports_col.update_one(
            {"_id": report_id},
            {
                "$set": {
                    "status": "COMPLETED",
                    "sections": result_sections.model_dump(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    except Exception as e:
        # Update report status to FAILED on exception
        await reports_col.update_one(
            {"_id": report_id},
            {
                "$set": {
                    "status": "FAILED",
                    "error": str(e),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

@router.post("/run", response_model=ReportResponse, status_code=status.HTTP_202_ACCEPTED)
async def trigger_analysis(
    request: AnalysisRequest, 
    background_tasks: BackgroundTasks,
    token_data: dict = Depends(get_current_user_token)
):
    user_id = token_data.get("sub")
    db = get_db()
    
    # 1. Validate workspace and fetch context (mocking document text aggregation for now)
    ws_col = db["workspaces"]
    docs_col = db["documents"]
    
    workspace = await ws_col.find_one({"_id": request.workspace_id, "user_id": user_id})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    # Aggregate text from documents in this workspace
    # In a real scenario, this would query vector DB or concatenate parsed chunks
    docs = docs_col.find({"workspace_id": request.workspace_id})
    document_text_blocks = []
    async for doc in docs:
        # Dummy content if real chunks are missing
        document_text_blocks.append(f"Document: {doc.get('title', 'Unknown')} - Data available.")
    
    document_text = "\n".join(document_text_blocks)
    if not document_text:
        document_text = "No extensive document data found. Operating with limited context."
        
    # 2. Create a pending report record
    reports_col = db["reports"]
    rep_id = f"rep_{uuid.uuid4().hex[:12]}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    report_doc = {
        "_id": rep_id,
        "title": f"Analysis Report - {request.company_name}",
        "workspace_id": request.workspace_id,
        "user_id": user_id,
        "company_name": request.company_name,
        "summary": "Report generation is in progress...",
        "status": "PROCESSING",
        "created_at": now_str,
        "updated_at": now_str
    }
    
    await reports_col.insert_one(report_doc)
    
    # 3. Schedule the background task
    background_tasks.add_task(
        run_analysis_pipeline_task,
        report_id=rep_id,
        workspace_id=request.workspace_id,
        query=request.query,
        company_name=request.company_name,
        document_text=document_text
    )
    
    return ReportResponse(
        id=rep_id,
        title=report_doc["title"],
        workspace_id=report_doc["workspace_id"],
        user_id=report_doc["user_id"],
        company_name=report_doc["company_name"],
        summary=report_doc["summary"],
        status=report_doc["status"],
        created_at=report_doc["created_at"],
        sections=None
    )
