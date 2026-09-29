import os
import json
import base64
import zipfile
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.config import settings
from app.models.document import Document
from app.models.key_pair import KeyPair
from app.document.parser import PDFParser
from app.document.block_extractor import extract_blocks, ContentBlock
from app.crypto.merkle_tree import MerkleTree
from app.crypto.rsa_service import load_private_key, serialize_public_key, sign_data

def sign_document(db: Session, user_id: int, file_bytes: bytes, filename: str, document_name: str, key_id: str) -> dict:
    # 1. Validate file extension and size
    if not any(filename.lower().endswith(ext) for ext in settings.ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid file extension")
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
        
    key = db.query(KeyPair).filter(KeyPair.id == key_id, KeyPair.user_id == user_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
        
    # 2. Save uploaded file
    docs_dir = os.path.join(settings.STORAGE_PATH, 'documents')
    os.makedirs(docs_dir, exist_ok=True)
    doc_path = os.path.join(docs_dir, f"{document_name}_{filename}")
    with open(doc_path, 'wb') as f:
        f.write(file_bytes)
        
    # 3 & 4. Parse PDF, extract pages, extract blocks
    try:
        parser = PDFParser(file_bytes)
        pages = parser.extract_pages()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or corrupt PDF document. Please upload a valid PDF file.")
        
    blocks = extract_blocks(pages)
    
    # 5. Get block hashes
    block_hashes = [b.content_hash for b in blocks]
    
    # 6 & 7. Build Merkle tree & Get root hash
    tree = MerkleTree(block_hashes)
    root_hash = tree.root_hash
    
    # 8. Load private key
    private_key = load_private_key(key.private_key_path)
    
    # 9. Sign root hash bytes
    signature = sign_data(private_key, bytes.fromhex(root_hash))
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    
    # 10. Create manifest
    manifest = {
        "document_name": document_name,
        "filename": filename,
        "blocks": [{"block_id": b.block_id, "hash": b.content_hash, "page": b.page_number} for b in blocks],
        "root_hash": root_hash,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # 11. Create signature JSON
    signature_json = {
        "algorithm": key.algorithm,
        "key_size": key.key_size,
        "root_hash": root_hash,
        "signature": signature_b64,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # 12. Save Document to DB
    new_doc = Document(
        user_id=user_id,
        name=document_name,
        filename=filename,
        file_path=doc_path,
        root_hash=root_hash,
        signature_data=json.dumps(signature_json),
        key_id=key_id,
        block_data=json.dumps([{"id": b.block_id, "content": b.content, "hash": b.content_hash, "page": b.page_number, "num": b.block_number} for b in blocks]),
        manifest=json.dumps(manifest)
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    # 13 & 14. Create ZIP package
    pkg_dir = os.path.join(settings.STORAGE_PATH, 'packages')
    os.makedirs(pkg_dir, exist_ok=True)
    zip_path = os.path.join(pkg_dir, f"{new_doc.id}.zip")
    
    with zipfile.ZipFile(zip_path, 'w') as zf:
        zf.writestr('document.pdf', file_bytes)
        zf.writestr('signature.json', json.dumps(signature_json, indent=2))
        zf.writestr('public_key.pem', key.public_key_pem)
        zf.writestr('manifest.json', json.dumps(manifest, indent=2))
        
    return {
        "document_id": new_doc.id,
        "name": new_doc.name,
        "root_hash": new_doc.root_hash,
        "signature": base64.b64encode(signature).decode('utf-8'),
        "status": "success",
        "blocks": [
            {
                "block_id": b.block_id,
                "page_number": b.page_number,
                "block_number": b.block_number,
                "content": b.content,
                "content_hash": b.content_hash
            } for b in blocks
        ]
    }
