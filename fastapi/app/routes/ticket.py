from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from jose import JWTError, jwt
from app.database import get_db
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import (
    TicketCreate, TicketResponse, TicketUpdate, TicketWithComments,
    Priority, Status
)
from app.utils.security import oauth2_scheme, SECRET_KEY, ALGORITHM, get_current_user

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Helper function to get the authenticated user from the token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

@router.post("/tickets", response_model=TicketResponse)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new ticket"""
    new_ticket = Ticket(
        title=ticket_data.title,
        description=ticket_data.description,
        priority=ticket_data.priority,
        status=ticket_data.status,
        user_id=current_user.id
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("/tickets", response_model=List[TicketResponse])
def get_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[Status] = None,
    priority: Optional[Priority] = None,
    search: Optional[str] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tickets with filtering and pagination"""
    query = db.query(Ticket)
    
    # Apply filters based on user role
    if current_user.role != "admin":
        query = query.filter(Ticket.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if assigned_to:
        query = query.filter(Ticket.assigned_to == assigned_to)
    if search:
        search_filter = or_(
            Ticket.title.ilike(f"%{search}%"),
            Ticket.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Apply pagination
    total = query.count()
    tickets = query.offset(skip).limit(limit).all()
    
    # Load user relationships
    for ticket in tickets:
        ticket.user = db.query(User).filter(User.id == ticket.user_id).first()
        if ticket.assigned_to:
            ticket.assigned_user = db.query(User).filter(User.id == ticket.assigned_to).first()
    
    return tickets

@router.get("/tickets/me", response_model=List[TicketResponse])
def get_my_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[Status] = None,
    priority: Optional[Priority] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tickets created by the current user, or all tickets if user is admin"""
    query = db.query(Ticket)
    
    # Only filter by user_id if the user is not an admin
    if current_user.role != "admin":
        query = query.filter(Ticket.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if search:
        search_filter = or_(
            Ticket.title.ilike(f"%{search}%"),
            Ticket.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Apply pagination
    total = query.count()
    tickets = query.offset(skip).limit(limit).all()
    
    # Load user relationships
    for ticket in tickets:
        ticket.user = db.query(User).filter(User.id == ticket.user_id).first()
        if ticket.assigned_to:
            ticket.assigned_user = db.query(User).filter(User.id == ticket.assigned_to).first()
    
    return tickets

@router.get("/tickets/assigned", response_model=List[TicketResponse])
def get_assigned_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[Status] = None,
    priority: Optional[Priority] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tickets assigned to the current user"""
    query = db.query(Ticket).filter(Ticket.assigned_to == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if search:
        search_filter = or_(
            Ticket.title.ilike(f"%{search}%"),
            Ticket.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Apply pagination
    total = query.count()
    tickets = query.offset(skip).limit(limit).all()
    
    return tickets

@router.get("/tickets/{ticket_id}", response_model=TicketWithComments)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific ticket by ID"""
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
    
    # Load the assigned user relationship
    if ticket.assigned_to:
        ticket.assigned_user = db.query(User).filter(User.id == ticket.assigned_to).first()
    
    # Load the user who created the ticket
    ticket.user = db.query(User).filter(User.id == ticket.user_id).first()
    
    return ticket

@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a ticket"""
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
    
    # Update fields
    update_data = ticket_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)
    
    # Load the assigned user relationship
    if ticket.assigned_to:
        ticket.assigned_user = db.query(User).filter(User.id == ticket.assigned_to).first()
    
    # Load the user who created the ticket
    ticket.user = db.query(User).filter(User.id == ticket.user_id).first()
    
    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a ticket"""
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
    
    db.delete(ticket)
    db.commit()
    return {"message": "Ticket deleted successfully"}