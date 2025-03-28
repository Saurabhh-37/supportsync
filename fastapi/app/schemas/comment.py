from pydantic import BaseModel, Field
from datetime import datetime

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    user_id: int
    ticket_id: int

    class Config:
        from_attributes = True
