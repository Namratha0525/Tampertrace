import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.services.auth_service import get_current_user
from app.services.signing_service import sign_document
from app.config import settings

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/sign")
async def sign_doc(
    file: UploadFile = File(...),
    key_id: str = Form(...),
    document_name: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    result = sign_document(db, current_user.id, file_bytes, file.filename, document_name, key_id)
    return result

@router.get("")
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    return [{"id": d.id, "name": d.name, "filename": d.filename, "created_at": d.created_at} for d in docs]

@router.get("/{doc_id}")
def get_document(doc_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "id": doc.id,
        "name": doc.name,
        "filename": doc.filename,
        "root_hash": doc.root_hash,
        "blocks": json.loads(doc.block_data),
        "manifest": json.loads(doc.manifest),
        "signature": json.loads(doc.signature_data),
        "created_at": doc.created_at
    }

@router.get("/{doc_id}/package")
def download_package(doc_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    pkg_path = os.path.join(settings.STORAGE_PATH, 'packages', f"{doc.id}.zip")
    if not os.path.exists(pkg_path):
        raise HTTPException(status_code=404, detail="Package not found on disk")
        
    return FileResponse(path=pkg_path, filename=f"{doc.name}_package.zip", media_type="application/zip")

@router.get("/{doc_id}/merkle")
def get_merkle(doc_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    blocks = json.loads(doc.block_data)
    from app.crypto.merkle_tree import MerkleTree
    tree = MerkleTree([b['hash'] for b in blocks])
    return tree.get_tree_structure()
