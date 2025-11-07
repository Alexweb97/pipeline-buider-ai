.PHONY: help install dev test clean docker-up docker-down docker-logs docker-restart docker-build docker-clean backend-shell db-shell redis-shell airflow-shell format lint type-check migrate migrate-create migrate-upgrade migrate-downgrade create-admin seed-data test-unit test-integration test-coverage backup-db restore-db logs health

# Variables
DOCKER_COMPOSE = docker-compose -f infrastructure/docker/docker-compose.yml
BACKEND_EXEC = $(DOCKER_COMPOSE) exec backend
DB_EXEC = $(DOCKER_COMPOSE) exec postgres
PYTHON = python3.14
UV = uv

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ Help

help: ## Display this help message
	@echo "$(BLUE)ETL/ELT Builder - Makefile Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(GREEN)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup & Installation

install: ## Install backend dependencies with uv
	@echo "$(BLUE)Installing backend dependencies with uv...$(NC)"
	cd backend && $(UV) sync
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install-dev: ## Install backend with dev dependencies
	@echo "$(BLUE)Installing backend with dev dependencies...$(NC)"
	cd backend && $(UV) sync --extra dev
	@echo "$(GREEN)✓ Dev dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

setup: ## Complete setup (copies .env files and installs dependencies)
	@echo "$(BLUE)Setting up project...$(NC)"
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "$(GREEN)✓ Created backend/.env$(NC)"; \
	fi
	@if [ ! -f frontend/.env ]; then \
		cp frontend/.env.example frontend/.env; \
		echo "$(GREEN)✓ Created frontend/.env$(NC)"; \
	fi
	@$(MAKE) install-dev
	@$(MAKE) install-frontend
	@echo "$(GREEN)✓ Setup complete!$(NC)"

setup-dev: ## Full development environment setup (Docker + DB)
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@chmod +x scripts/setup-dev.sh
	@./scripts/setup-dev.sh
	@echo "$(GREEN)✓ Development environment ready!$(NC)"

##@ Docker Commands

docker-up: ## Start all Docker containers
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Containers started$(NC)"

docker-down: ## Stop all Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

docker-restart: ## Restart all Docker containers
	@echo "$(BLUE)Restarting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✓ Containers restarted$(NC)"

docker-ps: ## Show status of Docker containers
	$(DOCKER_COMPOSE) ps

docker-logs: ## Show logs from all containers (follow)
	$(DOCKER_COMPOSE) logs -f

docker-logs-backend: ## Show backend logs
	$(DOCKER_COMPOSE) logs -f backend

docker-logs-frontend: ## Show frontend logs
	$(DOCKER_COMPOSE) logs -f frontend

docker-logs-airflow: ## Show Airflow logs
	$(DOCKER_COMPOSE) logs -f airflow-webserver airflow-scheduler

docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Images built$(NC)"

docker-build-backend: ## Build backend Docker image
	@echo "$(BLUE)Building backend image...$(NC)"
	$(DOCKER_COMPOSE) build backend
	@echo "$(GREEN)✓ Backend image built$(NC)"

docker-build-frontend: ## Build frontend Docker image
	@echo "$(BLUE)Building frontend image...$(NC)"
	$(DOCKER_COMPOSE) build frontend
	@echo "$(GREEN)✓ Frontend image built$(NC)"

docker-clean: ## Remove all containers, volumes, and images
	@echo "$(RED)⚠ This will remove all containers, volumes, and images!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(DOCKER_COMPOSE) down -v; \
		docker system prune -af; \
		echo "$(GREEN)✓ Cleanup complete$(NC)"; \
	fi

docker-restart-backend: ## Restart backend container
	$(DOCKER_COMPOSE) restart backend

docker-restart-frontend: ## Restart frontend container
	$(DOCKER_COMPOSE) restart frontend

##@ Shell Access

backend-shell: ## Access backend container shell
	$(BACKEND_EXEC) bash

db-shell: ## Access PostgreSQL shell
	$(DB_EXEC) psql -U etl_user -d etl_builder

redis-shell: ## Access Redis CLI
	$(DOCKER_COMPOSE) exec redis redis-cli

airflow-shell: ## Access Airflow webserver shell
	$(DOCKER_COMPOSE) exec airflow-webserver bash

##@ Development (Local)

dev-backend: ## Run backend locally (without Docker)
	@echo "$(BLUE)Starting backend development server...$(NC)"
	cd backend && $(UV) run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Run frontend locally (without Docker)
	@echo "$(BLUE)Starting frontend development server...$(NC)"
	cd frontend && npm run dev

dev-worker: ## Run Celery worker locally
	@echo "$(BLUE)Starting Celery worker...$(NC)"
	cd backend && $(UV) run celery -A app.workers.celery_app worker --loglevel=info

##@ Database

migrate: ## Run database migrations (upgrade to head)
	@echo "$(BLUE)Running database migrations...$(NC)"
	$(BACKEND_EXEC) alembic upgrade head
	@echo "$(GREEN)✓ Migrations applied$(NC)"

