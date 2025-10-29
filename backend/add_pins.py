# scripts/populate_pins.py
import random
from sqlalchemy.orm import Session
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
    db: Session = SessionLocal()
    try:
        for _ in range(NUM_PINS):
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
        db.commit()
        print(f"Successfully added {NUM_PINS} random pins!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
