# scripts/populate_pins.py
import random
import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to Python path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.routers.pins import Pin, PinCategory, Vote

# --- Config ---
NUM_PINS = 100
X_MIN, X_MAX = 0, 1500
Y_MIN, Y_MAX = 0, 2000
CATEGORIES = [c.value for c in PinCategory]

# --- Helper functions ---
def random_name():
    adjectives = ["Ancient", "Mystic", "Lost", "Hidden", "Cursed", "Fabled"]
    nouns = ["Temple", "Cave", "Ruins", "Fortress", "Dungeon", "Shrine"]
    return f"{random.choice(adjectives)} {random.choice(nouns)}"

def random_description():
    actions = ["contains treasure", "is haunted", "holds a secret boss", "has rare mobs", "is a quest hub"]
    return f"This location {random.choice(actions)}."

def random_votes():
    upvotes = random.randint(0, 50)
    downvotes = random.randint(0, 20)
    return upvotes, downvotes

# --- Populate ---
def main():
    # Create all tables first
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if pins already exist
        existing_pins = db.query(Pin).count()
        if existing_pins > 0:
            print(f"Database already contains {existing_pins} pins. Skipping population.")
            return
            
        print(f"Adding {NUM_PINS} random pins...")
        for i in range(NUM_PINS):
            x = random.uniform(X_MIN, X_MAX)
            y = random.uniform(Y_MIN, Y_MAX)
            category = random.choice(CATEGORIES)
            name = random_name()
            description = random_description()
            upvotes, downvotes = random_votes()

            pin = Pin(
                x=x,
                y=y,
                name=name,
                description=description,
                category=category,
                upvotes=upvotes,
                downvotes=downvotes
            )
            db.add(pin)
            
            # Progress indicator
            if (i + 1) % 20 == 0:
                print(f"Added {i + 1}/{NUM_PINS} pins...")
                
        db.commit()
        print(f"Successfully added {NUM_PINS} random pins!")
    except Exception as e:
        print(f"Error adding pins: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
