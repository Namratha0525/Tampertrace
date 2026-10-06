# 🛡️ TamperTrace
**Secure Cryptographic Document Verification Platform**
TamperTrace is a zero-trust, full-stack cybersecurity platform built to ensure absolute data integrity for digital documents. By utilizing advanced cryptographic algorithms, RSA signing, and Merkle Trees, TamperTrace not only verifies if a document has been forged but can visually pinpoint the *exact block* of text that was tampered with.
![TamperTrace Architecture](https://img.shields.io/badge/Architecture-Full%20Stack-00f0ff?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
---
## 🚀 Features
- **End-to-End Cryptography**: Documents are split into content blocks and hashed into a Merkle Tree using SHA-256. The Root Hash is then securely signed using an RSA-2048 private key.
- **Granular Tamper Detection**: If a forged document is uploaded, TamperTrace rebuilds the Merkle Tree, compares the structural hashes, and highlights exactly which pages and blocks were modified, added, or deleted.
- **Secure Key Management**: Users can generate, manage, and download RSA key pairs directly from the intuitive Neon Cyberpunk dashboard.
- **Verification Packages**: Downloads a `.zip` package containing the original document, public key, signature, and cryptographic manifest for offline/third-party verification.
- **PDF Reporting**: Generates automated, downloadable Cryptographic Verification Reports for auditing and compliance.
## 🏗️ Architecture
- **Frontend**: React (TypeScript), Tailwind CSS, Recharts, Lucide Icons, Vite. Features a dark-mode Neon Cyberpunk aesthetic (`#0a0e1a` base).
- **Backend**: Python 3.13, FastAPI, SQLAlchemy, PyPDF, Cryptography. Serves a RESTful API and handles all complex cryptographic engine operations.
- **Database**: PostgreSQL (Production on Render) / SQLite (Local).
- **Deployment**: Docker multi-stage builds. Live production deployment hosted on Render via Infrastructure as Code (`render.yaml`).
---
