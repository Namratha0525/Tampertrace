export interface User { id: number; username: string; email: string; }
export interface AuthResponse { token: string; user: User; }
export interface KeyPair { id: string; name: string; public_key: string; algorithm: string; key_size: number; created_at: string; }
export interface ContentBlock { block_id: string; page_number: number; block_number: number; content: string; content_hash: string; }
export interface Document { id: string; name: string; filename: string; version: number; root_hash: string; created_at: string; block_count?: number; }
export interface SignResponse { document_id: string; name: string; root_hash: string; signature: string; status: string; blocks: ContentBlock[]; }
export interface TamperResult { block_id: string; page_number: number; block_number: number; status: 'modified' | 'added' | 'deleted' | 'match'; original_hash?: string; current_hash?: string; original_content?: string; current_content?: string; }
export interface MerkleNode { hash: string; left?: MerkleNode; right?: MerkleNode; is_leaf: boolean; leaf_index?: number; level: number; status?: 'verified' | 'tampered' | 'neutral'; }
export interface VerificationResult { valid: boolean; signature_valid: boolean; root_hash_match: boolean; tampering_detected: boolean; affected_blocks: TamperResult[]; merkle_tree?: MerkleNode; current_root_hash: string; original_root_hash: string; verification_id: string; blocks_summary: { total: number; modified: number; added: number; deleted: number; }; }
export interface VerificationLog { id: string; document_name: string; verified_at: string; status: string; tampering_detected: boolean; }
export interface DashboardStats { documents_signed: number; documents_verified: number; valid_signatures: number; tampered_documents: number; recent_activity: { id: string; type: string; name: string; status: string; timestamp: string; }[]; }
