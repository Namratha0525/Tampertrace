import hashlib
from typing import List

class MerkleTree:
    def __init__(self, leaf_hashes: List[str]):
        if not leaf_hashes:
            leaf_hashes = [hashlib.sha256(b'').hexdigest()]
        
        self.leaves = [self._hash_leaf(h) for h in leaf_hashes]
        self.levels = [self.leaves]
        self._build_tree()

    def _hash_leaf(self, h: str) -> str:
        # 0x00 prefix for leaves
        return hashlib.sha256(b'\x00' + bytes.fromhex(h)).hexdigest()

    def _hash_internal(self, left: str, right: str) -> str:
        # 0x01 prefix for internal nodes
        return hashlib.sha256(b'\x01' + bytes.fromhex(left) + bytes.fromhex(right)).hexdigest()

    def _build_tree(self):
        current_level = self.levels[0]
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                next_level.append(self._hash_internal(left, right))
            self.levels.append(next_level)
            current_level = next_level

    @property
    def root_hash(self) -> str:
        return self.levels[-1][0] if self.levels else ""

    def get_tree_structure(self) -> dict:
        def build_node(level_idx, node_idx):
            if level_idx < 0:
                return None
            
            node_hash = self.levels[level_idx][node_idx]
            is_leaf = (level_idx == 0)
            node = {
                "hash": node_hash,
                "is_leaf": is_leaf,
                "level": level_idx
            }
            if is_leaf:
                node["leaf_index"] = node_idx
                node["left"] = None
                node["right"] = None
            else:
                left_idx = node_idx * 2
                right_idx = left_idx + 1
                
                prev_level_len = len(self.levels[level_idx - 1])
                node["left"] = build_node(level_idx - 1, left_idx)
                
                if right_idx < prev_level_len:
                    node["right"] = build_node(level_idx - 1, right_idx)
                else:
                    # Right child was duplicated from left
                    node["right"] = build_node(level_idx - 1, left_idx)
                    
            return node

        return build_node(len(self.levels) - 1, 0) if self.levels else {}

    def compare_leaves(self, other_hashes: List[str]) -> List[dict]:
        results = []
        max_len = max(len(self.leaves), len(other_hashes))
        other_leaf_hashes = [self._hash_leaf(h) for h in other_hashes]
        
        for i in range(max_len):
            if i >= len(self.leaves):
                results.append({
                    "index": i,
                    "status": "added",
                    "original_hash": None,
                    "current_hash": other_leaf_hashes[i]
                })
            elif i >= len(other_leaf_hashes):
                results.append({
                    "index": i,
                    "status": "deleted",
                    "original_hash": self.leaves[i],
                    "current_hash": None
                })
            elif self.leaves[i] == other_leaf_hashes[i]:
                results.append({
                    "index": i,
                    "status": "match",
                    "original_hash": self.leaves[i],
                    "current_hash": other_leaf_hashes[i]
                })
            else:
                results.append({
                    "index": i,
                    "status": "modified",
                    "original_hash": self.leaves[i],
                    "current_hash": other_leaf_hashes[i]
                })
        return results

    def get_proof(self, leaf_index: int) -> List[dict]:
        proof = []
        idx = leaf_index
        for level_idx in range(len(self.levels) - 1):
            level = self.levels[level_idx]
            is_right_child = (idx % 2 == 1)
            sibling_idx = idx - 1 if is_right_child else idx + 1
            
            if sibling_idx < len(level):
                sibling_hash = level[sibling_idx]
            else:
                sibling_hash = level[idx] # duplicate
                
            proof.append({
                "hash": sibling_hash,
                "position": "left" if is_right_child else "right"
            })
            idx //= 2
        return proof

    def verify_proof(self, leaf_hash: str, proof: List[dict], expected_root: str) -> bool:
        current_hash = self._hash_leaf(leaf_hash)
        for p in proof:
            if p["position"] == "left":
                current_hash = self._hash_internal(p["hash"], current_hash)
            else:
                current_hash = self._hash_internal(current_hash, p["hash"])
        return current_hash == expected_root
