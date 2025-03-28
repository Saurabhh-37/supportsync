from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from app.database import get_db

router = APIRouter()

@router.get("/health", tags=["Health Check"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Execute a simple query using text()
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "not connected", "error": str(e)}
