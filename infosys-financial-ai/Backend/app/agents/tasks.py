from crewai import Task
from app.schemas import (
    FinancialMetricsOutput,
    RedFlagsOutput,
    ComparisonOutput,
    ReportSectionsSchema
)

def get_extraction_task(agent, document_text: str):
    return Task(
        description=f"Extract the key financial metrics (revenue, margins, free cash flow, debt-to-equity) from the following document text. Text:\n\n{document_text}",
        expected_output="A structured list of extracted financial metrics.",
        agent=agent,
        output_pydantic=FinancialMetricsOutput
    )



def get_comparison_task(agent, context_tasks: list, historical_data: str = None):
    historical_prompt = f" Historical context/Peers: {historical_data}" if historical_data else ""
    return Task(
        description=f"Compare the extracted metrics against historical performance and industry peers to evaluate operational efficiency and financial health.{historical_prompt}",
        expected_output="A structured list comparing the subject company with peers/historical performance.",
        agent=agent,
        context=context_tasks,
        output_pydantic=ComparisonOutput
    )

def get_research_task(agent, context_tasks: list, query: str = None):
    query_prompt = f"\nSpecific User Query: {query}" if query else "\nSpecific User Query: Analyze the overall financial health based on the extracted data and red flags."
    return Task(
        description=f"Synthesize the extracted financial data, identified red flags, and comparisons to answer the specific research query.{query_prompt}",
        expected_output="A detailed textual analysis answering the specific query.",
        agent=agent,
        context=context_tasks
    )

def get_report_task(agent, context_tasks: list, company_name: str):
    return Task(
        description=f"Compile a final executive report for {company_name} summarizing the executive findings, key financials, red flags, comparisons, and providing a final outlook. Ensure all previous structured outputs are synthesized into this final report schema.",
        expected_output="A comprehensive financial report following the ReportSectionsSchema structure.",
        agent=agent,
        context=context_tasks,
        output_pydantic=ReportSectionsSchema
    )
