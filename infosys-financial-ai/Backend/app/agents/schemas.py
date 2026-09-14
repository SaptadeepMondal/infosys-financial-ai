from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SourceEvidence(BaseModel):
    """
    Stores information about where a financial metric
    was found in the original document.
    """

    chunk_id: Optional[str] = None
    page_number: Optional[int] = None
    source_text: Optional[str] = None


class FinancialMetric(BaseModel):
    """
    Represents one extracted financial metric.
    """

    name: str
    value: Optional[float] = None
    original_value: Optional[str] = None

    currency: Optional[str] = None
    unit: Optional[str] = None

    fiscal_year: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)

    source_chunk_ids: List[str] = Field(default_factory=list)
    source_pages: List[int] = Field(default_factory=list)

    evidence: Optional[str] = None


class ExtractionResult(BaseModel):
    """
    Final structured output produced by the Extraction Agent.
    """

    document_id: str

    income_statement: List[FinancialMetric] = Field(default_factory=list)

    balance_sheet: List[FinancialMetric] = Field(default_factory=list)

    cash_flow: List[FinancialMetric] = Field(default_factory=list)

    calculated_metrics: List[FinancialMetric] = Field(default_factory=list)

    extraction_metadata: Dict[str, Any] = Field(default_factory=dict)