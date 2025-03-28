from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Association table for feature request upvotes
feature_request_upvotes = Table(
    'feature_request_upvotes',
    Base.metadata,
    Column('feature_request_id', Integer, ForeignKey('feature_requests.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class FeatureRequest(Base):
    __tablename__ = "feature_requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="Proposed")  # Proposed, Under Review, Approved, Rejected
    priority = Column(String(50), nullable=False, default="Medium")  # Low, Medium, High
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    requester = relationship("User", back_populates="feature_requests")
    comments = relationship("FeatureRequestComment", back_populates="feature_request", cascade="all, delete-orphan")
    upvoted_by = relationship(
        "User",
        secondary=feature_request_upvotes,
        backref="upvoted_feature_requests"
    )
    
    # Attachments relationship
    attachments = relationship("Attachment", back_populates="feature_request", cascade="all, delete-orphan")
    
    # Computed property for upvotes count
    @property
    def upvotes_count(self):
        return len(self.upvoted_by)

class FeatureRequestComment(Base):
    __tablename__ = "feature_request_comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    feature_request_id = Column(Integer, ForeignKey("feature_requests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    feature_request = relationship("FeatureRequest", back_populates="comments")
    user = relationship("User", back_populates="feature_request_comments") 