from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
from app.schemas.user import UserBase

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Status(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

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
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        
        # Add debug logging for model creation
        def dict(self, *args, **kwargs):
            d = super().dict(*args, **kwargs)
            print(f"\n=== TicketResponse Dict ===")
            print(f"User: {d.get('user')}")
            print(f"Assigned User: {d.get('assigned_user')}")
            return d

# Import CommentResponse here to avoid circular import
from app.schemas.comment import CommentResponse

class TicketWithComments(TicketResponse):
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True
        populate_by_name = True