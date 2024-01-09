from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
import os 

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://your_db_user:your_db_password@localhost/your_db_name")
engine = create_engine(DATABASE_URL)
Base = declarative_base()

class TodoDB(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI()
# Allow all origins for development, you might want to restrict this in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TodoItem(BaseModel):
    title: str
    description: str = None

class TodoResponse(BaseModel):
    id: int
    title: str
    description: str

@app.post("/todos", response_model=TodoResponse)
async def create_todo(item: TodoItem):
    db_item = TodoDB(**item.dict())
    db = SessionLocal()
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    db.close()
    return TodoResponse(**db_item.__dict__)

@app.get("/todos", response_model=list[TodoResponse])
async def read_todos():
    db = SessionLocal()
    todos = db.query(TodoDB).all()
    db.close()
    return [TodoResponse(**todo.__dict__) for todo in todos]