migrate-create: ## Create new migration (use MESSAGE=description)
	@if [ -z "$(MESSAGE)" ]; then \
		echo "$(RED)Error: MESSAGE is required$(NC)"; \
		echo "Usage: make migrate-create MESSAGE='description'"; \
		exit 1; \
	fi
	@echo "$(BLUE)Creating migration: $(MESSAGE)$(NC)"
	$(BACKEND_EXEC) alembic revision --autogenerate -m "$(MESSAGE)"
	@echo "$(GREEN)✓ Migration created$(NC)"

migrate-upgrade: ## Upgrade database by 1 version
	$(BACKEND_EXEC) alembic upgrade +1

migrate-downgrade: ## Downgrade database by 1 version
	@echo "$(YELLOW)⚠ Downgrading database...$(NC)"
	$(BACKEND_EXEC) alembic downgrade -1

migrate-history: ## Show migration history
	$(BACKEND_EXEC) alembic history

migrate-current: ## Show current migration version
	$(BACKEND_EXEC) alembic current

create-admin: ## Create admin user
	@echo "$(BLUE)Creating admin user...$(NC)"
	$(BACKEND_EXEC) python scripts/create_admin.py

seed-data: ## Seed database with sample data
	@echo "$(BLUE)Seeding database...$(NC)"
	$(BACKEND_EXEC) python scripts/seed_data.py
	@echo "$(GREEN)✓ Database seeded$(NC)"

##@ Database Backup & Restore

backup-db: ## Backup PostgreSQL database
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	$(DB_EXEC) pg_dump -U etl_user etl_builder > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"

restore-db: ## Restore database from backup (use FILE=path/to/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE is required$(NC)"; \
		echo "Usage: make restore-db FILE=backups/backup.sql"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠ Restoring database from $(FILE)...$(NC)"
	@read -p "This will overwrite current database. Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cat $(FILE) | $(DB_EXEC) psql -U etl_user etl_builder; \
		echo "$(GREEN)✓ Database restored$(NC)"; \
	fi

db-reset: ## Reset database (drop and recreate)
	@echo "$(RED)⚠ This will DELETE all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(DB_EXEC) dropdb -U etl_user --if-exists etl_builder; \
		$(DB_EXEC) createdb -U etl_user etl_builder; \
		$(MAKE) migrate; \
		echo "$(GREEN)✓ Database reset complete$(NC)"; \
	fi

##@ Testing

test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	cd backend && $(UV) run pytest -v

test-unit: ## Run unit tests only
	@echo "$(BLUE)Running unit tests...$(NC)"
	cd backend && $(UV) run pytest tests/unit/ -v

test-integration: ## Run integration tests only
	@echo "$(BLUE)Running integration tests...$(NC)"
	cd backend && $(UV) run pytest tests/integration/ -v

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)Running E2E tests...$(NC)"
	cd backend && $(UV) run pytest tests/e2e/ -v

test-coverage: ## Run tests with coverage report
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	cd backend && $(UV) run pytest --cov=app --cov-report=html --cov-report=term
	@echo "$(GREEN)✓ Coverage report generated in backend/htmlcov/$(NC)"

test-watch: ## Run tests in watch mode
	cd backend && $(UV) run pytest-watch

test-frontend: ## Run frontend tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && npm run test

test-frontend-coverage: ## Run frontend tests with coverage
	cd frontend && npm run test:coverage

##@ Code Quality

format: ## Format code with black and isort
	@echo "$(BLUE)Formatting code...$(NC)"
	cd backend && $(UV) run black app/ tests/
	cd backend && $(UV) run isort app/ tests/
	@echo "$(GREEN)✓ Code formatted$(NC)"

format-check: ## Check code formatting
	cd backend && $(UV) run black --check app/ tests/
	cd backend && $(UV) run isort --check app/ tests/

lint: ## Lint code with ruff and flake8
	@echo "$(BLUE)Linting code...$(NC)"
	cd backend && $(UV) run ruff check app/ tests/
	cd backend && $(UV) run flake8 app/ tests/
	@echo "$(GREEN)✓ Linting complete$(NC)"

lint-fix: ## Lint and auto-fix issues
	@echo "$(BLUE)Linting and fixing code...$(NC)"
	cd backend && $(UV) run ruff check --fix app/ tests/
	@echo "$(GREEN)✓ Auto-fix complete$(NC)"

type-check: ## Run type checking with mypy
	@echo "$(BLUE)Running type checks...$(NC)"
	cd backend && $(UV) run mypy app/
	@echo "$(GREEN)✓ Type checking complete$(NC)"

check-all: format lint type-check test ## Run all checks (format, lint, type-check, test)

##@ Monitoring & Logs

logs: ## Show logs from all services
	$(DOCKER_COMPOSE) logs --tail=100 -f

