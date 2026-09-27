from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, Text
from datetime import datetime, timezone
from app.database import Base
import uuid

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, nullable=False)
    signature_valid = Column(Boolean, nullable=False)
    root_hash_match = Column(Boolean, nullable=False)
    tampering_detected = Column(Boolean, nullable=False)
    affected_blocks = Column(Text, nullable=False)
    report_data = Column(Text, nullable=False)
    original_document_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
