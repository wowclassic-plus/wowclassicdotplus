# e.g., in app/routers/admin.py
from fastapi import APIRouter
from app.database import Base, engine

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/reset-db")
def reset_db():
    # WARNING: This will DELETE ALL DATA
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return {"status": "database reset complete"}

@router.post("/reset-db2")
def reset_db2():
    # Add the 'responses' JSON column if it doesn't exist
    with engine.connect() as conn:
        conn.execute("""
            ALTER TABLE survey_entries
            ADD COLUMN IF NOT EXISTS responses JSON;
        """)
        conn.commit()

    print("Migration complete: 'responses' column added safely.")