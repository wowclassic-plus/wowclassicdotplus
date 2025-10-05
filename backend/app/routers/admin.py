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
