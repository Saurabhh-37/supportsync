from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict
from datetime import datetime, timedelta
from app.database import get_db
from app.models.ticket import Ticket
from app.models.feature_request import FeatureRequest
from app.models.user import User
from app.models.comment import Comment
from app.models.attachment import Attachment
from app.utils.security import get_current_user

router = APIRouter()

@router.get("/dashboard/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard summary statistics"""
    # Only admin can access dashboard
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Get total counts
    total_tickets = db.query(func.count(Ticket.id)).scalar()
    total_feature_requests = db.query(func.count(FeatureRequest.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_comments = db.query(func.count(Comment.id)).scalar()
    total_attachments = db.query(func.count(Attachment.id)).scalar()

    # Get ticket statistics
    tickets_by_status = db.query(
        Ticket.status,
        func.count(Ticket.id)
    ).group_by(Ticket.status).all()
    ticket_status_stats = {status: count for status, count in tickets_by_status}

    # Get feature request statistics
    requests_by_status = db.query(
        FeatureRequest.status,
        func.count(FeatureRequest.id)
    ).group_by(FeatureRequest.status).all()
    request_status_stats = {status: count for status, count in requests_by_status}

    # Get user statistics
    users_by_role = db.query(
        User.role,
        func.count(User.id)
    ).group_by(User.role).all()
    user_role_stats = {role: count for role, count in users_by_role}

    # Get recent activity counts (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    recent_tickets = db.query(func.count(Ticket.id)).filter(
        Ticket.created_at >= seven_days_ago
    ).scalar()
    
    recent_requests = db.query(func.count(FeatureRequest.id)).filter(
        FeatureRequest.created_at >= seven_days_ago
    ).scalar()
    
    recent_comments = db.query(func.count(Comment.id)).filter(
        Comment.created_at >= seven_days_ago
    ).scalar()
    
    recent_attachments = db.query(func.count(Attachment.id)).filter(
        Attachment.created_at >= seven_days_ago
    ).scalar()

    return {
        "total_counts": {
            "tickets": total_tickets,
            "feature_requests": total_feature_requests,
            "users": total_users,
            "comments": total_comments,
            "attachments": total_attachments
        },
        "ticket_status": ticket_status_stats,
        "feature_request_status": request_status_stats,
        "user_roles": user_role_stats,
        "recent_activity": {
            "tickets": recent_tickets,
            "feature_requests": recent_requests,
            "comments": recent_comments,
            "attachments": recent_attachments
        }
    }

@router.get("/dashboard/activity")
def get_dashboard_activity(
    days: int = 7,  # Default to last 7 days
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent activity data"""
    # Only admin can access dashboard
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Get recent tickets
    recent_tickets = db.query(Ticket).join(User, Ticket.user_id == User.id).filter(
        Ticket.created_at >= start_date
    ).order_by(desc(Ticket.created_at)).limit(10).all()

    # Get recent feature requests
    recent_requests = db.query(FeatureRequest).join(User, FeatureRequest.requester_id == User.id).filter(
        FeatureRequest.created_at >= start_date
    ).order_by(desc(FeatureRequest.created_at)).limit(10).all()

    # Get recent comments
    recent_comments = db.query(Comment).join(User, Comment.user_id == User.id).filter(
        Comment.created_at >= start_date
    ).order_by(desc(Comment.created_at)).limit(10).all()

    # Get recent attachments
    recent_attachments = db.query(Attachment).join(User, Attachment.user_id == User.id).filter(
        Attachment.created_at >= start_date
    ).order_by(desc(Attachment.created_at)).limit(10).all()

    # Get most active users
    most_active_users = db.query(
        User.username,
        func.count(Ticket.id).label('tickets_created'),
        func.count(Comment.id).label('comments_made')
    ).outerjoin(Ticket, Ticket.user_id == User.id).outerjoin(Comment, Comment.user_id == User.id).group_by(
        User.username
    ).order_by(
        desc(func.count(Ticket.id) + func.count(Comment.id))
    ).limit(5).all()

    # Format the response
    return {
        "recent_tickets": [
            {
                "id": ticket.id,
                "title": ticket.title,
                "status": ticket.status,
                "created_by": ticket.user.username,
                "created_at": ticket.created_at
            }
            for ticket in recent_tickets
        ],
        "recent_feature_requests": [
            {
                "id": request.id,
                "title": request.title,
                "status": request.status,
                "created_by": request.requester.username,
                "created_at": request.created_at
            }
            for request in recent_requests
        ],
        "recent_comments": [
            {
                "id": comment.id,
                "content": comment.content[:100] + "..." if len(comment.content) > 100 else comment.content,
                "created_by": comment.user.username,
                "created_at": comment.created_at
            }
            for comment in recent_comments
        ],
        "recent_attachments": [
            {
                "id": attachment.id,
                "filename": attachment.filename,
                "file_type": attachment.file_type,
                "created_by": attachment.user.username,
                "created_at": attachment.created_at
            }
            for attachment in recent_attachments
        ],
        "most_active_users": [
            {
                "username": username,
                "tickets_created": tickets_created,
                "comments_made": comments_made
            }
            for username, tickets_created, comments_made in most_active_users
        ]
    } 