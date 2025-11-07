#!/bin/bash

# ETL/ELT Builder - Development Environment Setup Script

set -e  # Exit on error

echo "======================================"
echo "ETL/ELT Builder - Development Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ backend/.env created${NC}"
    echo -e "${YELLOW}⚠ Please edit backend/.env and configure your settings${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend/.env from example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ frontend/.env created${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

echo ""
echo "======================================"
echo "Building Docker containers..."
echo "======================================"
echo ""

cd infrastructure/docker
docker-compose build

echo ""
echo -e "${GREEN}✓ Docker containers built successfully${NC}"
echo ""

echo "======================================"
echo "Starting services..."
echo "======================================"
echo ""

docker-compose up -d postgres redis minio airflow-postgres

# Wait for databases to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U etl_user > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e "\n${GREEN}✓ PostgreSQL is ready${NC}"

echo "Waiting for Redis to be ready..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e "${GREEN}✓ Redis is ready${NC}"

echo ""
echo "======================================"
echo "Initializing Airflow..."
echo "======================================"
echo ""

docker-compose up -d airflow-init
docker-compose logs -f airflow-init

echo ""
echo "======================================"
echo "Starting all services..."
echo "======================================"
echo ""

docker-compose up -d

echo ""
echo -e "${GREEN}✓ All services started successfully${NC}"
echo ""

echo "======================================"
echo "Initializing database..."
echo "======================================"
echo ""

# Wait for backend to be ready
sleep 5

# Run migrations
echo "Running database migrations..."
docker-compose exec -T backend alembic upgrade head
echo -e "${GREEN}✓ Database migrations completed${NC}"

echo ""
echo "======================================"
echo "Creating admin user..."
echo "======================================"
echo ""

docker-compose exec backend python scripts/create_admin.py

echo ""
echo "======================================"
echo "Setup completed successfully!"
echo "======================================"
echo ""
echo "Services are now running:"
echo ""
echo -e "  Frontend:         ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend API:      ${GREEN}http://localhost:8000${NC}"
echo -e "  API Docs:         ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  Airflow:          ${GREEN}http://localhost:8080${NC}"
echo -e "    Username: admin"
echo -e "    Password: admin"
echo -e "  MinIO Console:    ${GREEN}http://localhost:9001${NC}"
echo -e "    Username: minioadmin"
echo -e "    Password: minioadmin"
echo ""
echo "Useful commands:"
echo ""
echo "  View logs:           docker-compose -f infrastructure/docker/docker-compose.yml logs -f"
echo "  Stop services:       docker-compose -f infrastructure/docker/docker-compose.yml stop"
echo "  Start services:      docker-compose -f infrastructure/docker/docker-compose.yml start"
echo "  Restart services:    docker-compose -f infrastructure/docker/docker-compose.yml restart"
echo "  Remove everything:   docker-compose -f infrastructure/docker/docker-compose.yml down -v"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
