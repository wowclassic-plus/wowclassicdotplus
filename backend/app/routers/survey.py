# survey.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from sqlalchemy import Column, Integer, JSON, String
from pydantic import BaseModel
from typing import Dict, Any, List
from collections import Counter
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/survey",
    tags=["survey"]
)

# --------------------
# Dynamic survey definition
# --------------------
survey_definition = {
    "sections": [
        {
            "title": "General Questions",
            "locked": False,
            "questions": [
                {"key": "name", "label": "Name / Character", "type": "text", "required": True},
                {"key": "previous_versions", "label": "What versions of Classic have you played before?", 
                 "type": "checkbox", "options": ["Hardcore", "SoD", "SoM", "Vanilla", "TBC", "WoTLK", "Cata", "MoP"], "required": True}
            ]
        },
        {
            "title": "Player Questions",
            "locked": True,
            "questions": [
                {"key": "scaling_raids", "label": "Do you think Classic Plus should have scaling difficulty levels in raids?", 
                 "type": "radio", "options": ["Yes", "No"], "required": True},
                {"key": "scaling_raids2", "label": "Do you think Classic Plus should have scaling difficulty levels in raids2?", 
                 "type": "radio", "options": ["Yes", "No"], "required": True}
            ]
        },
        {
            "title": "Systems Questions",
            "locked": True,
            "questions": [
                {"key": "new_race_class", "label": "Do you think Classic Plus should have new race/class combinations?", 
                 "type": "radio", "options": ["Yes", "No"], "required": True}
            ]
        },
        {
            "title": "World Questions",
            "locked": True,
            "questions": [
                {"key": "currently_play", "label": "Do you currently play Classic?", 
                 "type": "radio", "options": ["Yes", "No"], "required": True},
                {"key": "intend_to_play", "label": "Would you intend to play Classic Plus?", 
                 "type": "radio", "options": ["Yes", "No"], "required": True}
            ]
        }
    ]
}

# --------------------
# Database model
# --------------------
class SurveyEntry(Base):
    __tablename__ = "survey_entries"
    id = Column(Integer, primary_key=True, index=True)
    discord_username = Column(String, index=True, nullable=False)
    responses = Column(JSON)  # store all answers as JSON

Base.metadata.create_all(bind=engine)

# --------------------
# Pydantic schema
# --------------------
class SurveyEntrySchema(BaseModel):
    discord_username: str
    responses: Dict[str, Any]

    class Config:
        orm_mode = True

# --------------------
# DB session dependency
# --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --------------------
# Endpoints
# --------------------
@router.get("/definition/")
def get_survey_definition():
    """
    Return the survey definition (sections, questions, options, required flags)
    Frontend can render survey dynamically from this.
    """
    return survey_definition

# --------------------
# Submit / update survey
# --------------------
@router.post("/", response_model=SurveyEntrySchema)
def submit_survey(entry: SurveyEntrySchema, db: Session = Depends(get_db)):
    """
    Submit or update a survey response. Requires discord_username and answers.
    If the user already has a survey, it updates instead of creating a new one.
    """
    if not entry.discord_username:
        raise HTTPException(status_code=400, detail="discord_username is required")

    existing = db.query(SurveyEntry).filter_by(discord_username=entry.discord_username).first()
    if existing:
        # Update existing responses
        existing.responses = entry.responses
        db.commit()
        db.refresh(existing)
        return existing

    db_entry = SurveyEntry(discord_username=entry.discord_username, responses=entry.responses)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


# --------------------
# Fetch a user's survey entry
# --------------------
@router.get("/user/{discord_username}", response_model=SurveyEntrySchema)
def get_user_survey(discord_username: str, db: Session = Depends(get_db)):
    """
    Return the survey entry for a single user, by discord_username.
    """
    entry = db.query(SurveyEntry).filter_by(discord_username=discord_username).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Survey not found for this user")
    return entry



@router.get("/", response_model=List[SurveyEntrySchema])
def get_survey_entries(db: Session = Depends(get_db)):
    """
    Return all survey entries.
    """
    entries = db.query(SurveyEntry).all()
    return entries

@router.get("/results/")
def get_survey_results(db: Session = Depends(get_db)):
    """
    Aggregate survey results dynamically.
    Returns a dictionary: question_key -> { answer -> count }
    Handles checkboxes (lists), radio, and text answers.
    """
    entries = db.query(SurveyEntry).all()
    if not entries:
        return JSONResponse(content={}, status_code=200)

    agg: Dict[str, Counter] = {}

    for entry in entries:
        for key, value in entry.responses.items():
            if isinstance(value, list):
                for v in value:
                    agg.setdefault(key, Counter())[v] += 1
            elif value is not None:
                agg.setdefault(key, Counter())[value] += 1

    # Convert counters to dict for JSON
    return {k: dict(v) for k, v in agg.items()}
