# MARK: Imports
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse, WorkspaceListResponse
from app.core.database import get_db
from app.core.security import get_current_user_token

# MARK: Router Setup
router = APIRouter(prefix="/workspaces", tags=["Research Workspaces"])

# MARK: Endpoints
@router.get("", response_model=WorkspaceListResponse)
@router.get("/", response_model=WorkspaceListResponse)
async def get_workspaces(token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    ws_col = db["workspaces"]
    
    cursor = ws_col.find({"user_id": user_id}).sort("updated_at", -1)
    items = []
    async for doc in cursor:
        items.append(WorkspaceResponse(
            id=doc["_id"],
            name=doc["name"],
            description=doc.get("description", ""),
            user_id=doc["user_id"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
            documents_count=doc.get("documents_count", 0)
        ))
    return WorkspaceListResponse(workspaces=items, total=len(items))

@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(ws_in: WorkspaceCreate, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    ws_col = db["workspaces"]
    
    ws_id = f"ws_{uuid.uuid4().hex[:12]}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    doc = {
        "_id": ws_id,
        "name": ws_in.name,
        "description": ws_in.description or "",
        "user_id": user_id,
        "created_at": now_str,
        "updated_at": now_str,
        "documents_count": 0
    }
    await ws_col.insert_one(doc)
    
    return WorkspaceResponse(
        id=ws_id,
        name=doc["name"],
        description=doc["description"],
        user_id=doc["user_id"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        documents_count=0
    )

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(workspace_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    ws_col = db["workspaces"]
    
    doc = await ws_col.find_one({"_id": workspace_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        
    return WorkspaceResponse(
        id=doc["_id"],
        name=doc["name"],
        description=doc.get("description", ""),
        user_id=doc["user_id"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        documents_count=doc.get("documents_count", 0)
    )

@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(workspace_id: str, ws_in: WorkspaceUpdate, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    ws_col = db["workspaces"]
    
    doc = await ws_col.find_one({"_id": workspace_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    
    update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if ws_in.name is not None:
        update_fields["name"] = ws_in.name
    if ws_in.description is not None:
        update_fields["description"] = ws_in.description
        
    await ws_col.update_one({"_id": workspace_id}, {"$set": update_fields})
    doc.update(update_fields)
    
    return WorkspaceResponse(
        id=doc["_id"],
        name=doc["name"],
        description=doc.get("description", ""),
        user_id=doc["user_id"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        documents_count=doc.get("documents_count", 0)
    )

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(workspace_id: str, token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    ws_col = db["workspaces"]
    docs_col = db["documents"]
    
    result = await ws_col.delete_one({"_id": workspace_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        
    await docs_col.delete_many({"workspace_id": workspace_id})
    return None
