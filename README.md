<div align="center">

# 🚀 LogiData AI

### Modern ETL/ELT Low-Code Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

**Enterprise-grade low-code platform for designing, configuring, and executing ETL/ELT pipelines through a modern visual interface with intelligent orchestration and real-time monitoring.**

[Features](#-key-features) • [Installation](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**LogiData AI** is a modern, enterprise-ready ETL/ELT platform that simplifies data pipeline creation and management through an intuitive visual interface. Built with cutting-edge technologies, it provides a comprehensive solution for data integration, transformation, and orchestration.

### Why LogiData AI?

- **🎨 Visual Pipeline Builder**: Drag-and-drop interface with React Flow for intuitive pipeline design
- **🤖 AI-Powered Assistant**: Generate, improve, and explain pipelines using natural language (GPT-4o-mini)
- **🔐 Enterprise Security**: JWT authentication, RBAC, audit logging, and IP geolocation tracking
- **📊 Real-time Monitoring**: Live dashboard with performance metrics and security insights
- **🔄 44+ Pre-built Modules**: Ready-to-use connectors for databases, APIs, cloud storage, and more
- **⚡ High Performance**: Async architecture with FastAPI and optimized database queries
- **🐳 Cloud-Ready**: Fully containerized with Docker and production-ready configuration

---

## ✨ Key Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **🎨 Visual Pipeline Builder** | React Flow-based drag-and-drop interface with real-time validation |
| **🤖 AI Pipeline Assistant** | Generate pipelines from text, improve existing ones, and get explanations |
| **📊 Interactive Dashboard** | Comprehensive overview with real-time KPIs and analytics |
| **🔌 44+ Connectors** | PostgreSQL, MySQL, MongoDB, Redis, S3, REST API, Kafka, and more |
| **🔄 Advanced Transformations** | Filter, Map, Aggregate, Join, Validate, and Custom transformations |
| **⏰ Smart Scheduling** | Cron-based scheduling with hourly, daily, weekly, and custom intervals |
| **📈 Analytics & Monitoring** | Performance dashboards with error analysis and trend visualization |
| **📁 File Management** | Drag & drop upload with support for CSV, JSON, Excel, Parquet |
| **🔐 Security Suite** | Authentication logs, active sessions, audit trails, and IP geolocation |
| **⚙️ Settings Management** | User profiles, notifications, appearance, and security settings |

### Module Categories

<details>
<summary><b>Extractors (13 modules)</b></summary>

- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, Cassandra, Elasticsearch
- **Cloud Storage**: Amazon S3, Google Cloud Storage, Azure Blob
- **APIs**: REST API, GraphQL
- **Message Queues**: Apache Kafka, RabbitMQ

</details>

<details>
<summary><b>Transformers (18 modules)</b></summary>

- **Data Cleaning**: Filter, Deduplicate, Validate, Clean, Fill Missing
- **Data Shaping**: Map, Aggregate, Sort, Pivot, Unpivot, Rename Columns
- **Data Enrichment**: Join, Merge, Lookup, Geocode
- **Data Splitting**: Split, Split by Condition
- **Custom**: Python Code, SQL Transform

</details>

<details>
<summary><b>Loaders (13 modules)</b></summary>

- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, Cassandra, Elasticsearch
- **Cloud Storage**: Amazon S3, Google Cloud Storage, Azure Blob
- **APIs**: REST API, GraphQL
- **Message Queues**: Apache Kafka, RabbitMQ

</details>

---

## 📸 Screenshots

<details>
<summary><b>🎨 View Screenshots</b></summary>

### Dashboard
![Dashboard](screenshots/01-dashboard.png)
*Real-time overview with KPIs, quick actions, and recent activity*

### Pipeline Builder
![Pipeline Builder](screenshots/02-pipeline-builder.png)
*Visual drag-and-drop pipeline designer with 44+ modules*

### Pipelines Management
![Pipelines](screenshots/03-pipelines.png)
*Pipeline listing with status, metrics, and actions*

### Security Monitoring
![Security](screenshots/04-security.png)
*Authentication logs, active sessions, and audit trails*

### Settings
![Settings](screenshots/05-settings.png)
*User profile, security, notifications, and appearance settings*

</details>

---

## 🛠 Technology Stack

### Frontend

```
React 18+                 # Modern UI framework
TypeScript 5.6           # Type-safe development
Material-UI v5           # Comprehensive UI component library
React Flow               # Visual pipeline builder
Zustand                  # Lightweight state management
React Router v6          # Client-side routing
TanStack Query           # Server state management
Vite                     # Lightning-fast build tool
```

### Backend

```
FastAPI 0.115+           # High-performance Python framework
Python 3.14              # Latest Python features
PostgreSQL 15+           # Robust relational database
SQLAlchemy 2.0          # Advanced ORM with async support
Alembic                  # Database migration tool
Pydantic v2             # Data validation
JWT + bcrypt            # Secure authentication
SlowAPI                 # Rate limiting
httpx                   # Async HTTP client (IP geolocation)
OpenAI + LangChain      # AI-powered features (optional)
```

### Infrastructure

```
Docker + Docker Compose  # Containerization
Nginx                   # Reverse proxy & load balancer
PostgreSQL              # Primary database (port 5433)
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│                  (React + TypeScript)                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Port 80)                       │
│              Reverse Proxy + Static Files                │
└────────────┬─────────────────────────┬──────────────────┘
             │                         │
             │ /api/*                  │ /*
             ▼                         ▼
┌──────────────────────┐    ┌────────────────────────┐
│  Backend API (8000)  │    │  Frontend (5173/dist)  │
│      FastAPI         │    │     React + Vite       │
└──────────┬───────────┘    └────────────────────────┘
           │
           ▼
┌──────────────────────┐
│  PostgreSQL (5433)   │
│   Database Server    │
└──────────────────────┘
```

### Key Design Principles

- **🎯 Separation of Concerns**: Clear distinction between presentation, business logic, and data layers
- **🔐 Security First**: JWT authentication, RBAC, audit logging, and input validation at every layer
- **⚡ Performance**: Async operations, connection pooling, and optimized database queries
- **🧩 Modularity**: 44+ pre-built modules organized in categories (Extractors, Transformers, Loaders)
- **📦 Containerization**: All services run in Docker for consistent deployment

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Docker >= 20.10
Docker Compose >= 2.0
Git

# Optional (for local development)
Node.js >= 18
Python >= 3.14
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Alexweb97/logidata_ai.git
cd logidata_ai

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your settings:
# - DATABASE_URL
# - SECRET_KEY (generate with: openssl rand -hex 32)
# - JWT configuration

# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend alembic upgrade head

# 5. Seed modules (44+ pre-built connectors)
docker-compose exec backend python scripts/seed_modules.py

# 6. Verify installation
docker-compose ps
# All services should be "Up" and healthy
```

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React development server |
| **Backend API** | http://localhost:8000 | FastAPI server |
| **API Docs** | http://localhost:8000/docs | Interactive Swagger UI |
| **ReDoc** | http://localhost:8000/redoc | Alternative API documentation |
| **Database** | localhost:5433 | PostgreSQL (credentials in .env) |

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change default credentials in production!

---

## 🤖 AI Pipeline Assistant

LogiData AI includes an **optional** AI-powered assistant that uses OpenAI's GPT-4o-mini to help you create and manage pipelines using natural language.

### Features

- **🚀 Generate Pipelines**: Create complete pipelines from text descriptions
- **✨ Improve Pipelines**: Enhance existing pipelines with natural language requests
- **📖 Explain Pipelines**: Get human-readable explanations of what pipelines do

### Quick Setup

```bash
# 1. Get an OpenAI API key from platform.openai.com
# 2. Add to backend/.env
OPENAI_API_KEY=sk-your-key-here

# 3. Restart backend
docker-compose restart backend

# 4. Open Pipeline Builder and click "AI Assistant"
```

### Example Usage

**Generate a pipeline:**
```
"Create a pipeline that fetches user data from the GitHub API,
filters repositories with more than 100 stars, and saves to CSV"
```

**Improve a pipeline:**
```
"Add error handling and data validation before loading"
```

**Explain a pipeline:**
```
Click "Explain" to get a plain English description of the pipeline
```

### Cost

Using GPT-4o-mini is extremely affordable:
- ~$0.0003 per pipeline generation
- ~$0.0005 per improvement
- ~$0.0002 per explanation

**Development costs**: < $1/month for typical usage

> **Note**: The AI Assistant is completely optional. LogiData AI functions fully without it. See [SETUP_AI.md](SETUP_AI.md) and [AI_ASSISTANT_GUIDE.md](AI_ASSISTANT_GUIDE.md) for detailed documentation.

---

## 💻 Development

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Seed modules
python scripts/seed_modules.py

# Run tests with coverage
pytest --cov=app --cov-report=html tests/

# Code formatting
black app/ tests/
isort app/ tests/

# Linting
flake8 app/ tests/
mypy app/
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
npm run test:coverage
```

### Docker Development

```bash
# Rebuild services after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec frontend sh

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## 📁 Project Structure

```
logidata_ai/
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── api/                 # API Endpoints
│   │   │   └── v1/
│   │   │       ├── auth.py      # Authentication (login, register, refresh)
│   │   │       ├── users.py     # User management
│   │   │       ├── pipelines.py # Pipeline CRUD + audit logging
│   │   │       ├── modules.py   # Module library (44+ connectors)
│   │   │       └── security.py  # Security monitoring endpoints
│   │   ├── core/                # Core Configuration
│   │   │   ├── config.py        # App settings (Pydantic)
│   │   │   ├── security.py      # JWT, password hashing
│   │   │   ├── audit.py         # Audit logging & IP geolocation
│   │   │   └── logger.py        # Structured logging
│   │   ├── db/                  # Database Layer
│   │   │   ├── base.py          # SQLAlchemy base
│   │   │   └── models/          # ORM Models
│   │   │       ├── user.py      # User model
│   │   │       ├── pipeline.py  # Pipeline model
│   │   │       ├── module.py    # Module model
│   │   │       ├── auth_log.py  # Authentication logs
│   │   │       ├── active_session.py # Active sessions
│   │   │       └── audit_event.py    # Audit trail
│   │   ├── schemas/             # Pydantic Schemas
│   │   │   ├── user.py
│   │   │   ├── pipeline.py
│   │   │   └── auth.py
│   │   └── main.py              # FastAPI application
│   ├── alembic/                 # Database Migrations
│   │   └── versions/
│   ├── scripts/                 # Utility Scripts
│   │   └── seed_modules.py      # Seed 44+ modules
│   ├── tests/                   # Test Suite
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── api/                 # API Client Layer
│   │   │   ├── client.ts        # Axios/Fetch wrapper
│   │   │   ├── auth.ts          # Auth API
│   │   │   ├── pipelines.ts     # Pipeline API
│   │   │   ├── modules.ts       # Module API
│   │   │   └── security.ts      # Security API
│   │   ├── components/          # Reusable Components
│   │   │   ├── DashboardLayout.tsx   # Main layout with sidebar
│   │   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   │   ├── ModuleCard.tsx        # Module display
│   │   │   └── PipelineFlow.tsx      # React Flow canvas
│   │   ├── pages/               # Application Pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PipelineBuilderPage.tsx  # Visual builder (React Flow)
│   │   │   ├── PipelinesPage.tsx
│   │   │   ├── SecurityPage.tsx         # Auth logs, sessions, audit
│   │   │   └── SettingsPage.tsx         # User settings
│   │   ├── stores/              # State Management (Zustand)
│   │   │   ├── authStore.ts     # Authentication state
│   │   │   ├── pipelineStore.ts # Pipeline state
│   │   │   └── moduleStore.ts   # Module state
│   │   ├── types/               # TypeScript Definitions
│   │   │   ├── pipeline.ts
│   │   │   ├── module.ts
│   │   │   └── auth.ts
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml           # Development orchestration
├── docker-compose.prod.yml      # Production orchestration
├── nginx.conf                   # Nginx configuration
└── README.md                    # This file
```

---

## 🔐 Security

LogiData AI implements enterprise-grade security measures:

### Authentication & Authorization

- **JWT Tokens**: Access tokens (30min) + Refresh tokens (7 days)
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Active session tracking with token hashing
- **Rate Limiting**: SlowAPI protection against brute-force attacks
- **RBAC**: Role-based access control (admin, user, viewer)

### Audit & Monitoring

- **Authentication Logs**: All login attempts (success/failure) with IP and user agent
- **Active Sessions**: Real-time tracking of logged-in users
- **Audit Trail**: Complete history of pipeline operations (create, update, delete, execute)
- **IP Geolocation**: Automatic location detection using ip-api.com
- **Security Alerts**: Real-time notifications for suspicious activities

### Data Protection

- **Input Validation**: Pydantic schemas for all API inputs
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **XSS Protection**: React's built-in escaping + CSP headers
- **CORS**: Configured whitelist for allowed origins
- **HTTPS**: SSL/TLS in production (via Nginx)

### Security Endpoints

```python
GET  /api/v1/security/login-history     # Authentication logs
GET  /api/v1/security/active-sessions   # Current sessions
GET  /api/v1/security/audit-log         # Audit trail
GET  /api/v1/security/statistics        # Security metrics
```

---

## 📖 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Core Endpoints

<details>
<summary><b>Authentication</b></summary>

```http
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

</details>

<details>
<summary><b>Pipelines</b></summary>

```http
GET    /api/v1/pipelines/              # List pipelines (with pagination)
POST   /api/v1/pipelines/              # Create pipeline + audit log
GET    /api/v1/pipelines/{id}          # Get pipeline details
PUT    /api/v1/pipelines/{id}          # Update pipeline + audit log
DELETE /api/v1/pipelines/{id}          # Delete pipeline + audit log
POST   /api/v1/pipelines/{id}/execute  # Execute pipeline + audit log
POST   /api/v1/pipelines/{id}/validate # Validate configuration
```

</details>

<details>
<summary><b>Modules</b></summary>

```http
GET    /api/v1/modules/           # List all modules (44+)
GET    /api/v1/modules/{id}       # Get module details
GET    /api/v1/modules/category/{category}  # Filter by category
```

</details>

<details>
<summary><b>Security</b></summary>

```http
GET    /api/v1/security/login-history      # Auth logs with summary
GET    /api/v1/security/active-sessions    # Current sessions
GET    /api/v1/security/audit-log          # Audit trail (filterable)
GET    /api/v1/security/statistics         # Security KPIs
```

</details>

<details>
<summary><b>AI Assistant (Optional)</b></summary>

```http
POST   /api/v1/ai/generate        # Generate pipeline from text
POST   /api/v1/ai/improve         # Improve existing pipeline
POST   /api/v1/ai/explain         # Explain pipeline in plain English
```

> **Note**: Requires `OPENAI_API_KEY` in environment

</details>

### Example: Create Pipeline with Audit

```bash
curl -X POST "http://localhost:8000/api/v1/pipelines/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Data Pipeline",
    "description": "Extract sales data from PostgreSQL and load to S3",
    "config": {
      "nodes": [
        {
          "id": "node1",
          "type": "extractor",
          "data": {
            "moduleId": "postgres-extractor",
            "config": { "query": "SELECT * FROM sales" }
          }
        },
        {
          "id": "node2",
          "type": "loader",
          "data": {
            "moduleId": "s3-loader",
            "config": { "bucket": "sales-data" }
          }
        }
      ],
      "edges": [
        { "source": "node1", "target": "node2" }
      ]
    }
  }'
```

**Response**: Pipeline created + audit event logged with IP, user agent, and details.

---

## 🚢 Deployment

### Production with Docker Compose

```bash
# 1. Configure production environment
cp backend/.env.example backend/.env.prod
nano backend/.env.prod

# Update for production:
# - Strong SECRET_KEY (openssl rand -hex 32)
# - Production DATABASE_URL
# - Disable DEBUG mode
# - Configure CORS for production domain

# 2. Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Apply database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 4. Seed modules
docker-compose -f docker-compose.prod.yml exec backend python scripts/seed_modules.py

# 5. Create admin user
docker-compose -f docker-compose.prod.yml exec backend python scripts/create_admin.py

# 6. Verify deployment
docker-compose -f docker-compose.prod.yml ps
curl http://localhost/api/v1/health
```

### Environment Variables

<details>
<summary><b>Backend (.env)</b></summary>

```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/logidata_ai

# Security
SECRET_KEY=your-super-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
DEBUG=false
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com

# CORS
CORS_ORIGINS=["https://yourdomain.com"]
```

</details>

<details>
<summary><b>Frontend (.env)</b></summary>

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com

# Application
VITE_APP_NAME=LogiData AI
VITE_APP_VERSION=1.0.0
```

</details>

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database connection
docker-compose exec backend python -c "from app.db.session import SessionLocal; db = SessionLocal(); print('DB OK')"

# All services
docker-compose ps
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest -v

# Run with coverage
pytest --cov=app --cov-report=html tests/

# Run specific test file
pytest tests/unit/test_auth.py -v

# Run with markers
pytest -m "unit" -v
pytest -m "integration" -v

# Generate coverage report
pytest --cov=app --cov-report=term-missing tests/
open htmlcov/index.html
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# E2E tests (if configured)
npm run test:e2e
```

### Test Coverage Goals

- **Unit Tests**: > 80%
- **Integration Tests**: > 60%
- **E2E Tests**: Critical user flows

---

## 🗺 Roadmap

### ✅ Phase 1: Core Platform (Completed)

- [x] Modern React + TypeScript frontend
- [x] FastAPI backend with PostgreSQL
- [x] JWT authentication & authorization
- [x] Visual pipeline builder (React Flow)
- [x] 44+ pre-built modules (Extractors, Transformers, Loaders)
- [x] Dashboard with real-time KPIs
- [x] Security monitoring (auth logs, sessions, audit trail)
- [x] IP geolocation for sessions
- [x] Settings management
- [x] Docker containerization
- [x] **AI Pipeline Assistant (GPT-4o-mini integration)**
  - [x] Natural language pipeline generation
  - [x] Pipeline improvement suggestions
  - [x] Plain English pipeline explanations

### 🔄 Phase 2: Advanced Features (In Progress)

- [ ] Real pipeline execution engine
- [ ] WebSocket-based real-time monitoring
- [ ] Advanced data validation rules
- [ ] Pipeline versioning & rollback
- [ ] Notification system (email, Slack, webhooks)
- [ ] Custom module SDK
- [ ] Data quality monitoring
- [ ] Performance profiling

### 📋 Phase 3: Enterprise Features (Planned)

- [ ] Multi-tenancy support
- [ ] Advanced RBAC with team management
- [ ] Git integration for pipeline versioning
- [ ] CI/CD pipeline deployment
- [ ] Advanced scheduling (dependencies, triggers)
- [ ] Data lineage tracking
- [ ] Cost monitoring and optimization
- [ ] SLA monitoring and alerting

### 🚀 Phase 4: AI & Intelligence Enhancements

- [x] Natural language pipeline creation (Basic)
- [ ] Advanced AI pipeline optimization
- [ ] Auto-optimization based on execution patterns
- [ ] Anomaly detection in data flows
- [ ] Predictive performance analytics
- [ ] Smart error recovery with AI suggestions
- [ ] Automated data profiling
- [ ] AI-powered code generation for custom transformers
- [ ] Intelligent data quality recommendations

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation updates
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Code Standards

**Backend:**
- Black for code formatting
- isort for import sorting
- flake8 for linting
- mypy for type checking
- pytest for testing

**Frontend:**
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- Jest for testing

### Pull Request Guidelines

- ✅ Follow coding standards
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Ensure CI/CD passes
- ✅ Keep PRs focused and small
- ✅ Write clear commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What you can do:

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

### What you must do:

- 📄 Include license and copyright notice

---

## 👥 Team

### Core Maintainer

**Alexandre (Alexweb97)**
- GitHub: [@Alexweb97](https://github.com/Alexweb97)
- Email: alexandretoto.dev@gmail.com

### Contributors

We appreciate all contributions! See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full list.

---

## 🙏 Acknowledgments

### Technologies

This project is built with amazing open-source technologies:

- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Material-UI](https://mui.com/) - UI components
- [React Flow](https://reactflow.dev/) - Visual pipeline builder
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM
- [Docker](https://www.docker.com/) - Containerization

### Inspiration

- [Apache Airflow](https://airflow.apache.org/) - Workflow orchestration
- [Prefect](https://www.prefect.io/) - Dataflow automation
- [n8n](https://n8n.io/) - Workflow automation
- [Node-RED](https://nodered.org/) - Visual programming

---

## 📞 Support

### Get Help

- 📖 **Documentation**: [GitHub Wiki](https://github.com/Alexweb97/logidata_ai/wiki)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Alexweb97/logidata_ai/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Alexweb97/logidata_ai/discussions)
- 📧 **Email**: alexandretoto.dev@gmail.com

### Enterprise Support

For enterprise support, training, or custom development:
- Email: alexandretoto.dev@gmail.com
- Include "[Enterprise]" in the subject line

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/Alexweb97/logidata_ai?style=social)
![GitHub forks](https://img.shields.io/github/forks/Alexweb97/logidata_ai?style=social)
![GitHub issues](https://img.shields.io/github/issues/Alexweb97/logidata_ai)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Alexweb97/logidata_ai)

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star! ⭐**

Made with ❤️ by [Alexandre](https://github.com/Alexweb97)

</div>
