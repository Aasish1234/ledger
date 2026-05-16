from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(title="The Shadow Ledger API")

# --- CORS Configuration (Crucial for Deployment) ---
# This allows your React frontend to securely request data from this Python server.
origins = [
    "http://localhost:5173", # For local Vite testing
    os.getenv("FRONTEND_URL", "http://localhost:3000") # Render will inject this
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models (The Blueprint) ---
class Task(BaseModel):
    id: int
    name: str
    completed: bool

# Temporary in-memory database (Until you fully link PostgreSQL)
fake_db = [
    {"id": 1, "name": "Morning Medicine (Acalypha Indica)", "completed": False},
    {"id": 2, "name": "Shadow Protocol (Physical Training)", "completed": False},
    {"id": 3, "name": "Deep Work Block (2 Hours)", "completed": False}
]

# --- Endpoints (The Commands) ---
@app.get("/")
def read_root():
    return {"message": "The Shadow Ledger is Online."}

@app.get("/tasks")
def get_tasks():
    return fake_db

@app.post("/tasks/{task_id}/toggle")
def toggle_task(task_id: int):
    for task in fake_db:
        if task["id"] == task_id:
            task["completed"] = not task["completed"]
            return {"message": "Task updated successfully", "task": task}
    return {"error": "Task not found"}