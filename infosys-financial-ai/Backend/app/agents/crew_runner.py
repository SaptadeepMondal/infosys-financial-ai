from crewai import Crew, Process
from app.agents.agents import (
    get_extraction_agent,
    get_comparison_agent,
    get_research_agent,
    get_report_agent
)
from app.agents.tasks import (
    get_extraction_task,
    get_comparison_task,
    get_research_task,
    get_report_task
)
from app.agents.red_flag_agent import get_red_flag_agent, get_red_flag_task
from app.schemas import ReportSectionsSchema
import json

class FinancialCrewRunner:
    @staticmethod
    def run_pipeline(workspace_id: str, document_text: str, query: str = None, company_name: str = "Infosys Limited", historical_data: str = None) -> ReportSectionsSchema:
        """
        Orchestrates the CrewAI agents into a sequential pipeline.
        Returns the parsed output as a ReportSectionsSchema.
        """
        # 1. Initialize Agents
        extraction_agent = get_extraction_agent()
        red_flag_agent = get_red_flag_agent()
        comparison_agent = get_comparison_agent()
        research_agent = get_research_agent()
        report_agent = get_report_agent()
        
        # 2. Initialize Tasks with explicit context
        extraction_task = get_extraction_task(extraction_agent, document_text)
        
        red_flag_task = get_red_flag_task(
            red_flag_agent, 
            context_tasks=[extraction_task],
            document_id=workspace_id,
            company_name=company_name
        )
        
        comparison_task = get_comparison_task(
            comparison_agent, 
            context_tasks=[extraction_task],
            historical_data=historical_data
        )
        
        research_task = get_research_task(
            research_agent, 
            context_tasks=[extraction_task, red_flag_task, comparison_task],
            query=query
        )
        
        report_task = get_report_task(
            report_agent, 
            context_tasks=[extraction_task, red_flag_task, comparison_task, research_task],
            company_name=company_name
        )
        
        # 3. Form the Crew
        crew = Crew(
            agents=[
                extraction_agent, 
                red_flag_agent, 
                comparison_agent, 
                research_agent, 
                report_agent
            ],
            tasks=[
                extraction_task, 
                red_flag_task, 
                comparison_task, 
                research_task, 
                report_task
            ],
            process=Process.sequential,
            verbose=True
        )
        
        # 4. Kickoff the crew execution
        result = crew.kickoff()
        
        # 5. The final task's output should be validated by ReportSectionsSchema
        try:
            # result.pydantic should contain the parsed pydantic model if output_pydantic was used
            # Depending on CrewAI version, we might have to fallback to JSON parsing or crew_output.pydantic
            if hasattr(result, "pydantic") and result.pydantic:
                return result.pydantic
            
            # Fallback if result is a raw string JSON
            if isinstance(result, str):
                parsed = json.loads(result)
                return ReportSectionsSchema(**parsed)
                
            # If crew_output wrapper exists
            if hasattr(result, "raw"):
                return ReportSectionsSchema.model_validate_json(result.raw)
                
        except Exception as e:
            raise ValueError(f"Failed to parse crew output into ReportSectionsSchema: {e}")
    @staticmethod
    async def run_research(
        document_id: str,
        document_text: str,
        query: str,
        company_name: str = "Unknown Company",
        historical_data: str = None
    ) -> str:
        """
        Runs the financial research pipeline for chatbot queries.

        Pipeline:
        Extraction → Red Flag → Comparison → Research

        Unlike run_pipeline(), this method stops at the Research Agent
        and returns the research answer for the chatbot.
        """

        # 1. Initialize agents
        extraction_agent = get_extraction_agent()
        red_flag_agent = get_red_flag_agent()
        comparison_agent = get_comparison_agent()
        research_agent = get_research_agent()

        # 2. Create tasks
        extraction_task = get_extraction_task(
            extraction_agent,
            document_text
        )

        red_flag_task = get_red_flag_task(
            red_flag_agent,
            context_tasks=[extraction_task],
            document_id=document_id,
            company_name=company_name
        )

        comparison_task = get_comparison_task(
            comparison_agent,
            context_tasks=[extraction_task],
            historical_data=historical_data
        )

        research_task = get_research_task(
            research_agent,
            context_tasks=[
                extraction_task,
                red_flag_task,
                comparison_task
            ],
            query=query
        )

        # 3. Create research-only crew
        crew = Crew(
            agents=[
                extraction_agent,
                red_flag_agent,
                comparison_agent,
                research_agent
            ],
            tasks=[
                extraction_task,
                red_flag_task,
                comparison_task,
                research_task
            ],
            process=Process.sequential,
            verbose=True
        )

        # 4. Run asynchronously
        result = await crew.kickoff_async()

        # 5. Return Research Agent's response
        if hasattr(result, "raw"):
            return result.raw

        return str(result)