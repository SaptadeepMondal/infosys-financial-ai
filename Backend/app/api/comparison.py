# MARK: Imports
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.core.security import get_current_user_token

# MARK: Router Setup
router = APIRouter(prefix="/comparison", tags=["Comparison Agent"])

class CompareRequest(BaseModel):
    companyIds: List[str]

# MARK: Endpoints
@router.get("/companies")
async def get_companies(workspace_id: Optional[str] = None, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    docs_col = db["documents"]
    
    query = {"user_id": user_id}
    if workspace_id:
        query["workspace_id"] = workspace_id
        
    # Get distinct company names that have documents
    companies = await docs_col.distinct("company_name", query)
    
    result = []
    for c in companies:
        if not c:
            continue
        ticker = c[:4].upper()
        result.append({
            "id": c,
            "name": c,
            "ticker": ticker,
            "industry": "Available in DB",
            "logo": None
        })
    
    return result

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

@router.post("/compare")
async def compare_companies(req: CompareRequest, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    reports_col = db["reports"]
    
    company_ids = req.companyIds
    if not company_ids or len(company_ids) < 2:
        raise HTTPException(status_code=400, detail="At least two companies must be provided.")
        
    companies = []
    metrics = {}
    risk = {}
    ratios = {}
    performance = {}
    insights = []
    
    for c_id in company_ids:
        # Fetch the latest completed report for the company
        report = await reports_col.find_one(
            {"user_id": user_id, "company_name": c_id, "status": "COMPLETED"},
            sort=[("created_at", -1)]
        )
        
        companies.append({
            "id": c_id,
            "name": c_id,
            "ticker": c_id[:4].upper(),
            "industry": "Available in DB",
            "logo": None
        })
        
        # Default empty structures
        c_metrics = {
            "revenue": "N/A", "revenueGrowth": "N/A", "netIncome": "N/A",
            "profitMargin": "N/A", "ebitda": "N/A", "ebitdaMargin": "N/A",
            "eps": "N/A", "marketCap": "N/A"
        }
        c_risk = {
            "riskLevel": "Low", "highSignals": 0, "mediumSignals": 0, "lowSignals": 0, "totalSignals": 0
        }
        c_ratios = {
            "peRatio": 0, "pbRatio": 0, "roe": 0, "roa": 0,
            "debtToEquity": 0, "currentRatio": 0, "operatingMargin": 0
        }
        c_perf = {"revenue": [0]*5, "profit": [0]*5, "margin": [0]*5}
        
        if report and "sections" in report:
            sections = report["sections"]
            
            # Map metrics
            if "key_financials" in sections:
                for f in sections["key_financials"]:
                    if not isinstance(f, dict):
                        continue
                    m_name = f.get("metric", "").lower()
                    val = f.get("fy24", "N/A")
                    growth = f.get("yoy_change", "N/A")
                    if "revenue" in m_name:
                        c_metrics["revenue"] = val
                        c_metrics["revenueGrowth"] = growth
                    elif "income" in m_name or "profit" in m_name and "margin" not in m_name:
                        c_metrics["netIncome"] = val
                    elif "margin" in m_name:
                        c_metrics["profitMargin"] = val
                    elif "ebitda" in m_name:
                        c_metrics["ebitda"] = val
                    elif "eps" in m_name or "earnings per share" in m_name:
                        c_metrics["eps"] = val
            
            # Map risk
            if "red_flags" in sections:
                flags = sections["red_flags"]
                c_risk["totalSignals"] = len(flags)
                for f in flags:
                    if not isinstance(f, dict):
                        continue
                    sev = f.get("severity", "Low").lower()
                    if sev == "high":
                        c_risk["highSignals"] += 1
                    elif sev == "medium":
                        c_risk["mediumSignals"] += 1
                    else:
                        c_risk["lowSignals"] += 1
                
                if c_risk["highSignals"] > 0:
                    c_risk["riskLevel"] = "High"
                elif c_risk["mediumSignals"] > 0:
                    c_risk["riskLevel"] = "Medium"
                elif c_risk["totalSignals"] > 0:
                    c_risk["riskLevel"] = "Low"
                    
            # Map basic ratios if available in comparison section
            if "comparison" in sections:
                for cmp in sections["comparison"]:
                    if not isinstance(cmp, dict):
                        continue
                    if cmp.get("company", "") == c_id:
                        # Extract additional metrics from the comparison list
                        if cmp.get("revenue") and cmp.get("revenue") != "N/A":
                            c_metrics["revenue"] = cmp.get("revenue")
                        if cmp.get("net_income") and cmp.get("net_income") != "N/A":
                            c_metrics["netIncome"] = cmp.get("net_income")
                        if cmp.get("eps") and cmp.get("eps") != "N/A":
                            c_metrics["eps"] = cmp.get("eps")
                        if cmp.get("ebitda") and cmp.get("ebitda") != "N/A":
                            c_metrics["ebitda"] = cmp.get("ebitda")
                        if cmp.get("ebit_margin") and cmp.get("ebit_margin") != "N/A":
                            c_metrics["profitMargin"] = cmp.get("ebit_margin")
                            
                        # Extract ratios
                        try:
                            c_ratios["roe"] = float(str(cmp.get("roe", "0")).replace("%", ""))
                        except:
                            pass
                        try:
                            c_ratios["debtToEquity"] = float(str(cmp.get("debt_to_equity", "0")).replace("x", ""))
                        except:
                            pass
            
            # Generate one insight from the summary
            if report.get("summary"):
                insights.append({
                    "text": report["summary"][:150] + "...",
                    "source": report.get("title", "Generated Report"),
                    "page": "Summary",
                    "agent": "Report Agent",
                    "timestamp": report.get("created_at", "N/A")
                })
        else:
            # Fallback: Extract basic metrics using LLM if no report exists
            docs_col = db["documents"]
            cursor = docs_col.find({"user_id": user_id, "company_name": c_id}).sort("uploaded_at", -1).limit(5)
            docs = [d async for d in cursor]
            
            if docs:
                chunks_col = db["parsed_chunks"]
                doc_ids = [d["_id"] for d in docs]
                
                # Fetch tables first, then some text
                table_cursor = chunks_col.find({"document_id": {"$in": doc_ids}, "type": "table_chunk"}).limit(30)
                table_chunks = [c async for c in table_cursor]
                
                text_cursor = chunks_col.find({"document_id": {"$in": doc_ids}, "type": "text_chunk"}).limit(50)
                text_chunks = [c async for c in text_cursor]
                
                all_chunks = table_chunks + text_chunks
                doc_text = "\\n".join([c.get("text", "") for c in all_chunks])
                
                if doc_text.strip():
                    import os, json
                    from openai import AsyncOpenAI
                    client = AsyncOpenAI(
                        api_key=os.getenv("OPENAI_API_KEY"),
                        base_url=os.getenv("OPENAI_API_BASE")
                    )
                    prompt = f'''
Extract the following financial metrics for {c_id} from the text below.
Return ONLY a valid JSON object with these exact keys:
"revenue", "netIncome", "eps", "ebitda", "profitMargin", "roe", "debtToEquity"
If a value is not found, use "N/A" (or 0 for ratios). Use string formatting like "$10.5B" for monetary values.

Text:
{doc_text[:100000]}
                    '''
                    try:
                        completion = await client.chat.completions.create(
                            model=os.getenv("OPENAI_MODEL_NAME", "openai/gpt-4o-mini"),
                            messages=[{"role": "user", "content": prompt}]
                        )
                        content = completion.choices[0].message.content
                        if "```json" in content:
                            content = content.split("```json")[1].split("```")[0]
                        elif "```" in content:
                            content = content.split("```")[1].split("```")[0]
                        
                        extracted = json.loads(content.strip())
                        
                        c_metrics["revenue"] = str(extracted.get("revenue", "N/A"))
                        c_metrics["netIncome"] = str(extracted.get("netIncome", "N/A"))
                        c_metrics["eps"] = str(extracted.get("eps", "N/A"))
                        c_metrics["ebitda"] = str(extracted.get("ebitda", "N/A"))
                        c_metrics["profitMargin"] = str(extracted.get("profitMargin", "N/A"))
                        
                        try:
                            roe_str = str(extracted.get("roe", "0")).replace("%", "").replace("N/A", "0").strip()
                            c_ratios["roe"] = float(roe_str)
                        except:
                            pass
                        
                        try:
                            dte_str = str(extracted.get("debtToEquity", "0")).replace("x", "").replace("N/A", "0").strip()
                            c_ratios["debtToEquity"] = float(dte_str)
                        except:
                            pass
                            
                        insights.append({
                            "text": f"Dynamically extracted financial snapshot for {c_id} from raw document chunks.",
                            "source": docs[0].get("title", "Uploaded Document"),
                            "page": "Quick Extraction",
                            "agent": "Comparison Agent Fallback",
                            "timestamp": docs[0].get("uploaded_at", "N/A")
                        })
                    except Exception as e:
                        print(f"Fallback extraction failed for {c_id}: {e}")
                            
        # Normalize the metrics for uniform UI display
        c_metrics["revenue"] = normalize_money(c_metrics["revenue"])
        c_metrics["netIncome"] = normalize_money(c_metrics["netIncome"])
        c_metrics["ebitda"] = normalize_money(c_metrics["ebitda"])
        c_metrics["marketCap"] = normalize_money(c_metrics["marketCap"])
        c_metrics["eps"] = normalize_eps(c_metrics["eps"])
        
        # Ensure percentages have % sign
        for p_key in ["profitMargin", "revenueGrowth"]:
            val = str(c_metrics.get(p_key, "N/A")).replace("%", "")
            if val not in ("N/A", ""):
                try:
                    c_metrics[p_key] = f"{float(val)}%"
                except:
                    pass
        
        metrics[c_id] = c_metrics
        risk[c_id] = c_risk
        ratios[c_id] = c_ratios
        performance[c_id] = c_perf
        
    summary = []
    if len(companies) > 0:
        summary.append({
            "label": "Comparison Initiated",
            "value": "Data Aggregated",
            "hint": "Comparison successfully loaded from database reports."
        })
        
    return {
        "companies": companies,
        "metrics": metrics,
        "risk": risk,
        "ratios": ratios,
        "performance": performance,
        "periods": ["FY20", "FY21", "FY22", "FY23", "FY24"],
        "insights": insights,
        "summary": summary
    }

@router.post("/export")
async def export_comparison(req: CompareRequest, token_data: dict = Depends(get_current_user_token)):
    # Re-run compare logic briefly to get structured data for export
    data = await compare_companies(req, token_data)
    
    if not data or not data.get("companies"):
        raise HTTPException(status_code=404, detail="No comparison data found.")
        
    md_lines = [
        "# Comparison Agent Report",
        f"**Generated:** {data['insights'][0]['timestamp'][:10] if data['insights'] else 'Today'}",
        "",
        "## 1. Selected Companies",
        ", ".join([c["name"] for c in data["companies"]]),
        "",
        "## 2. Financial Metrics Comparison",
        "| Company | Revenue | Net Income | EPS | EBITDA | Margin |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |"
    ]
    
    for c in data["companies"]:
        m = data["metrics"][c["id"]]
        md_lines.append(f"| **{c['name']}** | {m.get('revenue','N/A')} | {m.get('netIncome','N/A')} | {m.get('eps','N/A')} | {m.get('ebitda','N/A')} | {m.get('profitMargin','N/A')} |")
        
    md_lines.extend([
        "",
        "## 3. Financial Ratios",
        "| Company | ROE | Debt-to-Equity |",
        "| :--- | :--- | :--- |"
    ])
    
    for c in data["companies"]:
        r = data["ratios"][c["id"]]
        md_lines.append(f"| **{c['name']}** | {r.get('roe',0)}% | {r.get('debtToEquity',0)}x |")
        
    md_lines.extend([
        "",
        "## 4. Risk Profile",
        "| Company | Risk Level | High Signals | Medium Signals | Low Signals |",
        "| :--- | :--- | :--- | :--- | :--- |"
    ])
    
    for c in data["companies"]:
        rk = data["risk"][c["id"]]
        md_lines.append(f"| **{c['name']}** | {rk.get('riskLevel','Low')} | {rk.get('highSignals',0)} | {rk.get('mediumSignals',0)} | {rk.get('lowSignals',0)} |")

    md_lines.extend([
        "",
        "## 5. AI Insights",
    ])
    
    for ins in data["insights"]:
        md_lines.append(f"- **{ins['source']}:** {ins['text']}")

    md_lines.extend([
        "",
        "---",
        "*Report generated by Infosys AI Development of Multi-Agent AI Analysis System.*"
    ])
    
    md_content = "\n".join(md_lines)
    
    from fastapi import Response
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=comparison_report.md"}
    )
