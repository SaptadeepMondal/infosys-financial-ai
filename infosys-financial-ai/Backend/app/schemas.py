from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

# MARK: User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "Financial Analyst"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# MARK: Workspace Schemas
class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: str
    user_id: str
    created_at: str
    updated_at: str
    documents_count: int = 0

class WorkspaceListResponse(BaseModel):
    workspaces: List[WorkspaceResponse]
    total: int

# MARK: Document Schemas
class DocumentResponse(BaseModel):
    id: str
    title: str
    company_name: str
    filing_type: str
    fiscal_year: int
    workspace_id: str
    user_id: str
    file_path: str
    file_size: int
    status: str
    is_seed: bool = False
    chunks_count: int = 0
    uploaded_at: str

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int

# MARK: Chat Schemas
class ChatQueryRequest(BaseModel):
    query: str
    workspace_id: str
    company_name: Optional[str] = None

class Citation(BaseModel):
    source: str
    page: Optional[str] = "1"
    quote: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: str
    workspace_id: str
    role: str  # "user" | "assistant"
    content: str
    reasoning_steps: Optional[List[str]] = None
    citations: Optional[List[Citation]] = None
    timestamp: str

class ChatQueryResponse(BaseModel):
    message: ChatMessageResponse
    agent_status: str = "Research Agent citation verified"

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]

# MARK: Report Schemas
class FinancialMetricSchema(BaseModel):
    metric: str
    fy23: str
    fy24: str
    yoy_change: str
    status: str  # "Positive" | "Neutral" | "Negative"

class RedFlagSchema(BaseModel):
    risk_type: str
    severity: str  # "High" | "Medium" | "Low"
    affected_metrics: List[str]
    explanation: str
    citations: List[str]

class ComparisonItemSchema(BaseModel):
    company: str
    revenue: str
    ebit_margin: str
    roe: str
    fcf_conversion: str

class FinancialMetricsOutput(BaseModel):
    metrics: List[FinancialMetricSchema]

class RedFlagsOutput(BaseModel):
    red_flags: List[RedFlagSchema]

class ComparisonOutput(BaseModel):
    comparison: List[ComparisonItemSchema]

class ReportSectionsSchema(BaseModel):
    executive_summary: str
    key_financials: List[FinancialMetricSchema]
    red_flags: List[RedFlagSchema]
    comparison: List[ComparisonItemSchema]
    outlook: str

class ReportCreate(BaseModel):
    title: str
    workspace_id: str
    company_name: Optional[str] = "Infosys Limited"

class ReportResponse(BaseModel):
    id: str
    title: str
    workspace_id: str
    user_id: str
    company_name: str
    summary: str
    status: str
    created_at: str
    sections: Optional[ReportSectionsSchema] = None

class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int

# MARK: Dashboard Schemas
class StatsCard(BaseModel):
    title: str
    value: str
    change: str
    trend: str  # "up" | "down" | "neutral"
    icon: str

class StatsCardsResponse(BaseModel):
    cards: List[StatsCard]

class DashboardSummaryResponse(BaseModel):
    stats: List[StatsCard]
    recent_documents: List[DocumentResponse]
    recent_workspaces: List[WorkspaceResponse]
    recent_reports: List[Dict[str, Any]]
