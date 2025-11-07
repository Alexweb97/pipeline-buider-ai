# 📝 Commandes Utiles - ETL/ELT Builder

Référence rapide des commandes les plus utilisées.

**Technologies**: Python 3.14, uv (package manager), Makefile

## 🎯 Commandes Makefile (Recommandé!)

Le projet inclut un **Makefile** complet avec 60+ commandes pour simplifier votre workflow.

```bash
# Afficher toutes les commandes disponibles
make help

# Info sur le projet et services
make info

# Voir la version des outils
make version
```

## 🚀 Setup & Installation

### Setup Complet Automatique

```bash
# Setup development environment complet (Docker + DB + migrations)
make setup-dev

# Ou étape par étape:
make setup           # Copie .env + installe dépendances
make docker-up       # Démarre Docker
make migrate         # Lance migrations
make create-admin    # Crée admin
```

### Installation Dépendances

```bash
# Backend (avec uv)
make install          # Production dependencies
make install-dev      # + Dev dependencies

# Frontend
make install-frontend # npm install

# Tout installer
make setup           # Backend + Frontend
```

### Installation Manuelle (sans Docker)

```bash
# Backend avec uv
cd backend
uv sync                    # Install dependencies
uv sync --extra dev        # With dev dependencies
uv add package-name        # Add new package
uv remove package-name     # Remove package
uv lock                    # Update uv.lock
uv pip list                # List installed packages

# Frontend
cd frontend
npm install
```

## 🐳 Docker

### Gestion des Containers

```bash
# Start/Stop
make start               # = make docker-up (démarrer tout)
make stop                # = make docker-down (arrêter tout)
make restart             # Redémarrer tout
make rebuild             # Rebuild + restart

# Status & Logs
make status              # Status + health check
make docker-ps           # Liste des containers
make logs                # Logs de tous les services
make logs-backend        # Logs backend uniquement
make logs-frontend       # Logs frontend uniquement
make logs-errors         # Uniquement les erreurs

# Build
make docker-build        # Build toutes les images
make docker-build-backend   # Build backend
make docker-build-frontend  # Build frontend

# Nettoyage
make docker-clean        # ⚠️ Supprime TOUT (containers, volumes, images)
make fresh-start         # ⚠️ Clean complet + setup-dev
```

### Shell Access

```bash
make backend-shell       # Accès container backend
make db-shell            # PostgreSQL shell
make redis-shell         # Redis CLI
make airflow-shell       # Airflow shell
```

## 🐍 Backend (Python 3.14 + uv)

### Développement Local

```bash
# Avec Makefile
make dev-backend         # Uvicorn avec reload
make dev-worker          # Celery worker

# Manuel
cd backend
uv run uvicorn app.main:app --reload
uv run celery -A app.workers.celery_app worker --loglevel=info
```

### Gestion des Dépendances (uv)

```bash
# Ajouter une dépendance
cd backend
uv add fastapi           # Production
uv add --dev pytest      # Dev only

# Supprimer
uv remove package-name

# Mettre à jour
uv lock                  # Update lock file
uv sync                  # Sync with lock file

# Lister
uv pip list
uv pip show package-name

# Exporter (si besoin de requirements.txt)
uv pip freeze > requirements.txt
```

## 🗄️ Base de Données

### Migrations (Alembic)

```bash
# Avec Makefile
make migrate                          # Upgrade to head
make migrate-create MESSAGE="add users table"  # Nouvelle migration
make migrate-upgrade                  # +1 version
make migrate-downgrade                # -1 version
make migrate-history                  # Historique
make migrate-current                  # Version actuelle

# Manuel (dans container)
make backend-shell
alembic upgrade head
alembic revision --autogenerate -m "description"
alembic downgrade -1
alembic history
```

### Gestion

```bash
# Admin & données
make create-admin        # Créer admin (interactif)
make seed-data           # Données de test

# Shell PostgreSQL
make db-shell            # Puis:
\dt                      # Lister tables
\d users                 # Décrire table
\du                      # Lister users
SELECT * FROM users;     # Query
\q                       # Quitter
```

