import json
import io
from app.models.verification import VerificationLog
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_report(verification_log: VerificationLog) -> dict:
    return json.loads(verification_log.report_data)

def generate_report_pdf(verification_log: VerificationLog) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = styles['Heading1']
    normal_style = styles['Normal']
    
    data = json.loads(verification_log.report_data)
    
    story = []
    
    story.append(Paragraph("TamperTrace Verification Report", title_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(f"Document Name: {data.get('document_name', 'N/A')}", normal_style))
    story.append(Paragraph(f"Status: {data.get('status')}", normal_style))
    story.append(Paragraph(f"Signature Valid: {data.get('signature_valid')}", normal_style))
    story.append(Paragraph(f"Root Hash Match: {data.get('root_hash_match')}", normal_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Hash Information:", styles['Heading2']))
    story.append(Paragraph(f"Original Root Hash: {data.get('original_root_hash')}", normal_style))
    story.append(Paragraph(f"Current Root Hash: {data.get('current_root_hash')}", normal_style))
    story.append(Spacer(1, 12))
    
    summary = data.get('blocks_summary', {})
    story.append(Paragraph("Block Summary:", styles['Heading2']))
    story.append(Paragraph(f"Total Blocks: {summary.get('total', 0)}", normal_style))
    story.append(Paragraph(f"Modified: {summary.get('modified', 0)}", normal_style))
    story.append(Paragraph(f"Added: {summary.get('added', 0)}", normal_style))
    story.append(Paragraph(f"Deleted: {summary.get('deleted', 0)}", normal_style))
    story.append(Spacer(1, 12))
    
    affected = data.get('affected_blocks', [])
    if affected:
        story.append(Paragraph("Affected Blocks Details:", styles['Heading2']))
        table_data = [['Block ID', 'Page', 'Status']]
        for b in affected:
            table_data.append([b.get('block_id'), str(b.get('page_number')), b.get('status')])
            
        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.beige),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
        ]))
        story.append(t)
    
    doc.build(story)
    return buffer.getvalue()
