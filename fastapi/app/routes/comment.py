from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.comment import Comment
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.utils.security import get_current_user

router = APIRouter()

@router.post("/tickets/{ticket_id}/comments", response_model=CommentResponse)
def add_comment(
    ticket_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if ticket.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    new_comment = Comment(
        content=comment_data.content,
        ticket_id=ticket_id,
        user_id=current_user.id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment

@router.get("/tickets/{ticket_id}/comments", response_model=list[CommentResponse])
def get_ticket_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if ticket.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get comments with eager loading of user relationships
    comments = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(Comment.ticket_id == ticket_id).all()
    
    # Detailed debug logging for comments
    print(f"\nComments for Ticket {ticket_id}:")
    for comment in comments:
        print(f"\nComment {comment.id}:")
        print(f"  Content: {comment.content}")
        print(f"  User: {comment.user.username if comment.user else 'None'}")
        print(f"  User ID: {comment.user_id}")
        print(f"  Created At: {comment.created_at}")
    
    return comments
