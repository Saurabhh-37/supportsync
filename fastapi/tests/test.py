from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User

def delete_all_users():
    db: Session = SessionLocal()
    try:
        db.query(User).delete()  # Delete all users
        db.commit()
        print("All user data deleted successfully!")
    except Exception as e:
        db.rollback()
        print("Error:", e)
    finally:
        db.close()

delete_all_users()
