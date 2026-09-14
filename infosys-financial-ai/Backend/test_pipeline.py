import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.agents.crew_runner import FinancialCrewRunner
from app.core.database import get_db, DatabaseManager

async def test():
    # We must connect to DB because Red Flag Agent relies on MongoDB tools
    print("Connecting to DB...")
    await DatabaseManager.connect_db()
    db = get_db()
    
    # Check if a document exists
    doc = await db["documents"].find_one({})
    if not doc:
        print("No documents found in DB. We will use a dummy workspace ID.")
        doc_id = "test_workspace_123"
        company_name = "Infosys Limited"
    else:
        doc_id = str(doc["_id"])
        company_name = doc.get("company_name", "Infosys Limited")

    print(f"Running pipeline for {company_name} (ID: {doc_id})")

    # The pipeline is synchronous
    dummy_text = "Infosys reported a revenue of $18.1 billion in FY24, with operating margins at 20.7%. Free cash flow was strong. However, there is some discretionary demand softness in the market."
    
    try:
        result = await asyncio.to_thread(
            FinancialCrewRunner.run_pipeline,
            workspace_id=doc_id,
            document_text=dummy_text,
            query="Analyze the overall financial health.",
            company_name=company_name
        )
        print("\n\n=== PIPELINE SUCCESS ===")
        print(result.model_dump_json(indent=2))
    except Exception as e:
        print("\n\n=== PIPELINE FAILED ===")
        print(e)

if __name__ == "__main__":
    asyncio.run(test())
