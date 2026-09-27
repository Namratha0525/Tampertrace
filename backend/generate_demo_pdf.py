import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf():
    demo_dir = os.path.join(os.path.dirname(__file__), 'demo')
    os.makedirs(demo_dir, exist_ok=True)
    pdf_path = os.path.join(demo_dir, 'Student_Certificate.pdf')
    
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=1, # Center
        fontSize=24,
        spaceAfter=30
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 12
    normal_style.spaceAfter = 12
    
    story = []
    
    story.append(Paragraph("National Institute of Technology", title_style))
    story.append(Paragraph("Academic Certificate", ParagraphStyle('Subtitle', parent=styles['Heading2'], alignment=1, spaceAfter=20)))
    
    story.append(Spacer(1, 20))
    
    # Block 1
    text1 = "This is to certify that Rahul Sharma has successfully completed the degree requirements."
    story.append(Paragraph(text1, normal_style))
    
    # Block 2
    text2 = "USN: 01CS2026001"
    story.append(Paragraph(text2, normal_style))
    
    # Block 3
    text3 = "Department: Computer Science & Engineering"
    story.append(Paragraph(text3, normal_style))
    
    # Block 4
    text4 = "CGPA: 8.4"
    story.append(Paragraph(text4, normal_style))
    
    # Block 5
    text5 = "Year of Graduation: 2026"
    story.append(Paragraph(text5, normal_style))
    
    # Block 6
    text6 = "This document is digitally signed and tamper-proofed using the TamperTrace platform. Any modifications to this document will invalidate its authenticity and can be traced to the exact modified section."
    story.append(Spacer(1, 20))
    story.append(Paragraph(text6, normal_style))
    
    doc.build(story)
    print(f"Generated demo PDF at: {pdf_path}")

if __name__ == "__main__":
    generate_pdf()
