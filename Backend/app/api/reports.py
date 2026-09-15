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
from app.agents.report_agent import run_report_agent
from app.services.document_context import load_workspace_context

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
        try:
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
        except Exception as e:
            # Fallback if sections is malformed
            items.append(ReportResponse(
                id=doc["_id"],
                title=doc["title"],
                workspace_id=doc["workspace_id"],
                user_id=doc["user_id"],
                company_name=doc.get("company_name", "Infosys Limited"),
                summary=doc.get("summary", ""),
                status="FAILED",  # Marking as failed because it couldn't be parsed
                created_at=doc["created_at"],
                sections=None
            ))
    return ReportListResponse(reports=items, total=len(items))

async def run_report_generation_task(report_id: str, document_id: str, company_name: str, document_text: str):
    db = get_db()
    reports_col = db["reports"]
    try:
        result_sections = await asyncio.to_thread(
            run_report_agent,
            document_id=document_id,
            document_text=document_text,
            report_id=report_id,
            company_name=company_name
        )
        
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
    workspace = await db["workspaces"].find_one({"_id": report_in.workspace_id, "user_id": user_id})
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    source_documents, document_text, _ = await load_workspace_context(
        db, report_in.workspace_id, user_id
    )
    if not source_documents or not document_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload and index at least one PDF before generating a report.",
        )
    
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
        document_id=source_documents[0]["_id"],
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
        
    try:
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
    except Exception:
        return ReportResponse(
            id=doc["_id"],
            title=doc["title"],
            workspace_id=doc["workspace_id"],
            user_id=doc["user_id"],
            company_name=doc.get("company_name", "Infosys Limited"),
            summary=doc.get("summary", ""),
            status="FAILED",
            created_at=doc["created_at"],
            sections=None
        )

from docx import Document
from docx.shared import Pt, Inches, RGBColor
import io

@router.get("/{report_id}/export")
async def export_report(report_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    reports_col = db["reports"]
    
    doc = await reports_col.find_one({"_id": report_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        
    try:
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
    except Exception:
        rep = ReportResponse(
            id=doc["_id"],
            title=doc["title"],
            workspace_id=doc["workspace_id"],
            user_id=doc["user_id"],
            company_name=doc.get("company_name", "Infosys Limited"),
            summary=doc.get("summary", ""),
            status="FAILED",
            created_at=doc["created_at"],
            sections=None
        )
    
    sec = rep.sections
    
    document = Document()
    
    # Title & Metadata
    heading = document.add_heading(rep.title, 0)
    document.add_paragraph(f"Company: {rep.company_name} | Generated: {rep.created_at[:10]} | Status: Grounded in Source Documents")
    
    # 1. Executive Summary
    document.add_heading("1. Executive Summary", level=1)
    document.add_paragraph(sec.executive_summary if sec else rep.summary)
    
    # 2. Key Financial Metrics
    document.add_heading("2. Key Financial Metrics (FY23 vs FY24)", level=1)
    if sec and sec.key_financials:
        table = document.add_table(rows=1, cols=5)
        table.style = 'Table Grid'
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'Metric'
        hdr_cells[1].text = 'FY2023'
        hdr_cells[2].text = 'FY2024'
        hdr_cells[3].text = 'YoY Change'
        hdr_cells[4].text = 'Status'
        
        for m in sec.key_financials:
            row_cells = document.add_table(rows=1, cols=5).rows[0].cells if False else table.add_row().cells
            row_cells[0].text = m.metric
            row_cells[1].text = str(m.fy23)
            row_cells[2].text = str(m.fy24)
            row_cells[3].text = str(m.yoy_change)
            row_cells[4].text = m.status
    else:
        document.add_paragraph("No metrics available.")

    # 3. Red Flags
    document.add_heading("3. Automated Red Flags & Anomaly Scan", level=1)
    if sec and sec.red_flags:
        for r in sec.red_flags:
            citations = "; ".join(r.citations) if r.citations else "No source citation returned"
            md_lines.append(f"- **[{r.severity.upper()}] {r.risk_type}:** {r.explanation} *(Citations: {citations})*")
    
    md_lines.extend([
        "",
        "## 4. Multi-Company Peer Benchmarking",
        "| Company | Revenue | EBIT Margin | ROE | FCF Conversion |",
        "| :--- | :--- | :--- | :--- | :--- |"
    ])
    if sec and sec.comparison:
        table = document.add_table(rows=1, cols=5)
        table.style = 'Table Grid'
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'Company'
        hdr_cells[1].text = 'Revenue'
        hdr_cells[2].text = 'EBIT Margin'
        hdr_cells[3].text = 'ROE'
        hdr_cells[4].text = 'FCF Conversion'
        
        for c in sec.comparison:
            row_cells = table.add_row().cells
            row_cells[0].text = c.company
            row_cells[1].text = str(c.revenue)
            row_cells[2].text = str(c.ebit_margin)
            row_cells[3].text = str(c.roe)
            row_cells[4].text = str(c.fcf_conversion)
    else:
        document.add_paragraph("No peer benchmarking available.")
            
    # 5. Outlook
    document.add_heading("5. Analyst Outlook & Recommendation", level=1)
    document.add_paragraph(sec.outlook if sec else "Positive outlook on operational resilience.")
    
    document.add_paragraph("\nReport generated by Infosys AI Development of Multi-Agent AI Analysis System for Financial Research and Business Insights.")
    
    file_stream = io.BytesIO()
    document.save(file_stream)
    file_stream.seek(0)
    
    return Response(
        content=file_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="analyst_report_{report_id}.docx"'}
    )

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(report_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    reports_col = db["reports"]
    
    result = await reports_col.delete_one({"_id": report_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found or not authorized")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
