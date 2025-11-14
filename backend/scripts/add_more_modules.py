"""
Add comprehensive set of modules for complete data pipeline coverage
"""
import requests
import json

API_URL = "http://localhost:8000"

# Comprehensive module definitions
ADDITIONAL_MODULES = [
    # ==================== EXTRACTORS ====================

    # Data Warehouses
    {
        "name": "bigquery-extractor",
        "display_name": "Google BigQuery",
        "description": "Extract data from Google BigQuery",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.bigquery.BigQueryExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "title": "Project ID"},
                "dataset": {"type": "string", "title": "Dataset"},
                "query": {"type": "string", "title": "SQL Query"},
                "credentials_json": {"type": "string", "title": "Service Account JSON", "format": "password"}
            },
            "required": ["project_id", "query"]
        },
        "tags": ["warehouse", "cloud", "google", "bigquery"]
    },
    {
        "name": "snowflake-extractor",
        "display_name": "Snowflake",
        "description": "Extract data from Snowflake data warehouse",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.snowflake.SnowflakeExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "account": {"type": "string", "title": "Account"},
                "warehouse": {"type": "string", "title": "Warehouse"},
                "database": {"type": "string", "title": "Database"},
                "schema": {"type": "string", "title": "Schema"},
                "query": {"type": "string", "title": "SQL Query"}
            },
            "required": ["account", "warehouse", "database", "query"]
        },
        "tags": ["warehouse", "cloud", "snowflake"]
    },
    {
        "name": "redshift-extractor",
        "display_name": "AWS Redshift",
        "description": "Extract data from Amazon Redshift",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.redshift.RedshiftExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "host": {"type": "string", "title": "Host"},
                "database": {"type": "string", "title": "Database"},
                "query": {"type": "string", "title": "SQL Query"},
                "port": {"type": "integer", "title": "Port", "default": 5439}
            },
            "required": ["host", "database", "query"]
        },
        "tags": ["warehouse", "cloud", "aws", "redshift"]
    },

    # Message Queues
    {
        "name": "kafka-extractor",
        "display_name": "Apache Kafka",
        "description": "Consume messages from Kafka topic",
        "type": "extractor",
        "category": "streaming",
        "python_class": "app.modules.extractors.kafka.KafkaExtractor",
        "icon": "Api",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "bootstrap_servers": {"type": "string", "title": "Bootstrap Servers"},
                "topic": {"type": "string", "title": "Topic Name"},
                "group_id": {"type": "string", "title": "Consumer Group ID"},
                "auto_offset_reset": {"type": "string", "title": "Auto Offset Reset", "enum": ["earliest", "latest"], "default": "latest"}
            },
            "required": ["bootstrap_servers", "topic", "group_id"]
        },
        "tags": ["streaming", "kafka", "messaging"]
    },
    {
        "name": "rabbitmq-extractor",
        "display_name": "RabbitMQ",
        "description": "Consume messages from RabbitMQ queue",
        "type": "extractor",
        "category": "streaming",
        "python_class": "app.modules.extractors.rabbitmq.RabbitMQExtractor",
        "icon": "Api",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "host": {"type": "string", "title": "Host", "default": "localhost"},
                "queue": {"type": "string", "title": "Queue Name"},
                "exchange": {"type": "string", "title": "Exchange"},
                "routing_key": {"type": "string", "title": "Routing Key"}
            },
            "required": ["host", "queue"]
        },
        "tags": ["streaming", "rabbitmq", "messaging"]
    },

    # File Transfer
    {
        "name": "sftp-extractor",
        "display_name": "SFTP",
        "description": "Download files from SFTP server",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.sftp.SFTPExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "host": {"type": "string", "title": "Host"},
                "port": {"type": "integer", "title": "Port", "default": 22},
                "username": {"type": "string", "title": "Username"},
                "remote_path": {"type": "string", "title": "Remote File Path"}
            },
            "required": ["host", "username", "remote_path"]
        },
        "tags": ["file", "sftp", "transfer"]
    },
    {
        "name": "ftp-extractor",
        "display_name": "FTP",
        "description": "Download files from FTP server",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.ftp.FTPExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "host": {"type": "string", "title": "Host"},
                "port": {"type": "integer", "title": "Port", "default": 21},
                "username": {"type": "string", "title": "Username"},
                "remote_path": {"type": "string", "title": "Remote File Path"}
            },
            "required": ["host", "remote_path"]
        },
        "tags": ["file", "ftp", "transfer"]
    },

    # SaaS / Cloud Apps
    {
        "name": "google-sheets-extractor",
        "display_name": "Google Sheets",
        "description": "Read data from Google Sheets",
        "type": "extractor",
        "category": "cloud",
        "python_class": "app.modules.extractors.google_sheets.GoogleSheetsExtractor",
        "icon": "Description",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "spreadsheet_id": {"type": "string", "title": "Spreadsheet ID"},
                "range": {"type": "string", "title": "Range", "default": "Sheet1!A:Z"},
                "credentials_json": {"type": "string", "title": "Service Account JSON", "format": "password"}
            },
            "required": ["spreadsheet_id", "credentials_json"]
        },
        "tags": ["cloud", "google", "spreadsheet"]
    },
    {
        "name": "salesforce-extractor",
        "display_name": "Salesforce",
        "description": "Extract data from Salesforce CRM",
        "type": "extractor",
        "category": "api",
        "python_class": "app.modules.extractors.salesforce.SalesforceExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "instance_url": {"type": "string", "title": "Instance URL"},
                "object_name": {"type": "string", "title": "Object Name (e.g., Account)"},
                "query": {"type": "string", "title": "SOQL Query"}
            },
            "required": ["instance_url", "object_name"]
        },
        "tags": ["crm", "salesforce", "api"]
    },
    {
        "name": "hubspot-extractor",
        "display_name": "HubSpot",
        "description": "Extract data from HubSpot CRM",
        "type": "extractor",
        "category": "api",
        "python_class": "app.modules.extractors.hubspot.HubSpotExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "api_key": {"type": "string", "title": "API Key", "format": "password"},
                "object_type": {"type": "string", "title": "Object Type", "enum": ["contacts", "companies", "deals", "tickets"]}
            },
            "required": ["api_key", "object_type"]
        },
        "tags": ["crm", "hubspot", "api"]
    },
    {
        "name": "stripe-extractor",
        "display_name": "Stripe",
        "description": "Extract data from Stripe payments",
        "type": "extractor",
        "category": "api",
        "python_class": "app.modules.extractors.stripe.StripeExtractor",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "api_key": {"type": "string", "title": "API Key", "format": "password"},
                "resource": {"type": "string", "title": "Resource", "enum": ["charges", "customers", "invoices", "subscriptions"]}
            },
            "required": ["api_key", "resource"]
        },
        "tags": ["payments", "stripe", "api"]
    },

    # ==================== TRANSFORMERS ====================

    # Data Quality
    {
        "name": "deduplicate-transformer",
        "display_name": "Deduplicate",
        "description": "Remove duplicate rows based on columns",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.deduplicate.DeduplicateTransformer",
        "icon": "FilterList",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {"type": "array", "title": "Columns to check", "items": {"type": "string"}},
                "keep": {"type": "string", "title": "Keep", "enum": ["first", "last"], "default": "first"}
            },
            "required": ["columns"]
        },
        "tags": ["data-quality", "dedupe"]
    },
    {
        "name": "validate-transformer",
        "display_name": "Data Validation",
        "description": "Validate data against schema rules",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.validate.ValidateTransformer",
        "icon": "Functions",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "rules": {"type": "array", "title": "Validation Rules"},
                "on_error": {"type": "string", "title": "On Error", "enum": ["skip", "fail", "flag"], "default": "flag"}
            },
            "required": ["rules"]
        },
        "tags": ["data-quality", "validation"]
    },
    {
        "name": "clean-transformer",
        "display_name": "Data Cleaning",
        "description": "Clean and normalize data",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.clean.CleanTransformer",
        "icon": "FilterAlt",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "trim_whitespace": {"type": "boolean", "title": "Trim Whitespace", "default": True},
                "remove_nulls": {"type": "boolean", "title": "Remove Null Rows", "default": False},
                "lowercase_columns": {"type": "boolean", "title": "Lowercase Column Names", "default": False}
            }
        },
        "tags": ["data-quality", "cleaning"]
    },

    # Data Manipulation
    {
        "name": "sort-transformer",
        "display_name": "Sort",
        "description": "Sort data by columns",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.sort.SortTransformer",
        "icon": "FilterList",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {"type": "array", "title": "Sort Columns", "items": {"type": "string"}},
                "ascending": {"type": "boolean", "title": "Ascending", "default": True}
            },
            "required": ["columns"]
        },
        "tags": ["transform", "sort"]
    },
    {
        "name": "pivot-transformer",
        "display_name": "Pivot",
        "description": "Pivot table transformation",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.pivot.PivotTransformer",
        "icon": "Transform",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "index": {"type": "array", "title": "Index Columns", "items": {"type": "string"}},
                "columns": {"type": "string", "title": "Pivot Column"},
                "values": {"type": "string", "title": "Values Column"}
            },
            "required": ["index", "columns", "values"]
        },
        "tags": ["transform", "pivot", "reshape"]
    },
    {
        "name": "unpivot-transformer",
        "display_name": "Unpivot (Melt)",
        "description": "Unpivot wide data to long format",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.unpivot.UnpivotTransformer",
        "icon": "Transform",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "id_vars": {"type": "array", "title": "ID Columns", "items": {"type": "string"}},
                "value_vars": {"type": "array", "title": "Value Columns", "items": {"type": "string"}},
                "var_name": {"type": "string", "title": "Variable Column Name", "default": "variable"},
                "value_name": {"type": "string", "title": "Value Column Name", "default": "value"}
            },
            "required": ["id_vars"]
        },
        "tags": ["transform", "unpivot", "melt", "reshape"]
    },

    # String Operations
    {
        "name": "string-ops-transformer",
        "display_name": "String Operations",
        "description": "String manipulation (split, concat, replace)",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.string_ops.StringOpsTransformer",
        "icon": "Functions",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "operation": {"type": "string", "title": "Operation", "enum": ["split", "concat", "replace", "upper", "lower"]},
                "columns": {"type": "array", "title": "Columns", "items": {"type": "string"}},
                "params": {"type": "object", "title": "Operation Parameters"}
            },
            "required": ["operation", "columns"]
        },
        "tags": ["transform", "string"]
    },

    # Date/Time Operations
    {
        "name": "datetime-transformer",
        "display_name": "Date/Time Operations",
        "description": "Parse and transform date/time columns",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.datetime.DateTimeTransformer",
        "icon": "Functions",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "column": {"type": "string", "title": "Date Column"},
                "operation": {"type": "string", "title": "Operation", "enum": ["parse", "format", "extract", "diff"]},
                "format": {"type": "string", "title": "Date Format", "default": "%Y-%m-%d"}
            },
            "required": ["column", "operation"]
        },
        "tags": ["transform", "datetime"]
    },

    # Math Operations
    {
        "name": "math-transformer",
        "display_name": "Math Operations",
        "description": "Perform mathematical operations on columns",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.math.MathTransformer",
        "icon": "Functions",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "operation": {"type": "string", "title": "Operation", "enum": ["add", "subtract", "multiply", "divide", "round", "abs"]},
                "columns": {"type": "array", "title": "Columns", "items": {"type": "string"}},
                "output_column": {"type": "string", "title": "Output Column"}
            },
            "required": ["operation", "columns"]
        },
        "tags": ["transform", "math"]
    },

    # Schema Mapping
    {
        "name": "schema-mapper-transformer",
        "display_name": "Schema Mapper",
        "description": "Map columns to new schema",
        "type": "transformer",
        "category": "transform",
        "python_class": "app.modules.transformers.schema_mapper.SchemaMapperTransformer",
        "icon": "Transform",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "mapping": {"type": "object", "title": "Column Mapping (old: new)"},
                "drop_unmapped": {"type": "boolean", "title": "Drop Unmapped Columns", "default": False}
            },
            "required": ["mapping"]
        },
        "tags": ["transform", "schema", "mapping"]
    },

    # ==================== LOADERS ====================

    # Data Warehouses
    {
        "name": "bigquery-loader",
        "display_name": "Google BigQuery",
        "description": "Load data into Google BigQuery",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.bigquery.BigQueryLoader",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "title": "Project ID"},
                "dataset": {"type": "string", "title": "Dataset"},
                "table": {"type": "string", "title": "Table"},
                "write_mode": {"type": "string", "title": "Write Mode", "enum": ["append", "replace", "update"], "default": "append"}
            },
            "required": ["project_id", "dataset", "table"]
        },
        "tags": ["warehouse", "cloud", "google", "bigquery"]
    },
    {
        "name": "snowflake-loader",
        "display_name": "Snowflake",
        "description": "Load data into Snowflake",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.snowflake.SnowflakeLoader",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "account": {"type": "string", "title": "Account"},
                "warehouse": {"type": "string", "title": "Warehouse"},
                "database": {"type": "string", "title": "Database"},
                "schema": {"type": "string", "title": "Schema"},
                "table": {"type": "string", "title": "Table"},
                "write_mode": {"type": "string", "title": "Write Mode", "enum": ["append", "replace"], "default": "append"}
            },
            "required": ["account", "warehouse", "database", "table"]
        },
        "tags": ["warehouse", "cloud", "snowflake"]
    },
    {
        "name": "redshift-loader",
        "display_name": "AWS Redshift",
        "description": "Load data into Amazon Redshift",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.redshift.RedshiftLoader",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "host": {"type": "string", "title": "Host"},
                "database": {"type": "string", "title": "Database"},
                "table": {"type": "string", "title": "Table"},
                "write_mode": {"type": "string", "title": "Write Mode", "enum": ["append", "replace"], "default": "append"}
            },
            "required": ["host", "database", "table"]
        },
        "tags": ["warehouse", "cloud", "aws", "redshift"]
    },

    # Cache & Search
    {
        "name": "redis-loader",
        "display_name": "Redis",
        "description": "Load data into Redis cache",
        "type": "loader",
        "category": "cache",
        "python_class": "app.modules.loaders.redis.RedisLoader",
        "icon": "Storage",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "host": {"type": "string", "title": "Host", "default": "localhost"},
                "port": {"type": "integer", "title": "Port", "default": 6379},
                "key_column": {"type": "string", "title": "Key Column"},
                "ttl": {"type": "integer", "title": "TTL (seconds)", "default": 3600}
            },
            "required": ["key_column"]
        },
        "tags": ["cache", "redis"]
    },
    {
        "name": "elasticsearch-loader",
        "display_name": "Elasticsearch",
        "description": "Load data into Elasticsearch",
        "type": "loader",
        "category": "search",
        "python_class": "app.modules.loaders.elasticsearch.ElasticsearchLoader",
        "icon": "Storage",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "hosts": {"type": "array", "title": "Hosts", "items": {"type": "string"}},
                "index": {"type": "string", "title": "Index Name"},
                "id_column": {"type": "string", "title": "Document ID Column"}
            },
            "required": ["hosts", "index"]
        },
        "tags": ["search", "elasticsearch"]
    },

    # NoSQL
    {
        "name": "mongodb-loader",
        "display_name": "MongoDB",
        "description": "Load data into MongoDB",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.mongodb.MongoDBLoader",
        "icon": "Database",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {"type": "string", "title": "Connection"},
                "database": {"type": "string", "title": "Database"},
                "collection": {"type": "string", "title": "Collection"},
                "write_mode": {"type": "string", "title": "Write Mode", "enum": ["insert", "upsert"], "default": "insert"}
            },
            "required": ["connection_id", "database", "collection"]
        },
        "tags": ["database", "nosql", "mongodb"]
    },

    # Cloud Storage
    {
        "name": "s3-loader",
        "display_name": "AWS S3 / MinIO",
        "description": "Upload files to S3-compatible storage",
        "type": "loader",
        "category": "cloud",
        "python_class": "app.modules.loaders.s3.S3Loader",
        "icon": "Cloud",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "bucket": {"type": "string", "title": "Bucket Name"},
                "key": {"type": "string", "title": "Object Key/Path"},
                "format": {"type": "string", "title": "File Format", "enum": ["csv", "json", "parquet"], "default": "csv"}
            },
            "required": ["bucket", "key"]
        },
        "tags": ["cloud", "storage", "s3"]
    },

    # Message Queues
    {
        "name": "kafka-loader",
        "display_name": "Apache Kafka",
        "description": "Publish messages to Kafka topic",
        "type": "loader",
        "category": "streaming",
        "python_class": "app.modules.loaders.kafka.KafkaLoader",
        "icon": "Api",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "bootstrap_servers": {"type": "string", "title": "Bootstrap Servers"},
                "topic": {"type": "string", "title": "Topic Name"},
                "key_column": {"type": "string", "title": "Key Column (optional)"}
            },
            "required": ["bootstrap_servers", "topic"]
        },
        "tags": ["streaming", "kafka", "messaging"]
    },

    # Email
    {
        "name": "email-loader",
        "display_name": "Email",
        "description": "Send data via email",
        "type": "loader",
        "category": "notification",
        "python_class": "app.modules.loaders.email.EmailLoader",
        "icon": "Storage",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "smtp_host": {"type": "string", "title": "SMTP Host"},
                "smtp_port": {"type": "integer", "title": "SMTP Port", "default": 587},
                "to": {"type": "string", "title": "To Email"},
                "subject": {"type": "string", "title": "Subject"},
                "format": {"type": "string", "title": "Attachment Format", "enum": ["csv", "excel", "json"], "default": "csv"}
            },
            "required": ["smtp_host", "to", "subject"]
        },
        "tags": ["notification", "email"]
    },

    # Webhooks
    {
        "name": "webhook-loader",
        "display_name": "Webhook",
        "description": "Send data to webhook URL",
        "type": "loader",
        "category": "api",
        "python_class": "app.modules.loaders.webhook.WebhookLoader",
        "icon": "Api",
        "version": "1.0.0",
        "is_active": True,
        "config_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "title": "Webhook URL", "format": "uri"},
                "method": {"type": "string", "title": "HTTP Method", "enum": ["POST", "PUT"], "default": "POST"},
                "headers": {"type": "object", "title": "Custom Headers"},
                "batch_size": {"type": "integer", "title": "Batch Size", "default": 100}
            },
            "required": ["url"]
        },
        "tags": ["api", "webhook"]
    }
]


