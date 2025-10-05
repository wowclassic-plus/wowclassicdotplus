from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://classicplusdb_user:yN2K3cUvje4HeleGmEPddRtcQYlJDsF4@dpg-d3dgc4qdbo4c73aruja0-a.virginia-postgres.render.com/classicplusdb"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


