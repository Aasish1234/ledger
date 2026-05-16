import os
from sqlalchemy import create_engine

# Fetches the secure URL dynamically in production, or uses local DB for testing
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/shadow_db")

engine = create_engine(DATABASE_URL)