from crewai import Task
from app.schemas import (
    FinancialMetricsOutput,
    RedFlagsOutput,
    ComparisonOutput,
    ReportSectionsSchema
)

def get_extraction_task(agent, document_text: str):
    return Task(
        description=f"Extract the key financial metrics (revenue, gross margin, ebitda, net income, eps, free cash flow, debt-to-equity) from the following document text. Text:\n\n{document_text}",
        expected_output="A structured list of extracted financial metrics.",
        agent=agent,
        output_pydantic=FinancialMetricsOutput
    )



def get_comparison_task(agent, context_tasks: list, company_name: str, historical_data: str = None):
    historical_prompt = f" Historical context/Peers: {historical_data}" if historical_data else ""
    return Task(
        description=f"Compare the extracted metrics (including revenue, net income, eps, gross margin, ebitda, roe, debt-to-equity, and fcf conversion) for {company_name} against historical performance and industry peers to evaluate operational efficiency and financial health.{historical_prompt}\nIMPORTANT: Use the exact company name '{company_name}' in your analysis, do NOT use 'Company A' or 'Company B'.",
        expected_output=f"A structured list comparing {company_name} with peers/historical performance.",
        agent=agent,
        context=context_tasks,
        output_pydantic=ComparisonOutput
    )

def get_research_task(agent, context_tasks: list = None, query: str = None, document_text: str = None):
    query_prompt = f"\nSpecific User Query: {query}" if query else "\nSpecific User Query: Analyze the overall financial health based on the extracted data and red flags."
    doc_prompt = f"\n\nSource Document Text:\n{document_text}" if document_text else ""
    
    task_kwargs = {
        "description": f"Synthesize the provided information to answer the specific research query. If the query asks for information not in the structured data, use the Source Document Text to find the answer.{query_prompt}{doc_prompt}",
        "expected_output": "A detailed textual analysis answering the specific query.",
        "agent": agent
    }
    
    if context_tasks:
        task_kwargs["context"] = context_tasks
        
    return Task(**task_kwargs)

def get_report_task(agent, context_tasks: list, company_name: str):
    return Task(
        description=f"Compile a final executive report for {company_name} summarizing the executive findings, key financials, red flags, comparisons, and providing a final outlook. Ensure all previous structured outputs are synthesized into this final report schema.",
        expected_output="A comprehensive financial report following the ReportSectionsSchema structure.",
        agent=agent,
        context=context_tasks,
        output_pydantic=ReportSectionsSchema
    )
