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
from app.services.document_context import load_workspace_context

router = APIRouter(prefix="/analysis", tags=["Analysis Engine"])

class AnalysisRequest(BaseModel):
    workspace_id: str
    query: Optional[str] = None
    company_name: Optional[str] = "Infosys Limited"

async def run_analysis_pipeline_task(report_id: str, document_id: str, query: str, company_name: str, document_text: str):
    """
    Background task to run the CrewAI pipeline and update the database.
    """
    db = get_db()
    reports_col = db["reports"]
    
    try:
        # Run the compute-heavy CrewAI pipeline in a thread to avoid blocking the event loop
        result_sections = await asyncio.to_thread(
            FinancialCrewRunner.run_pipeline,
            document_id=document_id,
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
                    "summary": result_sections.executive_summary,
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
    
    # 1. Validate workspace and load the actual indexed filing chunks.
    ws_col = db["workspaces"]
    docs_col = db["documents"]
    
    workspace = await ws_col.find_one({"_id": request.workspace_id, "user_id": user_id})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    source_documents, document_text, _ = await load_workspace_context(
        db, request.workspace_id, user_id, request.company_name
    )
    if not source_documents or not document_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No indexed document chunks are available for this workspace and company.",
        )
        
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
        document_id=source_documents[0]["_id"],
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