### Backup & Restore

```bash
# Backup
make backup-db           # Crée backups/backup_YYYYMMDD_HHMMSS.sql

# Restore
make restore-db FILE=backups/backup_20250107_100000.sql

# Reset complet
make db-reset            # ⚠️ Drop + recreate + migrate
```

## 🧪 Tests

### Backend Tests

```bash
# Avec Makefile
make test                # Tous les tests
make test-unit           # Tests unitaires
make test-integration    # Tests intégration
make test-e2e            # Tests E2E
make test-coverage       # Coverage HTML

# Manuel
cd backend
uv run pytest -v
uv run pytest tests/unit/ -v
uv run pytest --cov=app --cov-report=html
uv run pytest -k "test_user" -v
```

### Frontend Tests

```bash
make test-frontend
make test-frontend-coverage

# Ou:
cd frontend
npm run test
npm run test:coverage
```

## ✨ Code Quality

### Format & Lint

```bash
# Tout en un
make check-all           # Format + Lint + Type + Tests

# Individuellement
make format              # Black + isort
make format-check        # Check only (no changes)
make lint                # Ruff + flake8
make lint-fix            # Auto-fix avec Ruff
make type-check          # MyPy

# Manuel
cd backend
uv run black app/ tests/
uv run isort app/ tests/
uv run ruff check app/ tests/
uv run ruff check --fix app/
uv run mypy app/
```

## 📊 Monitoring

### Health Checks

```bash
make health              # Status complet de tous les services
make stats               # Docker container stats

# Endpoints directs
curl http://localhost:8000/health        # Backend
curl http://localhost:8000/docs          # API docs
curl http://localhost:3000               # Frontend
curl http://localhost:8080/health        # Airflow
```

### Logs

```bash
make logs                # Tous les services
make logs-backend        # Backend
make logs-frontend       # Frontend
make logs-airflow        # Airflow
make logs-errors         # Uniquement erreurs
```

## 🌊 Apache Airflow

```bash
# DAGs
make airflow-dags-list                      # Liste DAGs
make airflow-dags-trigger DAG=my_dag        # Trigger DAG
make airflow-tasks-list DAG=my_dag          # Liste tasks

# UI: http://localhost:8080 (admin/admin)

# Manuel
make airflow-shell
airflow dags list
airflow dags trigger my_dag
```

## 💡 Workflows Courants

### Démarrer un nouveau jour

```bash
make start               # Démarrer services
make logs-backend        # Vérifier logs
make health              # Vérifier santé
```

### Développement backend

```bash
# Option 1: Dans Docker
make docker-restart-backend
make logs-backend

# Option 2: Local
make dev-backend
```

### Nouvelle fonctionnalité

```bash
# 1. Créer branche
git checkout -b feature/my-feature

# 2. Développer
make dev-backend         # Terminal 1
make dev-frontend        # Terminal 2

# 3. Tests & Quality
make check-all

# 4. Commit
git add .
git commit -m "feat: add my feature"
```

### Nouvelle table DB

```bash
# 1. Modifier models
# Éditer backend/app/db/models/*.py

# 2. Créer migration
make migrate-create MESSAGE="add my_table"

# 3. Appliquer
make migrate

# 4. Vérifier
make db-shell
\dt
```

### Reset complet

```bash
make docker-clean        # Tout supprimer
make setup-dev           # Réinstaller
```

## 🎯 Raccourcis Bash (Optionnel)

Ajouter à ~/.bashrc ou ~/.zshrc:

```bash
alias m='make'
alias mhelp='make help'
alias mstart='make start'
alias mstop='make stop'
alias mlogs='make logs-backend'
alias mtest='make test'
alias mshell='make backend-shell'

# Utilisation:
m start
mlogs
mtest
```

---

**Pro Tip**: Utilisez `make help` pour voir toutes les 60+ commandes disponibles! 🚀
