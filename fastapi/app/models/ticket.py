from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(String, nullable=False, default="low")
    status = Column(String, nullable=False, default="new")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # User who created the ticket
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="created_tickets", foreign_keys=[user_id])
    
    # User who is assigned to the ticket
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_user = relationship("User", back_populates="assigned_tickets", foreign_keys=[assigned_to])
    
    # Comments relationship
    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")
    
    # Attachments relationship
    attachments = relationship("Attachment", back_populates="ticket", cascade="all, delete-orphan")
    
