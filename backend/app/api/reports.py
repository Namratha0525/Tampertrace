from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.verification import VerificationLog
from app.services.auth_service import get_current_user
import json

router = APIRouter(prefix="/api/stats", tags=["reports"])

@router.get("")
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs_signed = db.query(Document).filter(Document.user_id == current_user.id).count()
    verifications = db.query(VerificationLog).filter(VerificationLog.user_id == current_user.id).all()
    
    docs_verified = len(verifications)
    valid_signatures = sum(1 for v in verifications if v.signature_valid)
    tampered_docs = sum(1 for v in verifications if v.tampering_detected)
    
    recent_activity = []
    
    # Get recent docs
    recent_docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).limit(5).all()
    for d in recent_docs:
        recent_activity.append({
            "type": "sign",
            "name": d.name,
            "date": d.created_at.isoformat()
        })
        
    # Get recent verifications
    recent_vers = sorted(verifications, key=lambda v: v.created_at, reverse=True)[:5]
    for v in recent_vers:
        recent_activity.append({
            "type": "verify",
            "name": v.original_document_name or "Unknown Document",
            "status": v.status,
            "date": v.created_at.isoformat()
        })
        
    # Sort combined activity
    recent_activity.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "documents_signed": docs_signed,
        "documents_verified": docs_verified,
        "valid_signatures": valid_signatures,
        "tampered_documents": tampered_docs,
        "recent_activity": recent_activity[:10]
    }
