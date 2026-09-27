from dataclasses import dataclass
from typing import List
from app.document.parser import PageContent
from app.crypto.hashing import hash_block

@dataclass
class ContentBlock:
    block_id: str
    page_number: int
    block_number: int
    content: str
    content_hash: str

def extract_blocks(pages: List[PageContent]) -> List[ContentBlock]:
    blocks = []
    for page in pages:
        text = page.text.strip()
        if not text:
            continue
            
        paragraphs = text.split('\n\n')
        
        refined_paragraphs = []
        for p in paragraphs:
            if len(p) > 1024:
                refined_paragraphs.extend(p.split('\n'))
            else:
                refined_paragraphs.append(p)
                
        if not refined_paragraphs:
            refined_paragraphs = [text]
            
        block_num = 1
        for p in refined_paragraphs:
            p_strip = p.strip()
            if not p_strip:
                continue
                
            block_id = f"page{page.page_number}_block{block_num}"
            b_hash = hash_block(block_id, p_strip)
            
            blocks.append(ContentBlock(
                block_id=block_id,
                page_number=page.page_number,
                block_number=block_num,
                content=p_strip,
                content_hash=b_hash
            ))
            block_num += 1
            
    return blocks
