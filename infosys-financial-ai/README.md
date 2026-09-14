# Development of Multi-Agent AI Analysis System for Financial Research and Business Insights

An AI-powered financial research platform that leverages multiple specialized AI agents to analyze company financial documents, extract key insights, identify financial risks, compare companies, answer research queries, and generate analyst-style reports.

## Project Overview

The **Development of Multi-Agent AI Analysis System for Financial Research and Business Insights** is designed to streamline complex financial analysis for students, researchers, and financial analysts. The platform enables users to upload lengthy financial documents (such as Annual Reports and 10-K filings), automatically parse and analyze them using a series of specialized AI agents, and generate structured, source-grounded financial insights.

By utilizing a multi-agent architecture powered by CrewAI and Large Language Models, the system orchestrates dedicated agents to manage discrete tasks within the financial research workflow.

## Key Features

- **Financial Document Processing**: Automated parsing, chunking, and embedding of financial PDFs.
- **Metrics Extraction**: Precision extraction of key financial figures and ratio calculations.
- **Risk Detection**: Automated identification of red flags, debt concerns, and margin anomalies.
- **Company Comparison**: Cross-company benchmarking and peer performance analysis.
- **Conversational Research**: Multi-step reasoning for answering complex financial queries with source-backed references.
- **Automated Reporting**: Generation of comprehensive, analyst-style PDF research reports.
- **Secure Workspace**: User authentication, session management, and persistent research workspaces.

## Architecture & Multi-Agent Workflow

The system employs a sequential agent pipeline to process information and derive insights:

1. **Document Agent**: Handles document upload, PDF parsing, text chunking, and vector database indexing.
2. **Extraction Agent**: Focuses on financial metrics extraction, ratio calculation, and revenue/profit analysis.
3. **Red Flag Agent**: Conducts risk detection, debt analysis, and identifies financial anomalies.
4. **Comparison Agent**: Benchmarks performance and conducts peer comparisons.
5. **Research Agent**: Provides multi-step reasoning for specific financial question answering.
6. **Report Agent**: Compiles an executive summary, key financials, red flags, and comparisons into a cohesive final PDF report.

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- FastAPI
- Python
- JWT Authentication

### Database & AI Framework
- MongoDB Atlas (Document Storage & Vector Search)
- CrewAI
- OpenAI Models

## Getting Started

For comprehensive instructions on how to set up the development environment, configure environment variables, and run the system locally, please refer to the [Setup Guide](SETUP.md).