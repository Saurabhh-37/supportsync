from app.database import engine, Base
from app.models.user import User
from app.models.ticket import Ticket
from app.models.comment import Comment

def init_db():
    # Drop all tables first
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database tables created successfully!") 