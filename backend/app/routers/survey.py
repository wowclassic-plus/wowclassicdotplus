from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from pydantic import BaseModel
from typing import List
from collections import Counter
from fastapi.responses import JSONResponse
from sqlalchemy import Column, Integer, String

router = APIRouter(
    prefix="/survey",
    tags=["survey"]
)

# Survey database model
class SurveyEntry(Base):
    __tablename__ = "survey_entries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    previous_versions = Column(String)  # store as comma-separated string
    scaling_raids = Column(String)
    new_race_class = Column(String)
    currently_play = Column(String)
    intend_to_play = Column(String)

Base.metadata.create_all(bind=engine)

# Pydantic schema
class SurveyEntrySchema(BaseModel):
    name: str
    previous_versions: List[str]
    scaling_raids: str
    new_race_class: str
    currently_play: str
    intend_to_play: str

    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=SurveyEntrySchema)
def submit_survey(entry: SurveyEntrySchema, db: Session = Depends(get_db)):
    # Convert list to comma-separated string for storage
    db_entry = SurveyEntry(
        name=entry.name,
        previous_versions=",".join(entry.previous_versions),
        scaling_raids=entry.scaling_raids,
        new_race_class=entry.new_race_class,
        currently_play=entry.currently_play,
        intend_to_play=entry.intend_to_play
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    # Convert back to list for response
    return SurveyEntrySchema(
        name=db_entry.name,
        previous_versions=db_entry.previous_versions.split(",") if db_entry.previous_versions else [],
        scaling_raids=db_entry.scaling_raids,
        new_race_class=db_entry.new_race_class,
        currently_play=db_entry.currently_play,
        intend_to_play=db_entry.intend_to_play
    )

@router.get("/", response_model=List[SurveyEntrySchema])
def get_survey_entries(db: Session = Depends(get_db)):
    entries = db.query(SurveyEntry).all()
    results = []
    for entry in entries:
        results.append(
            SurveyEntrySchema(
                name=entry.name,
                previous_versions=entry.previous_versions.split(",") if entry.previous_versions else [],
                scaling_raids=entry.scaling_raids,
                new_race_class=entry.new_race_class,
                currently_play=entry.currently_play,
                intend_to_play=entry.intend_to_play
            )
        )
    return results


@router.get("/results/")
def get_survey_results(db: Session = Depends(get_db)):
    """
    Aggregate survey responses per question.
    Returns a dictionary of question -> { answer -> count }
    """
    entries = db.query(SurveyEntry).all()

    if not entries:
        return JSONResponse(content={}, status_code=200)

    # Initialize counters for each question
    agg = {
        "previous_versions": Counter(),
        "scaling_raids": Counter(),
        "new_race_class": Counter(),
        "currently_play": Counter(),
        "intend_to_play": Counter()
    }

    for entry in entries:
        # previous_versions is a list stored as comma-separated string
        if entry.previous_versions:
            for item in entry.previous_versions.split(","):
                agg["previous_versions"][item.strip()] += 1

        # other string fields
        for field in ["scaling_raids", "new_race_class", "currently_play", "intend_to_play"]:
            value = getattr(entry, field)
            if value:
                agg[field][value.strip()] += 1

    # Convert Counters to regular dicts for JSON serialization
    agg_serializable = {q: dict(counts) for q, counts in agg.items()}

    return agg_serializable
