"""Quick integration test for TamperTrace crypto modules."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.crypto.rsa_service import generate_key_pair, sign_data, verify_signature, serialize_public_key
from app.crypto.merkle_tree import MerkleTree
from app.crypto.hashing import hash_content

print("=" * 50)
print("TamperTrace Crypto Integration Test")
print("=" * 50)

# Test 1: RSA Key Generation
priv, pub = generate_key_pair()
print(f"[PASS] RSA-2048 key pair generated")

# Test 2: RSA Signing
data = b"test document root hash"
sig = sign_data(priv, data)
print(f"[PASS] RSA-PSS signature created ({len(sig)} bytes)")

# Test 3: RSA Verification (valid)
valid = verify_signature(pub, sig, data)
assert valid == True, "Valid signature should pass"
print(f"[PASS] Valid signature verification: {valid}")

# Test 4: RSA Verification (tampered)
invalid = verify_signature(pub, sig, b"tampered data")
assert invalid == False, "Tampered data should fail"
print(f"[PASS] Tampered data verification: {invalid}")

# Test 5: SHA-256 Hashing
h1 = hash_content("Student Name: Rahul Sharma")
h2 = hash_content("USN: 01CS2026001")
h3 = hash_content("Department: CSE")
h4 = hash_content("CGPA: 8.4")
h5 = hash_content("Year: 2026")
print(f"[PASS] SHA-256 hashes generated for 5 blocks")

# Test 6: Merkle Tree Construction
tree = MerkleTree([h1, h2, h3, h4, h5])
root = tree.root_hash
print(f"[PASS] Merkle tree built with {len(tree.levels)} levels, root: {root[:16]}...")

# Test 7: Merkle Tree Structure (for visualization)
struct = tree.get_tree_structure()
assert "hash" in struct, "Tree structure must have hash"
assert "left" in struct, "Tree structure must have left"
assert "right" in struct, "Tree structure must have right"
print(f"[PASS] Merkle tree structure for visualization: OK")

# Test 8: Sign and verify the merkle root
root_sig = sign_data(priv, bytes.fromhex(root))
root_valid = verify_signature(pub, root_sig, bytes.fromhex(root))
assert root_valid == True
print(f"[PASS] Merkle root signed and verified with RSA-PSS")

# Test 9: Tamper detection - modify CGPA
h4_tampered = hash_content("CGPA: 9.4")  # Changed from 8.4 to 9.4
comparison = tree.compare_leaves([h1, h2, h3, h4_tampered, h5])
modified = [c for c in comparison if c["status"] != "match"]
assert len(modified) == 1, f"Expected 1 modified block, got {len(modified)}"
assert modified[0]["index"] == 3, f"Expected index 3 (CGPA block), got {modified[0]['index']}"
print(f"[PASS] Tamper detected: block {modified[0]['index']} status={modified[0]['status']}")

# Test 10: Rebuild tree with tampered data and verify root mismatch
tampered_tree = MerkleTree([h1, h2, h3, h4_tampered, h5])
tampered_root = tampered_tree.root_hash
assert tampered_root != root, "Tampered root must differ from original"
root_still_valid = verify_signature(pub, root_sig, bytes.fromhex(tampered_root))
assert root_still_valid == False, "Signature on tampered root must fail"
print(f"[PASS] Tampered root hash differs: {tampered_root[:16]}...")
print(f"[PASS] RSA signature on tampered root: INVALID (correct)")

# Test 11: Addition detection
comparison_added = tree.compare_leaves([h1, h2, h3, h4, h5, hash_content("Extra block")])
added = [c for c in comparison_added if c["status"] == "added"]
assert len(added) == 1, f"Expected 1 added block, got {len(added)}"
print(f"[PASS] Addition detected: {len(added)} new block(s)")

# Test 12: Deletion detection
comparison_deleted = tree.compare_leaves([h1, h2, h3, h4])
deleted = [c for c in comparison_deleted if c["status"] == "deleted"]
assert len(deleted) == 1, f"Expected 1 deleted block, got {len(deleted)}"
print(f"[PASS] Deletion detected: {len(deleted)} removed block(s)")

# Test 13: Merkle proof
proof = tree.get_proof(3)
proof_valid = tree.verify_proof(h4, proof, root)
assert proof_valid == True
print(f"[PASS] Merkle proof for block 3: verified")

print()
print("=" * 50)
print("ALL 13 TESTS PASSED!")
print("=" * 50)
