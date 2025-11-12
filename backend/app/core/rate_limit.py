"""
Rate Limiting Configuration
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create rate limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],  # Default limit for all endpoints
    storage_uri="redis://:redis_password@redis:6379/3",  # Use Redis for distributed rate limiting
)

# Rate limit configurations
RATE_LIMITS = {
    "auth_login": "10/minute",  # Max 10 login attempts per minute
    "auth_register": "20/minute",  # Max 20 registrations per minute (increased for dev)
    "auth_refresh": "10/minute",  # Max 10 token refreshes per minute
    "auth_password_reset": "5/minute",  # Max 5 password reset requests per minute (increased for dev)
    "general": "100/minute",  # General API rate limit
}
