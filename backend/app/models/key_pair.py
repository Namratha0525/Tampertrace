from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.database import Base
import uuid

class KeyPair(Base):
    __tablename__ = "key_pairs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=True)
    public_key_pem = Column(Text, nullable=False)
    private_key_path = Column(String, nullable=False)
    key_size = Column(Integer, nullable=False)
    algorithm = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