def add_module(module_data):
    """Add a single module via API"""
    try:
        response = requests.post(
            f"{API_URL}/api/v1/modules",
            json=module_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 201:
            result = response.json()
            print(f"✅ Added: {module_data['display_name']} ({module_data['type']})")
            return True
        elif response.status_code == 400 and "already exists" in response.text.lower():
            print(f"⏭️  Skipped: {module_data['display_name']} (already exists)")
            return False
        else:
            print(f"❌ Failed: {module_data['display_name']} - {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error adding {module_data['display_name']}: {str(e)}")
        return False


def main():
    """Add all additional modules"""
    print(f"\n🚀 Adding {len(ADDITIONAL_MODULES)} new modules to LogiData AI\n")
    print("=" * 70)

    # Count by type
    extractors = [m for m in ADDITIONAL_MODULES if m['type'] == 'extractor']
    transformers = [m for m in ADDITIONAL_MODULES if m['type'] == 'transformer']
    loaders = [m for m in ADDITIONAL_MODULES if m['type'] == 'loader']

    print(f"\n📊 Module Breakdown:")
    print(f"   - {len(extractors)} Extractors")
    print(f"   - {len(transformers)} Transformers")
    print(f"   - {len(loaders)} Loaders")
    print(f"\n" + "=" * 70 + "\n")

    added = 0
    skipped = 0
    failed = 0

    for module in ADDITIONAL_MODULES:
        result = add_module(module)
        if result is True:
            added += 1
        elif result is False:
            skipped += 1
        else:
            failed += 1

    print("\n" + "=" * 70)
    print(f"\n✨ Summary:")
    print(f"   ✅ Added: {added}")
    print(f"   ⏭️  Skipped: {skipped}")
    print(f"   ❌ Failed: {failed}")
    print(f"\n🎯 Total modules in system: Check via API")
    print(f"   curl http://localhost:8000/api/v1/modules | jq '.total'")
    print()


if __name__ == "__main__":
    main()