logs-backend: ## Show backend logs
	$(DOCKER_COMPOSE) logs --tail=100 -f backend

logs-errors: ## Show only error logs
	$(DOCKER_COMPOSE) logs --tail=100 -f | grep -i error

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo "\n$(GREEN)Docker Containers:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo "\n$(GREEN)Backend API:$(NC)"
	@curl -s http://localhost:8000/health | jq '.' || echo "$(RED)Backend not responding$(NC)"
	@echo "\n$(GREEN)Frontend:$(NC)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "$(RED)Frontend not responding$(NC)"
	@echo "\n$(GREEN)Airflow:$(NC)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080/health || echo "$(RED)Airflow not responding$(NC)"

stats: ## Show Docker container stats
	docker stats

##@ Airflow

airflow-dags-list: ## List all Airflow DAGs
	$(DOCKER_COMPOSE) exec airflow-webserver airflow dags list

airflow-dags-trigger: ## Trigger a DAG (use DAG=dag_id)
	@if [ -z "$(DAG)" ]; then \
		echo "$(RED)Error: DAG is required$(NC)"; \
		echo "Usage: make airflow-dags-trigger DAG=my_dag_id"; \
		exit 1; \
	fi
	$(DOCKER_COMPOSE) exec airflow-webserver airflow dags trigger $(DAG)

airflow-tasks-list: ## List tasks in a DAG (use DAG=dag_id)
	@if [ -z "$(DAG)" ]; then \
		echo "$(RED)Error: DAG is required$(NC)"; \
		exit 1; \
	fi
	$(DOCKER_COMPOSE) exec airflow-webserver airflow tasks list $(DAG)

##@ Cleanup

clean: ## Clean temporary files and caches
	@echo "$(BLUE)Cleaning temporary files...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/htmlcov 2>/dev/null || true
	rm -rf frontend/dist 2>/dev/null || true
	rm -rf frontend/coverage 2>/dev/null || true
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-docker: ## Clean Docker resources
	@$(MAKE) docker-clean

##@ Frontend

frontend-build: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)✓ Frontend built$(NC)"

frontend-preview: ## Preview production build
	cd frontend && npm run preview

frontend-lint: ## Lint frontend code
	cd frontend && npm run lint

frontend-format: ## Format frontend code
	cd frontend && npm run format

##@ Documentation

docs-serve: ## Serve documentation locally
	@echo "$(BLUE)Serving documentation...$(NC)"
	@echo "Visit: http://localhost:8001"
	cd docs && python3 -m http.server 8001

docs-api: ## Open API documentation
	@echo "Opening API documentation..."
	@open http://localhost:8000/docs || xdg-open http://localhost:8000/docs || echo "Visit: http://localhost:8000/docs"

##@ Quick Commands

start: docker-up ## Alias for docker-up

stop: docker-down ## Alias for docker-down

restart: docker-restart ## Alias for docker-restart

status: docker-ps health ## Show status of all services

rebuild: docker-build docker-up ## Rebuild and restart containers

fresh-start: docker-clean setup-dev ## Complete fresh start (WARNING: deletes all data)

##@ CI/CD

ci-test: ## Run CI tests
	cd backend && $(UV) run pytest -v --cov=app --cov-report=xml

ci-lint: ## Run CI linting
	cd backend && $(UV) run ruff check app/ tests/
	cd backend && $(UV) run black --check app/ tests/
	cd backend && $(UV) run mypy app/

ci-build: ## Build Docker images for CI
	$(DOCKER_COMPOSE) build --no-cache

##@ Info

info: ## Show project information
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║         ETL/ELT Builder - Project Info               ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Services:$(NC)"
	@echo "  • Frontend:    http://localhost:3000"
	@echo "  • Backend API: http://localhost:8000"
	@echo "  • API Docs:    http://localhost:8000/docs"
	@echo "  • Airflow UI:  http://localhost:8080 (admin/admin)"
	@echo "  • MinIO:       http://localhost:9001 (minioadmin/minioadmin)"
	@echo ""
	@echo "$(GREEN)Quick Commands:$(NC)"
	@echo "  make start              - Start all services"
	@echo "  make stop               - Stop all services"
	@echo "  make logs               - View logs"
	@echo "  make status             - Check service status"
	@echo "  make test               - Run tests"
	@echo "  make help               - Show all commands"
	@echo ""
	@echo "$(GREEN)Documentation:$(NC)"
	@echo "  • README.md          - Project overview"
	@echo "  • QUICK_START.md     - Quick start guide"
	@echo "  • docs/API.md        - API documentation"
	@echo "  • docs/MODULES.md    - Module development"
	@echo ""

version: ## Show version information
	@echo "Python: $$($(PYTHON) --version 2>&1)"
	@echo "uv: $$($(UV) --version 2>&1)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker-compose --version)"
	@echo "Node: $$(node --version 2>&1 || echo 'not installed')"
	@echo "npm: $$(npm --version 2>&1 || echo 'not installed')"
