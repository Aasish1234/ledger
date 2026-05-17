from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(title="The Shadow Ledger Core API")

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RECONFIGURED DATA MODELS ---
# Matches the new detailed plan structure from your React UI
class TaskCreate(BaseModel):
    name: str
    category: str

class Task(BaseModel):
    id: int
    name: str
    category: str
    completed: bool

# Upgraded temporary in-memory database with metadata
fake_db = [
    {"id": 1, "name": "Morning Medicine (Acalypha Indica)", "category": "Bio-Maintenance", "completed": False},
    {"id": 2, "name": "Shadow Protocol (Physical Training)", "category": "Physical Training", "completed": False},
    {"id": 3, "name": "Deep Work Block (2 Hours)", "category": "Deep Work", "completed": False}
]

# --- ENDPOINTS (The Commands) ---

@app.get("/")
def read_root():
    return {"status": "Operational", "system": "Shadow Ledger Core"}

# 1. READ ALL OPERATIONS
@app.get("/tasks")
def get_tasks():
    return fake_db

# 2. INJECT NEW PLAN (The New Receiving Gate)
@app.post("/tasks")
def create_task(task_input: TaskCreate):
    if not task_input.name.strip():
        raise HTTPException(status_code=400, detail="Plan identifier cannot be blank")
    
    # Calculate next incremental ID
    next_id = max([t["id"] for t in fake_db]) + 1 if fake_db else 1
    
    new_task = {
        "id": next_id,
        "name": task_input.name,
        "category": task_input.category,
        "completed": False
    }
    fake_db.append(new_task)
    return {"message": "Plan successfully injected into matrix", "task": new_task}

# 3. TOGGLE STATE
@app.post("/tasks/{task_id}/toggle")
def toggle_task(task_id: int):
    for task in fake_db:
        if task["id"] == task_id:
            task["completed"] = not task["completed"]
            return {"message": "Matrix updated", "task": task}
    raise HTTPException(status_code=404, detail="Protocol not found in registry")