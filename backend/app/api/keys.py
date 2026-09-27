import os
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.key_pair import KeyPair
from app.services.auth_service import get_current_user
from app.crypto.rsa_service import generate_key_pair, serialize_public_key, save_private_key
from app.config import settings

router = APIRouter(prefix="/api/keys", tags=["keys"])

class KeyCreate(BaseModel):
    name: Optional[str] = None

@router.post("/generate")
def generate_keys(req: KeyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    priv, pub = generate_key_pair(settings.RSA_KEY_SIZE)
    pub_pem = serialize_public_key(pub)
    
    keys_dir = os.path.join(settings.STORAGE_PATH, 'keys')
    os.makedirs(keys_dir, exist_ok=True)
    
    db_key = KeyPair(
        user_id=current_user.id,
        name=req.name or "Default Key",
        public_key_pem=pub_pem,
        private_key_path="", # Update after ID generation
        key_size=settings.RSA_KEY_SIZE,
        algorithm="RSA-PSS-SHA256"
    )
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    priv_path = os.path.join(keys_dir, f"{db_key.id}.pem")
    save_private_key(priv, priv_path)
    
    db_key.private_key_path = priv_path
    db.commit()
    
    return {
        "key_id": db_key.id,
        "name": db_key.name,
        "public_key": db_key.public_key_pem,
        "algorithm": db_key.algorithm,
        "key_size": db_key.key_size,
        "created_at": db_key.created_at
    }

@router.get("")
def list_keys(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    keys = db.query(KeyPair).filter(KeyPair.user_id == current_user.id).all()
    return [{"key_id": k.id, "name": k.name, "created_at": k.created_at} for k in keys]

@router.get("/{key_id}")
def get_key(key_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    key = db.query(KeyPair).filter(KeyPair.id == key_id, KeyPair.user_id == current_user.id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    return {
        "key_id": key.id,
        "name": key.name,
        "public_key": key.public_key_pem,
        "algorithm": key.algorithm,
        "key_size": key.key_size,
        "created_at": key.created_at
    }

@router.get("/{key_id}/download")
def download_public_key(key_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    key = db.query(KeyPair).filter(KeyPair.id == key_id, KeyPair.user_id == current_user.id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    return Response(content=key.public_key_pem, media_type="application/x-pem-file", headers={"Content-Disposition": f"attachment; filename={key.name or 'public_key'}.pem"})
