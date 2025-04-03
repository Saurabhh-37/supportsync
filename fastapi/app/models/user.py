from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database import Base  # Import only Base to prevent circular import
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # Store as plain text
    role = Column(String, default="user", nullable=False)  # user, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Tickets created by the user
    created_tickets = relationship(
        "Ticket",
        back_populates="user",
        foreign_keys="[Ticket.user_id]",
        cascade="all, delete"
    )
    
    # Tickets assigned to the user
    assigned_tickets = relationship(
        "Ticket",
        back_populates="assigned_user",
        foreign_keys="[Ticket.assigned_to]",
        cascade="all, delete"
    )
    
    # Comments relationship
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")

    # Feature requests created by the user
    feature_requests = relationship("FeatureRequest", back_populates="requester")
    feature_request_comments = relationship("FeatureRequestComment", back_populates="user")

    # Attachments relationship
    attachments = relationship("Attachment", back_populates="user", cascade="all, delete-orphan")