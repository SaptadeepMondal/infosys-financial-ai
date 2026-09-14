# Setup Guide: Development of Multi-Agent AI Analysis System for Financial Research and Business Insights

This document outlines the detailed steps required to set up the development environment for the Development of Multi-Agent AI Analysis System for Financial Research and Business Insights. The project consists of a React/Vite frontend and a Python/FastAPI backend using MongoDB Atlas and CrewAI.

## Prerequisites

Before proceeding, ensure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher) and npm
- **Python** (v3.10 or higher)
- **Git**

You will also need:
- A **MongoDB Atlas** account and an active database cluster.
- An **OpenAI** API key.

---

## 1. Clone the Repository

Begin by cloning the repository to your local machine and navigating to the project root:

```bash
git clone <repository-url>
cd infosys-financial-ai
```

---

## 2. Backend Setup

The backend is built with FastAPI, CrewAI, and MongoDB.

### 2.1. Navigate to the Backend Directory
```bash
cd Backend
```

### 2.2. Create and Activate a Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies.

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2.3. Install Dependencies
Ensure your virtual environment is activated, then install the required Python packages:
```bash
pip install -r requirements.txt
```

### 2.4. Configure Environment Variables
Copy the provided environment variable template and populate it with your credentials.

```bash
cp .env.example .env
```

Open the `.env` file in your preferred text editor and fill in the necessary details:
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `DATABASE_NAME`: Name of your target database (e.g., `infosys_financial_ai`).
- `SECRET_KEY`: A secure random string for JWT token generation.
- `OPENAI_API_KEY`: Your OpenAI API key.

### 2.5. Run the Backend Server
Start the FastAPI development server:
```bash
uvicorn app.main:app --reload
```
The backend API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

---

## 3. Frontend Setup

The frontend is a single-page application built with React, Vite, and Tailwind CSS.

### 3.1. Navigate to the Frontend Directory
Open a new terminal window/tab, navigate to the project root, and move to the Frontend directory:
```bash
cd Frontend
```

### 3.2. Install Dependencies
Install the required npm packages:
```bash
npm install
```

### 3.3. Start the Development Server
Run the Vite development server:
```bash
npm run dev
```
The frontend application will be accessible at `http://localhost:5173` (or the port specified in your terminal output).

---

## 4. Troubleshooting

- **MongoDB Connection Issues:** Ensure that your IP address is whitelisted in your MongoDB Atlas Network Access settings.
- **Agent/LLM Errors:** Verify that your `OPENAI_API_KEY` is correct and that you have sufficient API credits.
- **Port Conflicts:** If ports `8000` (FastAPI) or `5173` (Vite) are already in use, the servers may fail to start. Terminate any processes utilizing those ports or configure the applications to use alternative ports.
