from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models.ticket import Ticket
from app.models.feature_request import FeatureRequest
from app.models.user import User
from app.schemas.ticket import TicketResponse
from app.schemas.feature_request import FeatureRequestResponse
from app.schemas.user import UserResponse
from app.utils.security import get_current_user

router = APIRouter()

@router.get("/search/tickets", response_model=List[TicketResponse])
def search_tickets(
    query: str = Query(..., min_length=2, description="Search query"),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search tickets by title, description, or user"""
    # Base query
    search_query = db.query(Ticket)
    
    # Apply search filter
    search_filter = or_(
        Ticket.title.ilike(f"%{query}%"),
        Ticket.description.ilike(f"%{query}%"),
        User.username.ilike(f"%{query}%")
    )
    search_query = search_query.join(User, Ticket.user_id == User.id).filter(search_filter)
    
    # Apply additional filters
    if status:
        search_query = search_query.filter(Ticket.status == status)
    if priority:
        search_query = search_query.filter(Ticket.priority == priority)
    
    # Apply permissions (users can only see their own tickets unless admin)
    if current_user.role != "admin":
        search_query = search_query.filter(Ticket.user_id == current_user.id)
    
    # Apply pagination
    total = search_query.count()
    tickets = search_query.offset(skip).limit(limit).all()
    
    return tickets

@router.get("/search/feature-requests", response_model=List[FeatureRequestResponse])
def search_feature_requests(
    query: str = Query(..., min_length=2, description="Search query"),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search feature requests by title, description, or user"""
    # Base query
    search_query = db.query(FeatureRequest)
    
    # Apply search filter
    search_filter = or_(
        FeatureRequest.title.ilike(f"%{query}%"),
        FeatureRequest.description.ilike(f"%{query}%"),
        User.username.ilike(f"%{query}%")
    )
    search_query = search_query.join(User, FeatureRequest.requester_id == User.id).filter(search_filter)
    
    # Apply additional filters
    if status:
        search_query = search_query.filter(FeatureRequest.status == status)
    if priority:
        search_query = search_query.filter(FeatureRequest.priority == priority)
    
    # Apply pagination
    total = search_query.count()
    requests = search_query.offset(skip).limit(limit).all()
    
    return requests

@router.get("/search/users", response_model=List[UserResponse])
def search_users(
    query: str = Query(..., min_length=2, description="Search query"),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search users by username or email"""
    # Only admin can search users
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Base query
    search_query = db.query(User)
    
    # Apply search filter
    search_filter = or_(
        User.username.ilike(f"%{query}%"),
        User.email.ilike(f"%{query}%")
    )
    search_query = search_query.filter(search_filter)
    
    # Apply additional filters
    if role:
        search_query = search_query.filter(User.role == role)
    if is_active is not None:
        search_query = search_query.filter(User.is_active == is_active)
    
    # Apply pagination
    total = search_query.count()
    users = search_query.offset(skip).limit(limit).all()
    
    return users 