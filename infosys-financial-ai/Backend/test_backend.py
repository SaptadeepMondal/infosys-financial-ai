import asyncio
import httpx
from httpx import ASGITransport
from app.main import app
from app.core.database import DatabaseManager

async def run_backend_tests():
    print("=== STARTING BACKEND TESTS ===")
    await DatabaseManager.connect_db()
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200, f"Health failed: {res.text}"
        print("[PASS] Health Check Passed:", res.json())

        # 2. Login with demo user (demo@infosys.com / password123)
        login_res = await client.post("/api/auth/login", json={
            "email": "demo@infosys.com",
            "password": "password123"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token_data = login_res.json()
        access_token = token_data["access_token"]
        user_info = token_data["user"]
        print("[PASS] Demo Login Passed:", user_info["email"], f"({user_info['role']})")

        headers = {"Authorization": f"Bearer {access_token}"}

        # 3. Get Dashboard Summary
        dash_res = await client.get("/api/dashboard", headers=headers)
        assert dash_res.status_code == 200, f"Dashboard summary failed: {dash_res.text}"
        dash_data = dash_res.json()
        print("[PASS] Dashboard Summary Passed! Stats cards:", len(dash_data["stats"]), "Recent docs:", len(dash_data["recent_documents"]))

        # 4. List Workspaces
        ws_res = await client.get("/api/workspaces", headers=headers)
        assert ws_res.status_code == 200, f"List workspaces failed: {ws_res.text}"
        ws_list = ws_res.json()["workspaces"]
        print("[PASS] List Workspaces Passed! Found:", len(ws_list))

        # 5. Query Chat (placeholder reasoned response)
        ws_id = ws_list[0]["id"]
        chat_res = await client.post("/api/chat/query", headers=headers, json={
            "query": "What was Infosys operating margin in FY24?",
            "workspace_id": ws_id
        })
        assert chat_res.status_code == 200, f"Chat query failed: {chat_res.text}"
        chat_data = chat_res.json()
        print("[PASS] Chat Query Passed! Assistant said:", chat_data["message"]["content"][:80], "...")

        # 6. List Reports
        rep_res = await client.get("/api/reports", headers=headers)
        assert rep_res.status_code == 200, f"List reports failed: {rep_res.text}"
        reps = rep_res.json()["reports"]
        print("[PASS] List Reports Passed! Total reports:", len(reps))

    print("=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(run_backend_tests())
