from dataclasses import dataclass
from typing import List, Optional
from app.document.block_extractor import ContentBlock

@dataclass
class TamperResult:
    block_id: str
    page_number: int
    block_number: int
    status: str  # 'modified', 'added', 'deleted'
    original_hash: Optional[str]
    current_hash: Optional[str]
    original_content: Optional[str]
    current_content: Optional[str]

def compare_blocks(original_blocks: List[ContentBlock], current_blocks: List[ContentBlock]) -> List[TamperResult]:
    orig_dict = {b.block_id: b for b in original_blocks}
    curr_dict = {b.block_id: b for b in current_blocks}
    
    results = []
    
    # Check modified and deleted
    for b_id, orig_b in orig_dict.items():
        if b_id in curr_dict:
            curr_b = curr_dict[b_id]
            if orig_b.content_hash != curr_b.content_hash:
                results.append(TamperResult(
                    block_id=b_id,
                    page_number=curr_b.page_number,
                    block_number=curr_b.block_number,
                    status='modified',
                    original_hash=orig_b.content_hash,
                    current_hash=curr_b.content_hash,
                    original_content=orig_b.content,
                    current_content=curr_b.content
                ))
        else:
            results.append(TamperResult(
                block_id=b_id,
                page_number=orig_b.page_number,
                block_number=orig_b.block_number,
                status='deleted',
                original_hash=orig_b.content_hash,
                current_hash=None,
                original_content=orig_b.content,
                current_content=None
            ))
            
    # Check added
    for b_id, curr_b in curr_dict.items():
        if b_id not in orig_dict:
            results.append(TamperResult(
                block_id=b_id,
                page_number=curr_b.page_number,
                block_number=curr_b.block_number,
                status='added',
                original_hash=None,
                current_hash=curr_b.content_hash,
                original_content=None,
                current_content=curr_b.content
            ))
            
    return results
