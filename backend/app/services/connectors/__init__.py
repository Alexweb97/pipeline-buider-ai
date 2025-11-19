"""
Data Source Connectors
Provides connectors for various data sources
"""
from app.services.connectors.base import BaseConnector
from app.services.connectors.postgres import PostgresConnector
from app.services.connectors.mysql import MySQLConnector
from app.services.connectors.mongodb import MongoDBConnector
from app.services.connectors.s3 import S3Connector
from app.services.connectors.rest_api import RestAPIConnector


# Registry of available connectors
CONNECTORS = {
    "postgres": PostgresConnector,
    "postgresql": PostgresConnector,
    "mysql": MySQLConnector,
    "mongodb": MongoDBConnector,
    "mongo": MongoDBConnector,
    "s3": S3Connector,
    "rest-api": RestAPIConnector,
    "api": RestAPIConnector,
}


def get_connector(connection_type: str) -> BaseConnector:
    """Get connector instance for a connection type"""
    connector_class = CONNECTORS.get(connection_type.lower())

    if not connector_class:
        raise ValueError(f"Unknown connection type: {connection_type}")

    return connector_class()


__all__ = [
    "BaseConnector",
    "PostgresConnector",
    "MySQLConnector",
    "MongoDBConnector",
    "S3Connector",
    "RestAPIConnector",
    "get_connector",
]
