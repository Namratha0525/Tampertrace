from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.database import Base
import uuid

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    version = Column(Integer, default=1)
    root_hash = Column(String, nullable=False)
    signature_data = Column(Text, nullable=False)
    key_id = Column(String, ForeignKey("key_pairs.id"), nullable=False)
    block_data = Column(Text, nullable=False)
    manifest = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
