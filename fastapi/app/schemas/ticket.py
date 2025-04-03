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

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    user_id: int
    assigned_to: Optional[int] = None
    user: UserBase
    assigned_user: Optional[UserBase] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def dict(self, *args, **kwargs):
        d = super().dict(*args, **kwargs)
        print(f"\n=== TicketResponse Serialization ===")
        print(f"User data: {d.get('user')}")
        print(f"Assigned user data: {d.get('assigned_user')}")
        return d

# Import CommentResponse here to avoid circular import
from app.schemas.comment import CommentResponse

class TicketWithComments(TicketResponse):
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True
        populate_by_name = True