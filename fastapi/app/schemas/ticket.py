from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Status(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class UserBase(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    priority: Priority = Field(default=Priority.LOW)
    status: Status = Field(default=Status.NEW)

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    assigned_to: Optional[int] = None

class TicketResponse(TicketBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int
    assigned_to: Optional[int] = None
    assigned_user: Optional[UserBase] = None
    user: Optional[UserBase] = None

    class Config:
        from_attributes = True

# Import CommentResponse here to avoid circular import
from app.schemas.comment import CommentResponse

class TicketWithComments(TicketResponse):
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True