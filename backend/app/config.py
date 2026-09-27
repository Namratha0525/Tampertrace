from pydantic_settings import BaseSettings
from typing import List
import secrets

class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite:///./storage/tampertrace.db'
    SECRET_KEY: str = secrets.token_hex(32)
    STORAGE_PATH: str = './storage'
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: List[str] = ['.pdf']
    RSA_KEY_SIZE: int = 2048
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24h

    class Config:
        env_file = ".env"

settings = Settings()
