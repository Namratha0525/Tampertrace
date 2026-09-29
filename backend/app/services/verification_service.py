import json
import base64
import zipfile
import io
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.verification import VerificationLog
from app.document.parser import PDFParser
from app.document.block_extractor import extract_blocks, ContentBlock
from app.document.comparator import compare_blocks, TamperResult
from app.crypto.merkle_tree import MerkleTree
from app.crypto.rsa_service import load_public_key, verify_signature

def verify_document(db: Session, user_id: int, file_bytes: bytes, filename: str, signature_json: dict, public_key_pem: str, manifest_json: dict) -> dict:
    # 1. Parse uploaded document
    parser = PDFParser(file_bytes)
    pages = parser.extract_pages()
    
    # 2 & 3. Extract blocks and calculate current hashes
    current_blocks = extract_blocks(pages)
    current_hashes = [b.content_hash for b in current_blocks]
    
    # 4 & 5. Rebuild Merkle tree and get current root hash
    current_tree = MerkleTree(current_hashes)
    current_root_hash = current_tree.root_hash
    
    # Original data
    original_root_hash = signature_json.get("root_hash")
    
    # 6 & 7. Load public key and Verify RSA signature
    try:
        public_key = load_public_key(public_key_pem)
        signature_bytes = base64.b64decode(signature_json.get("signature", ""))
        sig_valid = verify_signature(public_key, signature_bytes, bytes.fromhex(original_root_hash))
    except Exception:
        sig_valid = False
        
    root_hash_match = (current_root_hash == original_root_hash)
    
    # 8 & 9. Compare original block hashes
    original_blocks_meta = manifest_json.get("blocks", [])
    original_blocks = []
    for i, b in enumerate(original_blocks_meta):
        original_blocks.append(ContentBlock(
            block_id=b.get("block_id", f"block_{i}"),
            page_number=b.get("page", 1),
            block_number=i+1,
            content="",  # we don't have the original text
            content_hash=b.get("hash")
        ))
        
    tamper_results = compare_blocks(original_blocks, current_blocks)
    tampering_detected = any(r.status != 'match' for r in tamper_results if r.status != 'match')
    
    # If blocks perfectly match, double check if root hash failed due to structural reasons.
    # We will trust root hash primarily.
    if not root_hash_match:
        tampering_detected = True
        
    status = "VALID" if sig_valid and root_hash_match and not tampering_detected else "INVALID"
    
    # Build affected blocks info
    affected_blocks = [
        {
            "block_id": r.block_id,
            "page_number": r.page_number,
            "block_number": r.block_number,
            "status": r.status,
            "original_hash": r.original_hash,
            "current_hash": r.current_hash
        } for r in tamper_results if r.status != 'match'
    ]
    
    blocks_summary = {
        "total": len(original_blocks),
        "modified": len([r for r in tamper_results if r.status == 'modified']),
        "added": len([r for r in tamper_results if r.status == 'added']),
        "deleted": len([r for r in tamper_results if r.status == 'deleted']),
    }
    
    report_data = {
        "filename": filename,
        "document_name": manifest_json.get("document_name", filename),
        "status": status,
        "signature_valid": sig_valid,
        "root_hash_match": root_hash_match,
        "original_root_hash": original_root_hash,
        "current_root_hash": current_root_hash,
        "blocks_summary": blocks_summary,
        "affected_blocks": affected_blocks
    }
    
    # 10. Create verification log in DB
    log = VerificationLog(
        user_id=user_id,
        status=status,
        signature_valid=sig_valid,
        root_hash_match=root_hash_match,
        tampering_detected=tampering_detected,
        affected_blocks=json.dumps(affected_blocks),
        report_data=json.dumps(report_data),
        original_document_name=manifest_json.get("document_name")
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    # 11. Return result dict
    return {
        "verification_id": log.id,
        "valid": status == "VALID",
        "signature_valid": sig_valid,
        "root_hash_match": root_hash_match,
        "tampering_detected": tampering_detected,
        "affected_blocks": affected_blocks,
        "merkle_tree": current_tree.get_tree_structure(),
        "current_root_hash": current_root_hash,
        "original_root_hash": original_root_hash,
        "blocks_summary": blocks_summary
    }

def verify_package(db: Session, user_id: int, package_bytes: bytes) -> dict:
    try:
        with zipfile.ZipFile(io.BytesIO(package_bytes)) as zf:
            pdf_bytes = zf.read("document.pdf")
            sig_json = json.loads(zf.read("signature.json"))
            pub_pem = zf.read("public_key.pem").decode('utf-8')
            man_json = json.loads(zf.read("manifest.json"))
            
        return verify_document(db, user_id, pdf_bytes, "document.pdf", sig_json, pub_pem, man_json)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid package format: {str(e)}")
