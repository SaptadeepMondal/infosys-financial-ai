from pydantic import BaseModel, EmailStr, field_validator, ValidationInfo
from typing import Optional, List, Dict, Any
import re

def normalize_money(val: str) -> str:
    if not isinstance(val, str) or val in ("N/A", "", "0", "None"): return "N/A"
    val_lower = val.lower()
    match = re.search(r'[-+]?\d*\.\d+|\d+', val.replace(',', ''))
    if not match: return val
    num = float(match.group())
    if "t" in val_lower or "trillion" in val_lower: num *= 1000
    elif "b" in val_lower or "billion" in val_lower: num *= 1
    elif "m" in val_lower or "million" in val_lower: num /= 1000
    else:
        if num > 1000: num /= 1000
    return f"${num:.1f}B"

def normalize_eps(val: str) -> str:
    if not isinstance(val, str) or val in ("N/A", "", "0", "None"): return "N/A"
    match = re.search(r'[-+]?\d*\.\d+|\d+', val.replace(',', ''))
    if not match: return val
    num = float(match.group())
    return f"${num:.2f}"

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
    document_id: Optional[str] = None
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
    metric: str = "Unknown"
    fy23: str = "N/A"
    fy24: str = "N/A"
    yoy_change: str = "N/A"
    status: str = "Neutral"  # "Positive" | "Neutral" | "Negative"

    @field_validator("fy23", "fy24", mode="before")
    @classmethod
    def validate_money(cls, v: str, info: ValidationInfo) -> str:
        metric = info.data.get('metric', '').lower()
        v_str = str(v)
        if 'margin' in metric or 'growth' in metric or 'ratio' in metric:
            if '%' not in v_str and ('margin' in metric or 'growth' in metric):
                try:
                    return f"{float(v_str.replace('%',''))}%"
                except:
                    pass
            return v_str
        
        if 'eps' in metric or 'earnings per share' in metric:
            return normalize_eps(v_str)
            
        return normalize_money(v_str)

class RedFlagSchema(BaseModel):
    risk_type: str = "Unknown Risk"
    severity: str = "Medium"  # "High" | "Medium" | "Low"
    affected_metrics: List[str] = []
    explanation: str = "No explanation provided."
    citations: List[str] = []

class ComparisonItemSchema(BaseModel):
    company: str = "Unknown Company"
    revenue: str = "N/A"
    net_income: str = "N/A"
    eps: str = "N/A"
    gross_margin: str = "N/A"
    ebit_margin: str = "N/A"
    ebitda: str = "N/A"
    roe: str = "N/A"
    debt_to_equity: str = "N/A"
    fcf_conversion: str = "N/A"

    @field_validator("revenue", "net_income", "ebitda", mode="before")
    @classmethod
    def norm_money(cls, v: str) -> str:
        return normalize_money(str(v))

    @field_validator("eps", mode="before")
    @classmethod
    def norm_eps(cls, v: str) -> str:
        return normalize_eps(str(v))

class FinancialMetricsOutput(BaseModel):
    metrics: List[FinancialMetricSchema]

class RedFlagsOutput(BaseModel):
    red_flags: List[RedFlagSchema]

class ComparisonOutput(BaseModel):
    comparison: List[ComparisonItemSchema]

class ReportSectionsSchema(BaseModel):
    executive_summary: str = ""
    key_financials: List[FinancialMetricSchema] = []
    red_flags: List[RedFlagSchema] = []
    comparison: List[ComparisonItemSchema] = []
    outlook: str = ""

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
