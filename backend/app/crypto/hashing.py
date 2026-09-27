import hashlib

def hash_content(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def hash_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def hash_block(block_id: str, content: str) -> str:
    combined = f"{block_id}:{content}"
    return hashlib.sha256(combined.encode('utf-8')).hexdigest()
