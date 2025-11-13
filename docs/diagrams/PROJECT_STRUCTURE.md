# Project Structure - ETL/ELT Builder Platform

## Vue d'ensemble de l'arborescence

```
logidata_ai/
├── backend/                      # Backend FastAPI
│   ├── alembic/                 # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration management
│   │   ├── dependencies.py      # DI dependencies
│   │   │
│   │   ├── api/                 # API routes
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py      # Authentication endpoints
│   │   │   │   ├── users.py     # User management
│   │   │   │   ├── pipelines.py # Pipeline CRUD
│   │   │   │   ├── executions.py # Execution management
│   │   │   │   ├── connections.py # Data source connections
│   │   │   │   ├── modules.py   # Module templates
│   │   │   │   └── webhooks.py  # Webhook handlers
│   │   │   └── websocket.py     # WebSocket for real-time updates
│   │   │
│   │   ├── core/                # Core business logic
│   │   │   ├── __init__.py
│   │   │   ├── security.py      # JWT, password hashing
│   │   │   ├── encryption.py    # Data encryption utilities
│   │   │   ├── permissions.py   # RBAC logic
│   │   │   └── exceptions.py    # Custom exceptions
│   │   │
│   │   ├── db/                  # Database layer
│   │   │   ├── __init__.py
│   │   │   ├── session.py       # SQLAlchemy session
│   │   │   ├── base.py          # Base model
│   │   │   └── models/          # SQLAlchemy models
│   │   │       ├── __init__.py
│   │   │       ├── user.py
│   │   │       ├── organization.py
│   │   │       ├── pipeline.py
│   │   │       ├── execution.py
│   │   │       ├── connection.py
│   │   │       └── audit.py
│   │   │
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── pipeline.py
│   │   │   ├── execution.py
│   │   │   ├── connection.py
│   │   │   └── module.py
│   │   │
│   │   ├── services/            # Business logic services
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── pipeline_service.py
│   │   │   ├── execution_service.py
│   │   │   ├── connection_service.py
│   │   │   ├── ai_service.py    # AI suggestions
│   │   │   └── notification_service.py
│   │   │
│   │   ├── orchestration/       # Airflow integration
│   │   │   ├── __init__.py
│   │   │   ├── dag_generator.py # Generate DAGs from pipeline config
│   │   │   ├── dag_manager.py   # Manage Airflow DAGs
│   │   │   └── operators/       # Custom Airflow operators
│   │   │       ├── __init__.py
│   │   │       ├── extract_operator.py
│   │   │       ├── transform_operator.py
│   │   │       └── load_operator.py
│   │   │
│   │   ├── modules/             # Pipeline modules implementation
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # Base module class
│   │   │   ├── extractors/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── postgres_extractor.py
│   │   │   │   ├── mysql_extractor.py
│   │   │   │   ├── mongodb_extractor.py
│   │   │   │   ├── csv_extractor.py
│   │   │   │   ├── api_extractor.py
│   │   │   │   └── s3_extractor.py
│   │   │   ├── transformers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── cleaner.py
│   │   │   │   ├── aggregator.py
│   │   │   │   ├── joiner.py
│   │   │   │   ├── filter.py
│   │   │   │   ├── enricher.py
│   │   │   │   └── ml_transformer.py
│   │   │   └── loaders/
│   │   │       ├── __init__.py
│   │   │       ├── postgres_loader.py
│   │   │       ├── mysql_loader.py
│   │   │       ├── mongodb_loader.py
│   │   │       ├── s3_loader.py
│   │   │       └── parquet_loader.py
│   │   │
│   │   ├── ai/                  # AI/ML components
│   │   │   ├── __init__.py
│   │   │   ├── data_profiler.py # Analyze data schemas
│   │   │   ├── transformer_suggester.py # Suggest transformations
│   │   │   ├── anomaly_detector.py # Detect data anomalies
│   │   │   └── nlp/
│   │   │       ├── __init__.py
│   │   │       ├── query_generator.py # Natural language to SQL
│   │   │       └── entity_extractor.py
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── logging.py
│   │   │   ├── validators.py
│   │   │   ├── data_helpers.py
│   │   │   └── file_helpers.py
│   │   │
│   │   └── workers/             # Celery tasks
│   │       ├── __init__.py
│   │       ├── celery_app.py
│   │       ├── pipeline_tasks.py
│   │       └── cleanup_tasks.py
│   │
│   ├── dags/                    # Airflow DAGs directory
│   │   ├── __init__.py
│   │   └── dynamic_dags.py      # Dynamic DAG loader
│   │
│   ├── tests/                   # Backend tests
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── unit/
│   │   │   ├── test_services.py
│   │   │   ├── test_modules.py
│   │   │   └── test_ai.py
│   │   ├── integration/
│   │   │   ├── test_api.py
│   │   │   ├── test_pipelines.py
│   │   │   └── test_executions.py
│   │   └── e2e/
│   │       └── test_full_pipeline.py
│   │
│   ├── scripts/                 # Utility scripts
│   │   ├── init_db.py
│   │   ├── create_admin.py
│   │   └── seed_data.py
│   │
│   ├── requirements.txt         # Python dependencies
│   ├── requirements-dev.txt     # Dev dependencies
│   ├── pyproject.toml          # Poetry configuration
│   ├── pytest.ini
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                    # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/
│   │       └── images/
│   │
│   ├── src/
│   │   ├── main.tsx            # Entry point
│   │   ├── App.tsx
│   │   ├── vite-env.d.ts
│   │   │
│   │   ├── api/                # API client
│   │   │   ├── client.ts       # Axios configuration
│   │   │   ├── auth.ts
│   │   │   ├── pipelines.ts
│   │   │   ├── executions.ts
│   │   │   ├── connections.ts
│   │   │   └── modules.ts
│   │   │
│   │   ├── components/         # React components
│   │   │   ├── common/         # Reusable components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Loader.tsx
│   │   │   │   └── Toast.tsx
│   │   │   │
│   │   │   ├── layout/         # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   │
│   │   │   ├── pipeline/       # Pipeline-specific
│   │   │   │   ├── PipelineCanvas.tsx # React Flow canvas
│   │   │   │   ├── NodePalette.tsx    # Draggable modules
│   │   │   │   ├── ConfigPanel.tsx    # Node configuration
│   │   │   │   ├── nodes/             # Custom node types
│   │   │   │   │   ├── ExtractorNode.tsx
│   │   │   │   │   ├── TransformerNode.tsx
│   │   │   │   │   └── LoaderNode.tsx
│   │   │   │   └── edges/
│   │   │   │       └── CustomEdge.tsx
│   │   │   │
│   │   │   ├── execution/      # Execution monitoring
│   │   │   │   ├── ExecutionList.tsx
│   │   │   │   ├── ExecutionDetails.tsx
│   │   │   │   ├── LogViewer.tsx
│   │   │   │   └── MetricsChart.tsx
│   │   │   │
│   │   │   ├── connection/     # Connection management
│   │   │   │   ├── ConnectionList.tsx
│   │   │   │   ├── ConnectionForm.tsx
│   │   │   │   └── ConnectionTest.tsx
│   │   │   │
│   │   │   └── auth/           # Authentication
│   │   │       ├── LoginForm.tsx
│   │   │       ├── RegisterForm.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   │
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PipelinesPage.tsx
│   │   │   ├── PipelineEditorPage.tsx
│   │   │   ├── ExecutionsPage.tsx
│   │   │   ├── ConnectionsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── stores/             # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── pipelineStore.ts
│   │   │   ├── executionStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePipeline.ts
│   │   │   ├── useWebSocket.ts
│   │   │   └── useDataPreview.ts
│   │   │
│   │   ├── types/              # TypeScript types
│   │   │   ├── pipeline.ts
│   │   │   ├── execution.ts
│   │   │   ├── connection.ts
│   │   │   ├── module.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── dateHelpers.ts
│   │   │   └── flowHelpers.ts  # React Flow utilities
│   │   │
│   │   ├── styles/             # Global styles
│   │   │   ├── theme.ts        # MUI theme
│   │   │   ├── global.css
│   │   │   └── variables.css
│   │   │
│   │   └── constants/          # Constants
│   │       ├── modules.ts      # Module definitions
│   │       ├── colors.ts
│   │       └── routes.ts
│   │
│   ├── tests/                  # Frontend tests
│   │   ├── setup.ts
│   │   ├── unit/
│   │   │   └── components/
│   │   └── integration/
│   │       └── pages/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── Dockerfile
│
├── infrastructure/              # Infrastructure as Code
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── postgres/
│   │   │   └── init.sql
│   │   ├── nginx/
│   │   │   └── nginx.conf
│   │   └── redis/
│   │       └── redis.conf
│   │
│   ├── kubernetes/              # K8s manifests (optionnel)
│   │   ├── namespace.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── postgres-statefulset.yaml
│   │   └── ingress.yaml
│   │
│   └── terraform/               # Terraform (optionnel)
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── docs/                        # Documentation
│   ├── API.md                  # API documentation
│   ├── MODULES.md              # Module development guide
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── SECURITY.md             # Security guidelines
│   ├── CONTRIBUTING.md
│   └── diagrams/
│       ├── architecture.png
│       └── data-flow.png
│
├── scripts/                     # Global scripts
│   ├── setup-dev.sh            # Setup development environment
│   ├── run-tests.sh            # Run all tests
│   ├── backup-db.sh            # Database backup
│   └── deploy.sh               # Deployment script
│
├── .github/                     # GitHub configuration
│   ├── workflows/
│   │   ├── backend-tests.yml
│   │   ├── frontend-tests.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore
├── .dockerignore
├── README.md
├── LICENSE
├── ARCHITECTURE.md             # This file
├── DATABASE_SCHEMA.md
└── CHANGELOG.md
```

