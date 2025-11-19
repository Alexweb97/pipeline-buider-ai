"""
Connection Service
Manages database and API connections with testing capabilities
"""
import logging
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.connection import Connection
from app.schemas.connection import ConnectionCreate, ConnectionUpdate, ConnectionTestResult
from app.core.encryption import encrypt_sensitive_data, decrypt_sensitive_data

logger = logging.getLogger(__name__)


class ConnectionService:
    """Service for managing connections to data sources"""

    def __init__(self, db: Session):
        self.db = db

    def list_connections(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100,
        connection_type: str | None = None,
    ) -> list[Connection]:
        """List all connections for a user"""
        query = self.db.query(Connection).filter(Connection.created_by == user_id)

        if connection_type:
            query = query.filter(Connection.type == connection_type)

        return query.offset(skip).limit(limit).all()

    def get_connection(self, connection_id: UUID, user_id: UUID) -> Connection | None:
        """Get a specific connection"""
        return (
            self.db.query(Connection)
            .filter(Connection.id == connection_id, Connection.created_by == user_id)
            .first()
        )

    def create_connection(
        self, connection_data: ConnectionCreate, user_id: UUID
    ) -> Connection:
        """Create a new connection"""
        # Encrypt sensitive fields in config
        encrypted_config = self._encrypt_config(connection_data.config, connection_data.type)

        connection = Connection(
            name=connection_data.name,
            description=connection_data.description,
            type=connection_data.type,
            config=encrypted_config,
            created_by=user_id,
            is_active=True,
        )

        self.db.add(connection)
        self.db.commit()
        self.db.refresh(connection)

        logger.info(f"Created connection: {connection.id} ({connection.type})")
        return connection

    def update_connection(
        self, connection_id: UUID, connection_data: ConnectionUpdate, user_id: UUID
    ) -> Connection | None:
        """Update an existing connection"""
        connection = self.get_connection(connection_id, user_id)
        if not connection:
            return None

        # Update fields
        if connection_data.name is not None:
            connection.name = connection_data.name
        if connection_data.description is not None:
            connection.description = connection_data.description
        if connection_data.type is not None:
            connection.type = connection_data.type
        if connection_data.config is not None:
            connection.config = self._encrypt_config(connection_data.config, connection.type)
        if connection_data.is_active is not None:
            connection.is_active = connection_data.is_active

        self.db.commit()
        self.db.refresh(connection)

        logger.info(f"Updated connection: {connection.id}")
        return connection

    def delete_connection(self, connection_id: UUID, user_id: UUID) -> bool:
        """Delete a connection"""
        connection = self.get_connection(connection_id, user_id)
        if not connection:
            return False

        self.db.delete(connection)
        self.db.commit()

        logger.info(f"Deleted connection: {connection_id}")
        return True

    def test_connection(
        self, connection_id: UUID, user_id: UUID
    ) -> ConnectionTestResult:
        """Test a connection"""
        connection = self.get_connection(connection_id, user_id)
        if not connection:
            return ConnectionTestResult(
                success=False, message="Connection not found", details={}
            )

        # Decrypt config for testing
        decrypted_config = self._decrypt_config(connection.config, connection.type)

        # Test based on connection type
        from app.services.connectors import get_connector

        try:
            connector = get_connector(connection.type)
            result = connector.test_connection(decrypted_config)

            # Update test status
            from datetime import datetime
            connection.last_tested_at = datetime.utcnow().isoformat()
            connection.test_status = "success" if result.success else "failed"
            self.db.commit()

            return result

        except Exception as e:
            logger.error(f"Error testing connection {connection_id}: {str(e)}")
            connection.test_status = "failed"
            self.db.commit()
            return ConnectionTestResult(
                success=False, message=f"Connection test failed: {str(e)}", details={}
            )

    def test_connection_config(
        self, connection_type: str, config: dict[str, Any]
    ) -> ConnectionTestResult:
        """Test a connection configuration without saving it"""
        from app.services.connectors import get_connector

        try:
            connector = get_connector(connection_type)
            return connector.test_connection(config)
        except Exception as e:
            logger.error(f"Error testing connection config: {str(e)}")
            return ConnectionTestResult(
                success=False, message=f"Connection test failed: {str(e)}", details={}
            )

    def _encrypt_config(self, config: dict[str, Any], connection_type: str) -> dict[str, Any]:
        """Encrypt sensitive fields in connection config"""
        # Define sensitive fields per connection type
        sensitive_fields = {
            "postgres": ["password"],
            "mysql": ["password"],
            "mongodb": ["password"],
            "s3": ["secret_access_key"],
            "rest-api": ["api_key", "token", "password"],
        }

        fields_to_encrypt = sensitive_fields.get(connection_type, [])
        encrypted_config = config.copy()

        for field in fields_to_encrypt:
            if field in encrypted_config and encrypted_config[field]:
                encrypted_config[field] = encrypt_sensitive_data(encrypted_config[field])

        return encrypted_config

    def _decrypt_config(self, config: dict[str, Any], connection_type: str) -> dict[str, Any]:
        """Decrypt sensitive fields in connection config"""
        sensitive_fields = {
            "postgres": ["password"],
            "mysql": ["password"],
            "mongodb": ["password"],
            "s3": ["secret_access_key"],
            "rest-api": ["api_key", "token", "password"],
        }

        fields_to_decrypt = sensitive_fields.get(connection_type, [])
        decrypted_config = config.copy()

        for field in fields_to_decrypt:
            if field in decrypted_config and decrypted_config[field]:
                try:
                    decrypted_config[field] = decrypt_sensitive_data(decrypted_config[field])
                except Exception as e:
                    logger.warning(f"Failed to decrypt field {field}: {str(e)}")

        return decrypted_config
