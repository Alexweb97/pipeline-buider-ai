"""
AWS S3 Connector
"""
import logging
from typing import Any

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    S3_AVAILABLE = True
except ImportError:
    S3_AVAILABLE = False

from app.schemas.connection import ConnectionTestResult
from app.services.connectors.base import BaseConnector

logger = logging.getLogger(__name__)


class S3Connector(BaseConnector):
    """Connector for AWS S3"""

    def test_connection(self, config: dict[str, Any]) -> ConnectionTestResult:
        """Test S3 connection"""
        if not S3_AVAILABLE:
            return ConnectionTestResult(
                success=False,
                message="AWS SDK not installed. Install boto3",
                details={}
            )

        try:
            # Validate config
            is_valid, message = self.validate_config(config)
            if not is_valid:
                return ConnectionTestResult(
                    success=False, message=message, details={}
                )

            # Try to connect
            s3_client = boto3.client(
                's3',
                aws_access_key_id=config.get("access_key_id"),
                aws_secret_access_key=config.get("secret_access_key"),
                region_name=config.get("region", "us-east-1"),
            )

            # Test by listing buckets
            response = s3_client.list_buckets()
            bucket_count = len(response.get('Buckets', []))

            # If bucket name provided, test access to that bucket
            bucket = config.get("bucket")
            if bucket:
                try:
                    s3_client.head_bucket(Bucket=bucket)
                    bucket_accessible = True
                except ClientError:
                    bucket_accessible = False

                return ConnectionTestResult(
                    success=bucket_accessible,
                    message=f"Connected to S3. Bucket '{bucket}' {'accessible' if bucket_accessible else 'not accessible'}",
                    details={"total_buckets": bucket_count, "bucket_accessible": bucket_accessible},
                )
            else:
                return ConnectionTestResult(
                    success=True,
                    message="Successfully connected to S3",
                    details={"total_buckets": bucket_count},
                )

        except NoCredentialsError:
            logger.error("S3 credentials not found")
            return ConnectionTestResult(
                success=False,
                message="Invalid credentials",
                details={},
            )
        except ClientError as e:
            logger.error(f"S3 connection test failed: {str(e)}")
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            return ConnectionTestResult(
                success=False,
                message=f"Connection failed: {str(e)}",
                details={"error_code": error_code},
            )
        except Exception as e:
            logger.error(f"Unexpected error testing S3 connection: {str(e)}")
            return ConnectionTestResult(
                success=False, message=f"Unexpected error: {str(e)}", details={}
            )

    def get_connection_string(self, config: dict[str, Any]) -> str:
        """Generate S3 connection string"""
        bucket = config.get("bucket", "")
        region = config.get("region", "us-east-1")

        return f"s3://{bucket}?region={region}"

    def validate_config(self, config: dict[str, Any]) -> tuple[bool, str]:
        """Validate S3 configuration"""
        required_fields = ["access_key_id", "secret_access_key"]

        for field in required_fields:
            if field not in config or not config[field]:
                return False, f"Missing required field: {field}"

        return True, "Configuration is valid"
