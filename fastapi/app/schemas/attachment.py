from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttachmentBase(BaseModel):
    filename: str
    file_type: str
    file_size: int
    ticket_id: Optional[int] = None
    feature_request_id: Optional[int] = None

class AttachmentCreate(AttachmentBase):
    pass

class AttachmentResponse(AttachmentBase):
    id: int
    file_path: str
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True 