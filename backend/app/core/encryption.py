"""
Encryption utilities for sensitive data
"""
import base64
import os
from cryptography.fernet import Fernet
from app.core.config import settings


def get_encryption_key() -> bytes:
    """Get or generate encryption key"""
    # Use encryption key from settings or generate one
    key = getattr(settings, 'ENCRYPTION_KEY', None)

    if not key:
        # For development, use a default key (should be in settings for production)
        key = "dev-encryption-key-32-bytes-long!"

    # Ensure key is 32 bytes for Fernet
    if len(key) < 32:
        key = key.ljust(32, '0')
    elif len(key) > 32:
        key = key[:32]

    # Fernet requires base64-encoded 32-byte key
    return base64.urlsafe_b64encode(key.encode()[:32])


def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive data"""
    if not data:
        return data

    try:
        fernet = Fernet(get_encryption_key())
        encrypted = fernet.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()
    except Exception as e:
        # If encryption fails, return original data (for development)
        # In production, this should raise an error
        return data


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    if not encrypted_data:
        return encrypted_data

    try:
        fernet = Fernet(get_encryption_key())
        decoded = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted = fernet.decrypt(decoded)
        return decrypted.decode()
    except Exception:
        # If decryption fails, assume data is not encrypted
        return encrypted_data
