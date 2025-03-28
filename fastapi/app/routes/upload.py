import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.attachment import Attachment
from app.models.user import User
from app.models.ticket import Ticket
from app.models.feature_request import FeatureRequest
from app.schemas.attachment import AttachmentResponse
from app.utils.security import get_current_user
from datetime import datetime

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_file(file: UploadFile, user_id: int) -> str:
    """Save uploaded file and return the file path"""
    # Create user-specific directory
    user_dir = os.path.join(UPLOAD_DIR, str(user_id))
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(user_dir, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path

@router.post("/upload/attachments", response_model=AttachmentResponse)
async def upload_attachment(
    file: UploadFile = File(...),
    ticket_id: Optional[int] = None,
    feature_request_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a file attachment"""
    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    file.file.seek(0, 2)  # Seek to end of file
    file_size = file.file.tell()
    file.file.seek(0)  # Reset file pointer
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB."
        )

    # Validate ticket or feature request if specified
    if ticket_id:
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

    if feature_request_id:
        feature_request = db.query(FeatureRequest).filter(FeatureRequest.id == feature_request_id).first()
        if not feature_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature request not found"
            )
        # Check permissions
        if feature_request.requester_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )

    # Save file
    file_path = save_file(file, current_user.id)

    # Create attachment record
    attachment = Attachment(
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=file_size,
        user_id=current_user.id,
        ticket_id=ticket_id,
        feature_request_id=feature_request_id
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment

@router.delete("/upload/attachments/{attachment_id}")
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a file attachment"""
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    # Check permissions
    if attachment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Delete file from disk
    try:
        os.remove(attachment.file_path)
    except OSError:
        # File might not exist, continue with database deletion
        pass

    # Delete from database
    db.delete(attachment)
    db.commit()

    return {"message": "Attachment deleted successfully"} 