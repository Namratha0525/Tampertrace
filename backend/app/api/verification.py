import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.verification import VerificationLog
from app.services.auth_service import get_current_user
from app.services.verification_service import verify_document, verify_package
from app.services.report_service import generate_report

router = APIRouter(prefix="/api", tags=["verification"])

@router.post("/documents/verify")
async def verify(
    package: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    signature_json: Optional[UploadFile] = File(None),
    public_key_pem: Optional[UploadFile] = File(None),
    manifest_json: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if package:
        pkg_bytes = await package.read()
        return verify_package(db, current_user.id, pkg_bytes)
        
    if file and signature_json and public_key_pem and manifest_json:
        file_bytes = await file.read()
        sig_data = json.loads(await signature_json.read())
        pub_pem = (await public_key_pem.read()).decode('utf-8')
        man_data = json.loads(await manifest_json.read())
        return verify_document(db, current_user.id, file_bytes, file.filename, sig_data, pub_pem, man_data)
        
    raise HTTPException(status_code=400, detail="Must provide either a package ZIP or all individual files (file, signature, public_key, manifest)")

@router.get("/verifications")
def list_verifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(VerificationLog).filter(VerificationLog.user_id == current_user.id).order_by(VerificationLog.created_at.desc()).all()
    return [{
        "id": l.id,
        "status": l.status,
        "document_name": l.original_document_name,
        "verified_at": l.verified_at
    } for l in logs]

@router.get("/verifications/{ver_id}")
def get_verification(ver_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(VerificationLog).filter(VerificationLog.id == ver_id, VerificationLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Verification log not found")
    return generate_report(log)

@router.get("/verifications/{ver_id}/report")
def download_verification_report(ver_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(VerificationLog).filter(VerificationLog.id == ver_id, VerificationLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Verification log not found")
        
    from app.services.report_service import generate_report_pdf
    pdf_bytes = generate_report_pdf(log)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=report_{ver_id}.pdf"})
