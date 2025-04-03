from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.schemas.user import UserBase

class FeatureRequestStatus(str, Enum):
    PROPOSED = "Proposed"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class FeatureRequestPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class FeatureRequestBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    priority: FeatureRequestPriority = Field(default=FeatureRequestPriority.MEDIUM)
    status: FeatureRequestStatus = Field(default=FeatureRequestStatus.PROPOSED)

class FeatureRequestCreate(FeatureRequestBase):
    pass

class FeatureRequestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[FeatureRequestPriority] = None
    status: Optional[FeatureRequestStatus] = None

class FeatureRequestCommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class FeatureRequestCommentCreate(FeatureRequestCommentBase):
    pass

class FeatureRequestCommentResponse(FeatureRequestCommentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: int

    class Config:
        from_attributes = True

class FeatureRequestResponse(FeatureRequestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    requester_id: int
    requester: Optional[UserBase] = None
    upvotes_count: int
    comments: List[FeatureRequestCommentResponse] = []

    class Config:
        from_attributes = True

class FeatureRequestWithComments(FeatureRequestResponse):
    pass 