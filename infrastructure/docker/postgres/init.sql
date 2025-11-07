-- ETL/ELT Builder - PostgreSQL Initialization Script
-- This script is executed once when PostgreSQL container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Create TimescaleDB extension (for time-series optimization)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create database if not exists (usually already created by Docker)
-- The migrations (Alembic) will create all tables

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE etl_builder TO etl_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO etl_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO etl_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'ETL/ELT Builder database initialized successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pgcrypto, pg_trgm, timescaledb';
END $$;
