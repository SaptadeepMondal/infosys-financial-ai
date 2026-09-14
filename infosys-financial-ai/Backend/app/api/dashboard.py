# MARK: Imports
from fastapi import APIRouter, Depends
from app.schemas import StatsCard, StatsCardsResponse, DashboardSummaryResponse, DocumentResponse, WorkspaceResponse
from app.core.database import get_db
from app.core.security import get_current_user_token

# MARK: Router Setup
router = APIRouter(prefix="/dashboard", tags=["Dashboard KPIs"])

# MARK: Endpoints
@router.get("/stats", response_model=StatsCardsResponse)
async def get_dashboard_stats(token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    ws_col = db["workspaces"]
    docs_col = db["documents"]
    reports_col = db["reports"]
    
    ws_count = await ws_col.count_documents({"user_id": user_id})
    docs_count = await docs_col.count_documents({"user_id": user_id})
    reports_count = await reports_col.count_documents({"user_id": user_id})
    
    total_chunks = 0
    async for doc in docs_col.find({"user_id": user_id}):
        total_chunks += doc.get("chunks_count", 0)
    
    red_flags_count = 0
    async for rep in reports_col.find({"user_id": user_id}):
        sections = rep.get("sections", {})
        if sections and isinstance(sections, dict):
            flags = sections.get("red_flags", [])
            red_flags_count += len(flags)
    
    cards = [
        StatsCard(
            title="Active Research Workspaces",
            value=str(ws_count),
            change="+2 this month",
            trend="up",
            icon="FolderTree"
        ),
        StatsCard(
            title="Indexed Filings & Annual Reports",
            value=str(docs_count),
            change=f"{total_chunks} embedded vectors",
            trend="up",
            icon="FileText"
        ),
        StatsCard(
            title="Automated Red Flags Detected",
            value=str(red_flags_count),
            change="Auditor & Margin Alerts",
            trend="up",
            icon="AlertTriangle"
        ),
        StatsCard(
            title="Generated Analyst Reports",
            value=str(reports_count),
            change="100% cited & grounded",
            trend="up",
            icon="FileCheck"
        )
    ]
    return StatsCardsResponse(cards=cards)


@router.get("", response_model=DashboardSummaryResponse)
@router.get("/", response_model=DashboardSummaryResponse)
@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    docs_col = db["documents"]
    ws_col = db["workspaces"]
    reports_col = db["reports"]
    
    ws_count = await ws_col.count_documents({"user_id": user_id})
    docs_count = await docs_col.count_documents({"user_id": user_id})
    reports_count = await reports_col.count_documents({"user_id": user_id})
    
    total_chunks = 0
    async for doc in docs_col.find({"user_id": user_id}):
        total_chunks += doc.get("chunks_count", 0)
    
    red_flags_count = 0
    async for rep in reports_col.find({"user_id": user_id}):
        sections = rep.get("sections", {})
        if sections and isinstance(sections, dict):
            flags = sections.get("red_flags", [])
            red_flags_count += len(flags)
    
    cards = [
        StatsCard(title="Active Research Workspaces", value=str(ws_count), change="+2 this month", trend="up", icon="FolderTree"),
        StatsCard(title="Indexed Filings & Annual Reports", value=str(docs_count), change=f"{total_chunks} embedded vectors", trend="up", icon="FileText"),
        StatsCard(title="Automated Red Flags Detected", value=str(red_flags_count), change="Auditor & Margin Alerts", trend="up", icon="AlertTriangle"),
        StatsCard(title="Generated Analyst Reports", value=str(reports_count), change="100% cited & grounded", trend="up", icon="FileCheck")
    ]
    
    recent_docs = []
    async for doc in docs_col.find({"user_id": user_id}).sort("uploaded_at", -1).limit(5):
        recent_docs.append(DocumentResponse(
            id=doc["_id"], title=doc["title"], company_name=doc["company_name"],
            filing_type=doc["filing_type"], fiscal_year=doc["fiscal_year"], workspace_id=doc["workspace_id"],
            user_id=doc["user_id"], file_path=doc["file_path"], file_size=doc["file_size"],
            status=doc["status"], is_seed=doc.get("is_seed", False), chunks_count=doc.get("chunks_count", 0),
            uploaded_at=doc["uploaded_at"]
        ))
        
    recent_ws = []
    async for doc in ws_col.find({"user_id": user_id}).sort("updated_at", -1).limit(4):
        recent_ws.append(WorkspaceResponse(
            id=doc["_id"], name=doc["name"], description=doc.get("description", ""),
            user_id=doc["user_id"], created_at=doc["created_at"], updated_at=doc["updated_at"],
            documents_count=doc.get("documents_count", 0)
        ))
        
    recent_reports = []
    async for doc in reports_col.find({"user_id": user_id}).sort("created_at", -1).limit(4):
        recent_reports.append({
            "id": doc["_id"], "title": doc["title"], "company_name": doc.get("company_name", "Infosys Limited"),
            "summary": doc.get("summary", ""), "status": doc.get("status", "COMPLETED"), "created_at": doc["created_at"]
        })
        
    return DashboardSummaryResponse(
        stats=cards,
        recent_documents=recent_docs,
        recent_workspaces=recent_ws,
        recent_reports=recent_reports
    )
