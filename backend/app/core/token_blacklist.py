"""
JWT Token Blacklist Management using Redis
"""
from datetime import datetime, timedelta

from redis import Redis

from app.core.config import settings

# Redis client for token blacklist
redis_client = Redis(
    host=settings.REDIS_URL.split("@")[1].split(":")[0] if "@" in settings.REDIS_URL else "localhost",
    port=6379,
    db=4,  # Use separate DB for blacklist
    decode_responses=True,
)


def blacklist_token(token: str, expiry_seconds: int | None = None) -> bool:
    """
    Add a token to the blacklist

    Args:
        token: JWT token to blacklist
        expiry_seconds: Token expiry time in seconds (auto-expires from Redis)

    Returns:
        bool: True if successful
    """
    try:
        key = f"blacklist:{token}"
        if expiry_seconds:
            redis_client.setex(key, expiry_seconds, "1")
        else:
            # Default to access token expiry time
            redis_client.setex(
                key,
                settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "1",
            )
        return True
    except Exception as e:
        print(f"Error blacklisting token: {e}")
        return False


def is_token_blacklisted(token: str) -> bool:
    """
    Check if a token is blacklisted

    Args:
        token: JWT token to check

    Returns:
        bool: True if token is blacklisted
    """
    try:
        key = f"blacklist:{token}"
        return redis_client.exists(key) == 1
    except Exception as e:
        print(f"Error checking token blacklist: {e}")
        # Fail securely: if Redis is down, deny access
        return True


def remove_from_blacklist(token: str) -> bool:
    """
    Remove a token from blacklist (admin function)

    Args:
        token: JWT token to remove from blacklist

    Returns:
        bool: True if successful
    """
    try:
        key = f"blacklist:{token}"
        redis_client.delete(key)
        return True
    except Exception as e:
        print(f"Error removing token from blacklist: {e}")
        return False


def get_blacklist_count() -> int:
    """
    Get count of blacklisted tokens

    Returns:
        int: Number of blacklisted tokens
    """
    try:
        keys = redis_client.keys("blacklist:*")
        return len(keys)
    except Exception as e:
        print(f"Error getting blacklist count: {e}")
        return 0


def clear_expired_tokens() -> int:
    """
    Manually clear expired tokens (Redis auto-expires, but this is for monitoring)

    Returns:
        int: Number of tokens cleared
    """
    # Redis automatically removes expired keys, this is just for monitoring
    return 0
