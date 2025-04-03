from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.feature_request import FeatureRequest, FeatureRequestComment
from app.models.user import User
from app.schemas.feature_request import (
    FeatureRequestCreate, FeatureRequestResponse, FeatureRequestUpdate,
    FeatureRequestWithComments, FeatureRequestCommentCreate, FeatureRequestCommentResponse,
    FeatureRequestStatus, FeatureRequestPriority
)
from app.utils.security import get_current_user

router = APIRouter()

@router.post("/feature-requests", response_model=FeatureRequestResponse)
def create_feature_request(
    request_data: FeatureRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new feature request"""
    new_request = FeatureRequest(
        title=request_data.title,
        description=request_data.description,
        priority=request_data.priority,
        status=request_data.status,
        requester_id=current_user.id
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/feature-requests", response_model=List[FeatureRequestResponse])
def get_feature_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[FeatureRequestStatus] = None,
    priority: Optional[FeatureRequestPriority] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get feature requests with filtering and pagination"""
    query = db.query(FeatureRequest)
    
    # Apply filters
    if status:
        query = query.filter(FeatureRequest.status == status)
    if priority:
        query = query.filter(FeatureRequest.priority == priority)
    if search:
        query = query.filter(
            (FeatureRequest.title.ilike(f"%{search}%")) |
            (FeatureRequest.description.ilike(f"%{search}%"))
        )
    
    # Apply pagination
    total = query.count()
    requests = query.offset(skip).limit(limit).all()
    
    # Load requester relationships
    for request in requests:
        request.requester = db.query(User).filter(User.id == request.requester_id).first()
    
    return requests

@router.get("/feature-requests/{request_id}", response_model=FeatureRequestWithComments)
def get_feature_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific feature request by ID"""
    request = db.query(FeatureRequest).filter(FeatureRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature request not found"
        )
    
    # Load requester relationship
    request.requester = db.query(User).filter(User.id == request.requester_id).first()
    
    return request

@router.put("/feature-requests/{request_id}", response_model=FeatureRequestResponse)
def update_feature_request(
    request_id: int,
    request_data: FeatureRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a feature request"""
    request = db.query(FeatureRequest).filter(FeatureRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature request not found"
        )
    
    # Check permissions (only requester or admin can update)
    if request.requester_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update fields
    update_data = request_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(request, key, value)
    
    db.commit()
    db.refresh(request)
    return request

@router.delete("/feature-requests/{request_id}")
def delete_feature_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a feature request"""
    request = db.query(FeatureRequest).filter(FeatureRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature request not found"
        )
    
    # Check permissions (only requester or admin can delete)
    if request.requester_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(request)
    db.commit()
    return {"message": "Feature request deleted successfully"}

@router.post("/feature-requests/{request_id}/upvote")
def upvote_feature_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upvote a feature request"""
    request = db.query(FeatureRequest).filter(FeatureRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature request not found"
        )
    
    # Check if user has already upvoted
    if current_user in request.upvoted_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already upvoted this feature request"
        )
    
    # Add upvote
    request.upvoted_by.append(current_user)
    db.commit()
    
    return {"message": "Feature request upvoted successfully", "upvotes_count": request.upvotes_count}

@router.post("/feature-requests/{request_id}/comments", response_model=FeatureRequestCommentResponse)
def add_feature_request_comment(
    request_id: int,
    comment_data: FeatureRequestCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a feature request"""
    request = db.query(FeatureRequest).filter(FeatureRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature request not found"
        )
    
    new_comment = FeatureRequestComment(
        content=comment_data.content,
        feature_request_id=request_id,
        user_id=current_user.id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment

@router.get("/feature-requests/{request_id}/comments", response_model=List[FeatureRequestCommentResponse])
def get_feature_request_comments(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a feature request"""
    request = db.query(FeatureRequest).filter(FeatureRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature request not found"
        )
    
    comments = db.query(FeatureRequestComment).filter(
        FeatureRequestComment.feature_request_id == request_id
    ).all()
    
    return comments 