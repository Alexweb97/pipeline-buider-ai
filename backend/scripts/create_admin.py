#!/usr/bin/env python
"""
Create admin user script
"""
import asyncio
import sys
from getpass import getpass

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_admin():
    """Create admin user interactively"""

    print("\n" + "="*50)
    print("Create Admin User")
    print("="*50 + "\n")

    # Get user input
    username = input("Username [admin]: ").strip() or "admin"
    email = input("Email [admin@example.com]: ").strip() or "admin@example.com"
    full_name = input("Full Name [Admin User]: ").strip() or "Admin User"

    # Get password
    while True:
        password = getpass("Password: ")
        password_confirm = getpass("Confirm Password: ")

        if password != password_confirm:
            print("Passwords do not match. Please try again.\n")
            continue

        if len(password) < 8:
            print("Password must be at least 8 characters. Please try again.\n")
            continue

        break

    async with AsyncSessionLocal() as session:
        # Check if user already exists
        result = await session.execute(
            select(User).where(User.username == username)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"\n❌ User '{username}' already exists!")
            sys.exit(1)

        # Create admin user
        admin_user = User(
            username=username,
            email=email,
            full_name=full_name,
            password_hash=pwd_context.hash(password),
            role="admin",
            is_active=True,
            email_verified=True,
        )

        session.add(admin_user)
        await session.commit()

        print("\n" + "="*50)
        print("✓ Admin user created successfully!")
        print("="*50)
        print(f"\nUsername: {username}")
        print(f"Email:    {email}")
        print(f"Role:     admin")
        print("\nYou can now login with these credentials.\n")


if __name__ == "__main__":
    try:
        asyncio.run(create_admin())
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
