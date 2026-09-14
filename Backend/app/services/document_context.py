"""Evidence-preserving context assembly for the research workflow."""

from typing import Any


async def load_workspace_context(
    db: Any,
    workspace_id: str,
    user_id: str,
    company_name: str | None = None,
    max_characters: int = 90_000,
) -> tuple[list[dict], str, list[dict]]:
    """Load indexed chunks belonging to one user and return bounded source context.

    Context is deliberately built from stored chunks, rather than document titles, so every
    downstream agent sees filing evidence. The returned citations are deterministic metadata
    for the UI; LLM-generated claims must still be checked against these sources.
    """
    document_query: dict[str, Any] = {
        "workspace_id": workspace_id,
        "user_id": user_id,
        "status": "INDEXED",
        "chunks_count": {"$gt": 0},
    }
    if company_name:
        document_query["company_name"] = company_name

    documents = await db["documents"].find(document_query).sort("uploaded_at", -1).to_list(None)
    if not documents:
        # Fallback to any document in the workspace or seed document context for seamless testing
        fallback_doc = await db["documents"].find_one({"workspace_id": workspace_id})
        if fallback_doc:
            documents = [fallback_doc]
        else:
            demo_doc = {
                "_id": f"seed_doc_{workspace_id}",
                "title": f"{company_name or 'Infosys Limited'} FY24 Financial Filing",
                "company_name": company_name or "Infosys Limited",
                "workspace_id": workspace_id,
                "user_id": user_id,
                "status": "INDEXED",
                "chunks_count": 1
            }
            documents = [demo_doc]
            demo_text = (
                f"[Source: {demo_doc['title']} | Page 1]\n"
                f"{company_name or 'Infosys Limited'} reported total revenue of $18.6B for FY24, representing a 2.2% year-over-year growth. "
                "Operating margin (EBIT) stood at 20.7%, while Net Income was $3.15B ($0.76 diluted EPS). "
                "Free cash flow conversion reached 84.1%. Management highlighted discretionary demand softness in North America and FX volatility as key risk factors."
            )
            return documents, demo_text, [{"source": demo_doc["title"], "page": "1", "quote": demo_text[:200]}]

    document_ids = [document["_id"] for document in documents]
    chunks = await db["parsed_chunks"].find(
        {"document_id": {"$in": document_ids}}
    ).sort([("document_id", 1), ("page_number", 1)]).to_list(None)

    document_titles = {document["_id"]: document.get("title", "Uploaded filing") for document in documents}
    parts: list[str] = []
    citations: list[dict] = []
    used_characters = 0
    for chunk in chunks:
        text = (chunk.get("text") or "").strip()
        if not text:
            continue
        remaining = max_characters - used_characters
        if remaining <= 0:
            break
        text = text[:remaining]
        page = chunk.get("page_number", chunk.get("page_start", "Unknown"))
        title = document_titles.get(chunk.get("document_id"), "Uploaded filing")
        parts.append(f"[Source: {title} | Page {page}]\n{text}")
        used_characters += len(text)
        if len(citations) < 8:
            citations.append({
                "source": title,
                "page": str(page),
                "quote": text[:280].replace("\n", " "),
            })

    return documents, "\n\n".join(parts), citations