## Détails par Répertoire

### Backend (`backend/`)

**Technologies**: Python 3.11+, FastAPI, SQLAlchemy, Alembic, Celery, Apache Airflow

**Points clés**:
- Architecture en couches: API → Services → DB
- Séparation des préoccupations (SoC)
- Dependency Injection via FastAPI
- Tests unitaires et d'intégration avec pytest

### Frontend (`frontend/`)

**Technologies**: React 18+, TypeScript, Vite, React Flow, MUI, Zustand

**Points clés**:
- Architecture par features (co-location)
- Custom hooks pour logique réutilisable
- State management léger avec Zustand
- React Query pour cache API

### Infrastructure (`infrastructure/`)

**Technologies**: Docker, Docker Compose, Nginx, (optionnel: K8s, Terraform)

**Points clés**:
- Environnements isolés (dev, staging, prod)
- Secrets management avec Docker secrets ou Vault
- Reverse proxy avec Nginx
- Scaling horizontal possible

## Conventions de Nommage

### Backend (Python)
- **Fichiers**: snake_case (ex: `pipeline_service.py`)
- **Classes**: PascalCase (ex: `PipelineService`)
- **Fonctions**: snake_case (ex: `create_pipeline`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_RETRIES`)

### Frontend (TypeScript)
- **Fichiers**: PascalCase pour composants (ex: `PipelineCanvas.tsx`)
- **Fichiers**: camelCase pour utils (ex: `formatters.ts`)
- **Composants**: PascalCase (ex: `PipelineCanvas`)
- **Fonctions**: camelCase (ex: `formatDate`)
- **Types/Interfaces**: PascalCase (ex: `Pipeline`, `IUser`)

## Variables d'Environnement

### Backend (`.env`)
```bash
# Application
APP_NAME=ETL/ELT Builder
APP_VERSION=1.0.0
ENVIRONMENT=development # development, staging, production
DEBUG=true

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/etl_builder
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Airflow
AIRFLOW_HOME=/opt/airflow
AIRFLOW_WEBSERVER_PORT=8080
AIRFLOW_API_URL=http://localhost:8080/api/v1

# Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=data-lake
MINIO_SECURE=false

# AI/ML
OPENAI_API_KEY=sk-... # Optionnel
HUGGINGFACE_API_KEY=hf_... # Optionnel

# Monitoring
SENTRY_DSN=https://...@sentry.io/... # Optionnel
LOG_LEVEL=INFO
```

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=ETL/ELT Builder
VITE_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## Scripts de Développement

### Backend
```bash
# Install dependencies
pip install -r requirements-dev.txt

# Run migrations
alembic upgrade head

# Run dev server (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run Celery worker
celery -A app.workers.celery_app worker --loglevel=info

# Run tests
pytest -v --cov=app tests/

# Lint & format
black app/
isort app/
flake8 app/
mypy app/
```

### Frontend
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint & format
npm run lint
npm run format

# Type check
npm run type-check
```

## Workflow Git

### Branches
- `main`: Production
- `develop`: Développement
- `feature/*`: Nouvelles fonctionnalités
- `bugfix/*`: Corrections de bugs
- `hotfix/*`: Corrections urgentes en prod

### Commits
Convention: [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

Exemple:
```
feat(pipeline): add data preview functionality

Implement real-time data preview at each pipeline node
using WebSocket connection for streaming results.

Closes #123
```

## CI/CD Pipeline

### GitHub Actions Workflow

1. **Backend Tests** (sur push à develop/main)
   - Lint (black, isort, flake8)
   - Type check (mypy)
   - Unit tests
   - Integration tests
   - Coverage report

2. **Frontend Tests**
   - Lint (ESLint)
   - Type check (tsc)
   - Unit tests (Vitest)
   - Build test

3. **Deploy Staging** (sur merge à develop)
   - Build Docker images
   - Push to registry
   - Deploy to staging environment
   - Run smoke tests

4. **Deploy Production** (sur tag v*)
   - Build production images
   - Push to registry
   - Deploy to production
   - Post-deployment tests
   - Rollback automatique si échec

## Monitoring & Logging

### Application Logs
```python
import structlog

logger = structlog.get_logger()

logger.info(
    "pipeline_executed",
    pipeline_id=pipeline.id,
    execution_time=elapsed,
    rows_processed=count
)
```

### Métriques Prometheus
- `http_requests_total`: Total requests
- `http_request_duration_seconds`: Request latency
- `pipeline_executions_total`: Total pipeline runs
- `pipeline_execution_duration_seconds`: Execution time
- `data_rows_processed_total`: Rows processed

### Health Checks
- `/health`: Basic health check
- `/health/ready`: Readiness probe (K8s)
- `/health/live`: Liveness probe (K8s)
- `/metrics`: Prometheus metrics

## Prochaines Étapes

1. **Initialisation**: Créer structure de dossiers
2. **Backend Setup**: FastAPI + SQLAlchemy + Alembic
3. **Frontend Setup**: React + Vite + React Flow
4. **Docker Compose**: Environnement dev complet
5. **Premier Pipeline**: PostgreSQL → Transform → S3
6. **Tests**: Coverage > 80%
7. **Documentation**: API docs + module guide
