import json
import logging
from typing import Any, Dict, List, Optional

from crewai import Agent, Task, Crew
from crewai.tools import tool

from app.core.database import get_db
from app.schemas import RedFlagsOutput

logger = logging.getLogger(__name__)

# ============================================================
# CONFIGURATION
# ============================================================

COLLECTION_CHUNKS = "parsed_chunks"
COLLECTION_RED_FLAGS = "red_flags"

MAX_CHUNKS = 10

# ============================================================
# TOOL 1 — RETRIEVE EVIDENCE
# ============================================================

@tool("retrieve_evidence")
def retrieve_evidence(document_id: str, query: str) -> str:
    """
    Retrieve financial document chunks from MongoDB as evidence for
    a specific query or identified risk.
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
        logger.error(f"Evidence retrieval failed: {e}")
        return json.dumps({"error": str(e)})

# ============================================================
# TOOL 2 — STORE RED FLAGS
# ============================================================

@tool("store_red_flags")
def store_red_flags(
    document_id: str,
    company_name: str,
    red_flags_json: str
) -> str:
    """
    Store validated red flags in the dedicated MongoDB collection.
    """
    from pymongo import MongoClient
    from app.core.config import settings

    try:
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.DATABASE_NAME]
        collection = db[COLLECTION_RED_FLAGS]

        parsed = json.loads(red_flags_json)
        flags = parsed.get("red_flags", [])

        documents = []
        for flag in flags:
            documents.append({
                "document_id": document_id,
                "company_name": company_name,
                "risk_type": flag.get("risk_type"),
                "severity": flag.get("severity"),
                "affected_metrics": flag.get("affected_metrics", []),
                "explanation": flag.get("explanation"),
                "citations": flag.get("citations", []),
                "source_type": "red_flag"
            })

        if documents:
            collection.insert_many(documents)

        client.close()
        return f"Stored {len(documents)} red flags."
    except Exception as e:
        logger.error(f"Red flags storage failed: {e}")
        return f"Storage failed: {str(e)}"

# ============================================================
# CREWAI AGENT
# ============================================================

def get_red_flag_agent() -> Agent:
    return Agent(
        role="Risk & Compliance Analyst",
        goal=(
            "Analyze the extracted financial metrics and underlying document context "
            "to identify potential red flags, anomalies, and risks (e.g., declining margins, "
            "unusual debt increases, discretionary demand softness)."
        ),
        backstory=(
            "You specialize in identifying hidden risks in corporate filings. You look for "
            "discretionary demand softness, auditor qualifications, unusual accounting "
            "practices, and legal liabilities. Your eagle eye spots what others miss. "
            "You always provide citations for your findings."
        ),
        tools=[
            retrieve_evidence,
            store_red_flags
        ],
        verbose=True,
        allow_delegation=False
    )

# ============================================================
# CREWAI TASK
# ============================================================

def get_red_flag_task(
    agent: Agent,
    context_tasks: list,
    document_id: str = "unknown_doc",
    company_name: str = "Unknown"
) -> Task:
    
    return Task(
        description=f"""
You are analyzing the financial stability of a company.

Document ID:
{document_id}

Company:
{company_name}

Your task is to identify any financial red flags based on the extracted financial metrics 
provided in your context. 

For each red flag:
1. Identify the risk_type.
2. Assign a severity (High, Medium, Low).
3. List the affected_metrics from the extracted data.
4. Provide a clear explanation of why this is a risk.
5. Use retrieve_evidence tool if you need to fetch specific text chunks to support the risk.
6. Provide citations (List of strings) to back up your claim.
7. After analysis, use store_red_flags to persist your findings to the database.

Only output risks that have a basis in the provided context or evidence.
""",
        expected_output="""
A structured list of identified red flags and risks containing:
- risk_type
- severity
- affected_metrics
- explanation
- citations
""",
        agent=agent,
        context=context_tasks,
        output_pydantic=RedFlagsOutput
    )
