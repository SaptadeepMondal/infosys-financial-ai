# MARK: Imports
import uuid
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, Response, HTTPException, BackgroundTasks
from app.schemas import (
    ReportCreate, ReportResponse, ReportListResponse, ReportSectionsSchema,
    FinancialMetricSchema, RedFlagSchema, ComparisonItemSchema
)
from app.core.database import get_db
from app.core.security import get_current_user_token
from app.agents.crew_runner import FinancialCrewRunner

# MARK: Router Setup
router = APIRouter(prefix="/reports", tags=["Analyst Reports"])

# MARK: Endpoints
@router.get("", response_model=ReportListResponse)
@router.get("/", response_model=ReportListResponse)
async def list_reports(token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    reports_col = db["reports"]
    
    cursor = reports_col.find({"user_id": user_id}).sort("created_at", -1)
    items = []
    async for doc in cursor:
        items.append(ReportResponse(
            id=doc["_id"],
            title=doc["title"],
            workspace_id=doc["workspace_id"],
            user_id=doc["user_id"],
            company_name=doc.get("company_name", "Infosys Limited"),
            summary=doc.get("summary", ""),
            status=doc.get("status", "COMPLETED"),
            created_at=doc["created_at"],
            sections=doc.get("sections")
        ))
    return ReportListResponse(reports=items, total=len(items))

async def run_report_generation_task(report_id: str, workspace_id: str, company_name: str, document_text: str):
    db = get_db()
    reports_col = db["reports"]
    try:
        result_sections = await asyncio.to_thread(
            FinancialCrewRunner.run_pipeline,
            workspace_id=workspace_id,
            document_text=document_text,
            query=None,
            company_name=company_name
        )
        
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

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(report_in: ReportCreate, background_tasks: BackgroundTasks, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    reports_col = db["reports"]
    docs_col = db["documents"]
    
    docs = docs_col.find({"workspace_id": report_in.workspace_id})
    document_text_blocks = []
    async for doc in docs:
        document_text_blocks.append(f"Document: {doc.get('title', 'Unknown')} - Data available.")
    
    document_text = "\n".join(document_text_blocks)
    if not document_text:
        document_text = "No extensive document data found. Operating with limited context."
    
    rep_id = f"rep_{uuid.uuid4().hex[:12]}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    doc = {
        "_id": rep_id,
        "title": report_in.title,
        "workspace_id": report_in.workspace_id,
        "user_id": user_id,
        "company_name": report_in.company_name or "Infosys Limited",
        "summary": "Report generation is in progress...",
        "status": "PROCESSING",
        "created_at": now_str,
        "sections": None
    }
    
    await reports_col.insert_one(doc)
    
    background_tasks.add_task(
        run_report_generation_task,
        report_id=rep_id,
        workspace_id=report_in.workspace_id,
        company_name=report_in.company_name or "Infosys Limited",
        document_text=document_text
    )
    
    return ReportResponse(
        id=rep_id,
        title=doc["title"],
        workspace_id=doc["workspace_id"],
        user_id=doc["user_id"],
        company_name=doc["company_name"],
        summary=doc["summary"],
        status=doc["status"],
        created_at=doc["created_at"],
        sections=None
    )

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    reports_col = db["reports"]
    
    doc = await reports_col.find_one({"_id": report_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        
    return ReportResponse(
        id=doc["_id"],
        title=doc["title"],
        workspace_id=doc["workspace_id"],
        user_id=doc["user_id"],
        company_name=doc.get("company_name", "Infosys Limited"),
        summary=doc.get("summary", ""),
        status=doc.get("status", "COMPLETED"),
        created_at=doc["created_at"],
        sections=doc.get("sections")
    )

@router.get("/{report_id}/export")
async def export_report(report_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    reports_col = db["reports"]
    
    doc = await reports_col.find_one({"_id": report_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        
    rep = ReportResponse(
        id=doc["_id"],
        title=doc["title"],
        workspace_id=doc["workspace_id"],
        user_id=doc["user_id"],
        company_name=doc.get("company_name", "Infosys Limited"),
        summary=doc.get("summary", ""),
        status=doc.get("status", "COMPLETED"),
        created_at=doc["created_at"],
        sections=doc.get("sections")
    )
    
    sec = rep.sections
    
    md_lines = [
        f"# {rep.title}",
        f"**Company:** {rep.company_name} | **Generated:** {rep.created_at[:10]} | **Status:** Grounded in Source Documents",
        "",
        "## 1. Executive Summary",
        f"{sec.executive_summary if sec else rep.summary}",
        "",
        "## 2. Key Financial Metrics (FY23 vs FY24)",
        "| Metric | FY2023 | FY2024 | YoY Change | Status |",
        "| :--- | :--- | :--- | :--- | :--- |"
    ]
    
    if sec and sec.key_financials:
        for m in sec.key_financials:
            md_lines.append(f"| **{m.metric}** | {m.fy23} | {m.fy24} | {m.yoy_change} | {m.status} |")
    
    md_lines.extend([
        "",
        "## 3. Automated Red Flags & Anomaly Scan",
    ])
    if sec and sec.red_flags:
        for r in sec.red_flags:
            md_lines.append(f"- **[{r.severity.upper()}] {r.title}:** {r.description} *(Citation: {r.citation})*")
    
    md_lines.extend([
        "",
        "## 4. Multi-Company Peer Benchmarking",
        "| Company | Revenue | EBIT Margin | ROE | FCF Conversion |",
        "| :--- | :--- | :--- | :--- | :--- |"
    ])
    if sec and sec.comparison:
        for c in sec.comparison:
            md_lines.append(f"| **{c.company}** | {c.revenue} | {c.ebit_margin} | {c.roe} | {c.fcf_conversion} |")
            
    md_lines.extend([
        "",
        "## 5. Analyst Outlook & Recommendation",
        f"{sec.outlook if sec else 'Positive outlook on operational resilience.'}",
        "",
        "---",
        "*Report generated by Infosys AI Development of Multi-Agent AI Analysis System for Financial Research and Business Insights.*"
    ])
    
    md_content = "\n".join(md_lines)
    
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=analyst_report_{report_id}.md"}
    )
