from pypdf import PdfReader
from dataclasses import dataclass
from typing import List, Union
import io

@dataclass
class PageContent:
    page_number: int
    text: str
    char_count: int

class PDFParser:
    def __init__(self, file_path_or_bytes: Union[str, bytes]):
        if isinstance(file_path_or_bytes, bytes):
            self.reader = PdfReader(io.BytesIO(file_path_or_bytes))
        else:
            self.reader = PdfReader(file_path_or_bytes)
            
    def extract_pages(self) -> List[PageContent]:
        pages = []
        for i, page in enumerate(self.reader.pages):
            text = page.extract_text() or ""
            pages.append(PageContent(
                page_number=i + 1,
                text=text,
                char_count=len(text)
            ))
        return pages
        
    def get_metadata(self) -> dict:
        meta = self.reader.metadata
        return {
            "title": meta.title if meta else None,
            "author": meta.author if meta else None,
            "pages": len(self.reader.pages),
        }
        
    def is_encrypted(self) -> bool:
        return self.reader.is_encrypted
