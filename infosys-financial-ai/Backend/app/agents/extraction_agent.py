import json
import logging
from typing import Any, Dict, List, Optional

from crewai import Agent, Task, Crew
from crewai.tools import tool
from pydantic import BaseModel, Field

from app.core.database import get_db

logger = logging.getLogger(__name__)


# ============================================================
# CONFIGURATION
# ============================================================

REQUIRED_METRICS = [
    "Revenue",
    "Gross Profit",
    "Operating Income",
    "Net Income",
    "EPS",
    "Total Assets",
    "Total Liabilities",
    "Total Equity",
    "Cash",
    "Total Debt",
    "Operating Cash Flow",
    "Capital Expenditure",
    "Free Cash Flow",
]

COLLECTION_CHUNKS = "parsed_chunks"
COLLECTION_EXTRACTED = "extracted_metrics"
COLLECTION_DERIVED = "derived_metrics"

MAX_CHUNKS = 10


# ============================================================
# STRUCTURED OUTPUT SCHEMA
# ============================================================

class FinancialMetric(BaseModel):
    metric_name: str
    value: Optional[float] = None
    original_value: Optional[str] = None
    currency: Optional[str] = None
    unit: Optional[str] = None
    fiscal_year: Optional[int] = None

    source_chunk_ids: List[str] = Field(
        default_factory=list
    )

    source_pages: List[int] = Field(
        default_factory=list
    )

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0
    )


class ExtractionOutput(BaseModel):
    metrics: List[FinancialMetric] = Field(
        default_factory=list
    )


# ============================================================
# TOOL 1 — RETRIEVE DOCUMENT CHUNKS
# ============================================================

@tool("retrieve_financial_document_chunks")
def retrieve_financial_document_chunks(
    document_id: str,
    metric_name: str
) -> str:
    """
    Retrieve financial document chunks from MongoDB for a specific
    financial metric.
    """
    from pymongo import MongoClient
    from app.core.config import settings

    try:
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.DATABASE_NAME]
        collection = db[COLLECTION_CHUNKS]

        chunks = list(collection.find({"document_id": document_id}).limit(MAX_CHUNKS))
        
        result = []
        for chunk in chunks:
            result.append({
                "chunk_id": chunk.get("chunk_id"),
                "page_number": chunk.get("page_start", chunk.get("page_number")),
                "section_type": chunk.get("section_type", "unknown"),
                "text": chunk.get("text", "")
            })

        client.close()
        return json.dumps(result)
    except Exception as e:
        logger.error(f"Chunk retrieval failed: {e}")
        return json.dumps({"error": str(e)})


# ============================================================
# TOOL 2 — STORE EXTRACTION RESULT
# ============================================================

@tool("store_extracted_financial_metrics")
def store_extracted_financial_metrics(
    document_id: str,
    company_name: str,
    extraction_json: str
) -> str:
    """
    Store validated financial metrics in MongoDB.
    """
    from pymongo import MongoClient
    from app.core.config import settings

    try:
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.DATABASE_NAME]
        collection = db[COLLECTION_EXTRACTED]

        parsed = json.loads(extraction_json)
        metrics = parsed.get("metrics", [])

        documents = []
        for metric in metrics:
            if metric.get("value") is None:
                continue

            documents.append({
                "document_id": document_id,
                "company_name": company_name,
                "metric_name": metric.get("metric_name"),
                "value": metric.get("value"),
                "original_value": metric.get("original_value"),
                "currency": metric.get("currency"),
                "unit": metric.get("unit"),
                "fiscal_year": metric.get("fiscal_year"),
                "source_chunk_ids": metric.get("source_chunk_ids", []),
                "source_pages": metric.get("source_pages", []),
                "confidence": metric.get("confidence", 0),
                "source_type": "extracted"
            })

        if documents:
            collection.insert_many(documents)

        client.close()
        return f"Stored {len(documents)} financial metrics."
    except Exception as e:
        logger.error(f"Metric storage failed: {e}")
        return f"Storage failed: {str(e)}"


# ============================================================
# CREWAI AGENT
# ============================================================

extraction_agent = Agent(
    role="Financial Data Extraction Specialist",

    goal=(
        "Extract accurate financial metrics from processed "
        "financial documents using only evidence present "
        "in the supplied document chunks."
    ),

    backstory=(
        "You are an expert financial analyst specializing "
        "in extracting structured financial information "
        "from annual reports, financial statements and "
        "company filings. You never guess financial values. "
        "You never invent missing information. Every extracted "
        "value must be supported by document evidence."
    ),

    tools=[
        retrieve_financial_document_chunks,
        store_extracted_financial_metrics
    ],

    verbose=True,

    allow_delegation=False
)


# ============================================================
# CREWAI TASK
# ============================================================

def create_extraction_task(
    document_id: str,
    company_name: str
) -> Task:

    metrics = ", ".join(
        REQUIRED_METRICS
    )

    return Task(

        description=f"""
You are processing a financial document.

Document ID:
{document_id}

Company:
{company_name}

Your task is to extract the following financial metrics:

{metrics}

For each metric:

1. Retrieve the relevant document chunks using
   retrieve_financial_document_chunks.

2. Extract ONLY values explicitly present in
   the document.

3. Never estimate or invent a value.

4. Preserve the original value representation.

5. Identify the fiscal year.

6. Record the source chunk ID.

7. Record the source page.

8. Assign a confidence score between 0 and 1.

9. If a metric is not present, do not invent it.

10. After extraction, store the structured metrics
    using store_extracted_financial_metrics.

The final result must summarize how many metrics
were successfully extracted.
""",

        expected_output="""
A structured extraction summary containing:

- metric name
- extracted value
- original value
- currency
- unit
- fiscal year
- source chunk IDs
- source pages
- confidence score

Only evidence-supported metrics should be included.
""",

        agent=extraction_agent
    )


# ============================================================
# CREW EXECUTION
# ============================================================

class ExtractionProcessor:

    @staticmethod
    async def process_extraction(
        document_id: str,
        company_name: str = "Unknown"
    ) -> str:

        logger.info(
            "Starting CrewAI Extraction Agent for %s",
            document_id
        )

        task = create_extraction_task(
            document_id,
            company_name
        )

        crew = Crew(
            agents=[
                extraction_agent
            ],

            tasks=[
                task
            ],

            verbose=True
        )

        try:

            result = await crew.kickoff_async()

            logger.info(
                "Extraction Agent completed for %s",
                document_id
            )

            return str(result)

        except Exception as e:

            logger.exception(
                "Extraction Agent failed for %s",
                document_id
            )

            raise RuntimeError(
                f"Extraction failed for "
                f"{document_id}: {e}"
            ) from e