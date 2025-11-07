# ETL/ELT Builder - Backend

Backend FastAPI avec Python 3.14 et uv (gestionnaire de paquets ultra-rapide).

## Technologies

- **Python 3.14**
- **uv** - Gestionnaire de paquets Python (remplace pip/poetry)
- **FastAPI** - Framework web moderne
- **SQLAlchemy 2.0** - ORM async
- **PostgreSQL** - Base de données
- **Apache Airflow** - Orchestration
- **Celery** - Tâches asynchrones
- **Redis** - Cache et broker

## Quick Start

### Installation avec uv

```bash
# Installer uv (si pas déjà installé)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Installer les dépendances
cd backend
uv sync                # Production dependencies
uv sync --extra dev    # + Dev dependencies
```

### Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables
nano .env
```

### Lancer le serveur

```bash
# Avec uv run
uv run uvicorn app.main:app --reload

# Ou avec Makefile (depuis la racine)
make dev-backend
```

L'API sera accessible sur http://localhost:8000

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Gestion des Dépendances avec uv

### Ajouter une dépendance

```bash
# Production
uv add fastapi

# Dev only
uv add --dev pytest

# Avec version spécifique
uv add "fastapi>=0.109.0"
```

### Supprimer une dépendance

```bash
uv remove package-name
```

### Mettre à jour

```bash
# Mettre à jour le lock file
uv lock

# Synchroniser avec le lock file
uv sync
```

### Lister les packages

```bash
uv pip list
uv pip show package-name
```

### Exporter requirements.txt (si nécessaire)

```bash
uv pip freeze > requirements.txt
```

## Développement

### Structure du Projet

```
backend/
├── app/
│   ├── main.py              # Point d'entrée FastAPI
│   ├── config.py            # Configuration
│   ├── api/                 # Routes API
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── pipelines.py
│   │       └── ...
│   ├── db/                  # Base de données
│   │   ├── session.py
│   │   ├── base.py
│   │   └── models/
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   ├── modules/             # Pipeline modules
│   └── workers/             # Celery tasks
├── tests/
├── scripts/
├── pyproject.toml           # Configuration uv
├── uv.lock                  # Lock file
└── .env
```

### Migrations de Base de Données

```bash
# Créer une nouvelle migration
uv run alembic revision --autogenerate -m "description"

# Appliquer les migrations
uv run alembic upgrade head

# Rollback
uv run alembic downgrade -1

# Historique
uv run alembic history
```

### Tests

```bash
# Tous les tests
uv run pytest -v

# Tests unitaires
uv run pytest tests/unit/ -v

# Avec coverage
uv run pytest --cov=app --cov-report=html

# Test spécifique
uv run pytest tests/unit/test_services.py::test_function -v
```

### Code Quality

```bash
# Format code
uv run black app/ tests/
uv run isort app/ tests/

# Lint
uv run ruff check app/ tests/
uv run flake8 app/ tests/

# Type checking
uv run mypy app/

# Tout en un (via Makefile)
make check-all
```

## Docker

### Build

```bash
# Depuis la racine du projet
docker build -f backend/Dockerfile -t etl-backend:latest backend/

# Ou via docker-compose
make docker-build-backend
```

### Run

```bash
# Via docker-compose (recommandé)
make docker-up

# Ou directement
docker run -p 8000:8000 -e DATABASE_URL=... etl-backend:latest
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Créer un compte
- `POST /api/v1/auth/login` - Se connecter
- `POST /api/v1/auth/refresh` - Rafraîchir le token
- `GET /api/v1/auth/me` - Utilisateur actuel

### Pipelines

- `GET /api/v1/pipelines` - Lister les pipelines
- `POST /api/v1/pipelines` - Créer un pipeline
- `GET /api/v1/pipelines/{id}` - Détails d'un pipeline
- `PUT /api/v1/pipelines/{id}` - Modifier un pipeline
- `DELETE /api/v1/pipelines/{id}` - Supprimer un pipeline
- `POST /api/v1/pipelines/{id}/execute` - Exécuter un pipeline

### Executions

- `GET /api/v1/executions` - Lister les exécutions
- `GET /api/v1/executions/{id}` - Détails d'une exécution
- `GET /api/v1/executions/{id}/logs` - Logs d'une exécution

Voir documentation complète: http://localhost:8000/docs

## Variables d'Environnement

```bash
# Application
APP_NAME="ETL/ELT Builder"
ENVIRONMENT=development
DEBUG=true

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/etl_builder

# Redis
REDIS_URL=redis://:password@localhost:6379/0

# Airflow
AIRFLOW_API_URL=http://localhost:8080/api/v1

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

Voir `.env.example` pour la liste complète.

## Commandes Utiles

### Via Makefile (recommandé)

```bash
# Depuis la racine du projet
make help                # Voir toutes les commandes
make dev-backend         # Lancer le serveur dev
make test                # Lancer les tests
make format              # Formater le code
make lint                # Linter le code
make migrate             # Appliquer les migrations
make create-admin        # Créer un admin
```

### Directement avec uv

```bash
cd backend

# Serveur dev
uv run uvicorn app.main:app --reload

# Tests
uv run pytest -v

# Celery worker
uv run celery -A app.workers.celery_app worker --loglevel=info

# Scripts
uv run python scripts/create_admin.py
```

## Développement de Modules

Voir [docs/MODULES.md](../docs/MODULES.md) pour créer vos propres modules ETL/ELT.

Exemple simple:

```python
# app/modules/extractors/my_extractor.py
from app.modules.base import BaseModule, ModuleType
import pandas as pd

class MyExtractor(BaseModule):
    module_type = ModuleType.EXTRACTOR
    module_name = "my_extractor"
    display_name = "My Custom Extractor"

    async def execute(self, context):
        # Votre logique d'extraction
        df = pd.DataFrame(...)
        return df
```

## Troubleshooting

### uv command not found

```bash
# Installer uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Ajouter au PATH (si nécessaire)
export PATH="$HOME/.cargo/bin:$PATH"
```

### Import errors

```bash
# Re-synchroniser les dépendances
uv sync --extra dev
```

### Database connection errors

```bash
# Vérifier que PostgreSQL est démarré
make docker-ps

# Vérifier les variables d'environnement
cat .env | grep DATABASE_URL
```

### Port already in use

```bash
# Trouver le processus
lsof -i :8000

# Tuer le processus
kill -9 <PID>
```

## Documentation

- [Architecture](../ARCHITECTURE.md)
- [API Documentation](../docs/API.md)
- [Module Development](../docs/MODULES.md)
- [Database Schema](../DATABASE_SCHEMA.md)

## Support

- GitHub Issues: https://github.com/votre-organisation/logidata_ai/issues
- Documentation: http://localhost:8000/docs
- Email: dev@logidata.ai

## Licence

MIT
