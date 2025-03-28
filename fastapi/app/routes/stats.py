from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List
from app.database import get_db
from app.models.ticket import Ticket
from app.models.feature_request import FeatureRequest
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter()

@router.get("/stats/tickets")
def get_ticket_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics about tickets"""
    # Only admin can access all stats
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Total tickets
    total_tickets = db.query(func.count(Ticket.id)).scalar()

    # Tickets by status
    tickets_by_status = db.query(
        Ticket.status,
        func.count(Ticket.id)
    ).group_by(Ticket.status).all()
    status_stats = {status: count for status, count in tickets_by_status}

    # Tickets by priority
    tickets_by_priority = db.query(
        Ticket.priority,
        func.count(Ticket.id)
    ).group_by(Ticket.priority).all()
    priority_stats = {priority: count for priority, count in tickets_by_priority}

    # Tickets by user (created by)
    tickets_by_user = db.query(
        User.username,
        func.count(Ticket.id)
    ).join(Ticket, Ticket.user_id == User.id).group_by(User.username).all()
    user_stats = {username: count for username, count in tickets_by_user}

    # Assigned tickets count
    assigned_tickets = db.query(func.count(Ticket.id)).filter(Ticket.assigned_to.isnot(None)).scalar()

    return {
        "total_tickets": total_tickets,
        "assigned_tickets": assigned_tickets,
        "by_status": status_stats,
        "by_priority": priority_stats,
        "by_user": user_stats
    }

@router.get("/stats/feature-requests")
def get_feature_request_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics about feature requests"""
    # Only admin can access all stats
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Total feature requests
    total_requests = db.query(func.count(FeatureRequest.id)).scalar()

    # Requests by status
    requests_by_status = db.query(
        FeatureRequest.status,
        func.count(FeatureRequest.id)
    ).group_by(FeatureRequest.status).all()
    status_stats = {status: count for status, count in requests_by_status}

    # Requests by priority
    requests_by_priority = db.query(
        FeatureRequest.priority,
        func.count(FeatureRequest.id)
    ).group_by(FeatureRequest.priority).all()
    priority_stats = {priority: count for priority, count in requests_by_priority}

    # Requests by user
    requests_by_user = db.query(
        User.username,
        func.count(FeatureRequest.id)
    ).join(FeatureRequest, FeatureRequest.requester_id == User.id).group_by(User.username).all()
    user_stats = {username: count for username, count in requests_by_user}

    # Most upvoted requests
    most_upvoted = db.query(
        FeatureRequest.title,
        func.count(FeatureRequest.id).label('upvotes')
    ).join(FeatureRequest.upvoted_by).group_by(FeatureRequest.id).order_by(func.count(FeatureRequest.id).desc()).limit(5).all()
    top_upvoted = [{"title": title, "upvotes": upvotes} for title, upvotes in most_upvoted]

    return {
        "total_requests": total_requests,
        "by_status": status_stats,
        "by_priority": priority_stats,
        "by_user": user_stats,
        "top_upvoted": top_upvoted
    }

@router.get("/stats/users")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics about users"""
    # Only admin can access all stats
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Total users
    total_users = db.query(func.count(User.id)).scalar()

    # Users by role
    users_by_role = db.query(
        User.role,
        func.count(User.id)
    ).group_by(User.role).all()
    role_stats = {role: count for role, count in users_by_role}

    # Active vs inactive users
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    inactive_users = db.query(func.count(User.id)).filter(User.is_active == False).scalar()

    # Most active users (by ticket creation)
    most_active_users = db.query(
        User.username,
        func.count(Ticket.id).label('tickets_created')
    ).join(Ticket, Ticket.user_id == User.id).group_by(User.username).order_by(func.count(Ticket.id).desc()).limit(5).all()
    top_users = [{"username": username, "tickets_created": count} for username, count in most_active_users]

    # Users with most assigned tickets
    most_assigned = db.query(
        User.username,
        func.count(Ticket.id).label('assigned_tickets')
    ).join(Ticket, Ticket.assigned_to == User.id).group_by(User.username).order_by(func.count(Ticket.id).desc()).limit(5).all()
    top_assigned = [{"username": username, "assigned_tickets": count} for username, count in most_assigned]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "by_role": role_stats,
        "top_users": top_users,
        "top_assigned": top_assigned
    } 