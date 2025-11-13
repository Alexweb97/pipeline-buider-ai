# 🚀 Quick Start Guide - ETL/ELT Builder

Guide de démarrage rapide en 5 minutes.

**Technologies**: Python 3.14, uv (package manager), Docker, Makefile

## Prérequis

- [x] Docker installé (version 20.10+)
- [x] Docker Compose installé (version 2.0+)
- [x] Python 3.14+ (pour développement local)
- [x] uv (gestionnaire de paquets Python)
- [x] 8 GB RAM minimum
- [x] 10 GB espace disque libre

## Installation en 2 Commandes (avec Makefile)

```bash
# 1. Naviguer vers le projet
cd /home/lexweb/projects/logidata_ai

# 2. Setup complet avec Makefile
make setup-dev

# Ou manuellement:
# ./scripts/setup-dev.sh
```

## Commandes Rapides (Makefile)

```bash
make help        # Voir toutes les commandes
make info        # Info sur le projet
make start       # Démarrer tous les services
make stop        # Arrêter tous les services
make status      # Vérifier le statut
make logs        # Voir les logs
make test        # Lancer les tests
```

## Accès aux Interfaces

Une fois le setup terminé, ouvrez votre navigateur:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Compte créé lors du setup |
| **API Backend** | http://localhost:8000 | - |
| **API Docs** | http://localhost:8000/docs | - |
| **Airflow** | http://localhost:8080 | admin / admin |
| **MinIO** | http://localhost:9001 | minioadmin / minioadmin |

## Vérification

```bash
# Vérifier que tous les services sont UP
cd infrastructure/docker
docker-compose ps

# Vous devriez voir ces services:
# - postgres (healthy)
# - redis (healthy)
# - minio (healthy)
# - backend (running)
# - frontend (running)
# - airflow-webserver (running)
# - airflow-scheduler (running)
# - airflow-worker (running)
# - celery-worker (running)
```

## Premier Pipeline (Test)

### Via l'API

```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=your_password"

# 2. Créer un pipeline
curl -X POST http://localhost:8000/api/v1/pipelines \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pipeline",
    "config": {
      "nodes": [
        {
          "id": "extract-1",
          "type": "extractor",
          "module": "postgres"
        }
      ],
      "edges": []
    }
  }'

# 3. Exécuter le pipeline
curl -X POST http://localhost:8000/api/v1/pipelines/{pipeline_id}/execute \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Commandes Utiles

### Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose stop

# Redémarrer un service
docker-compose restart backend

# Voir les logs
docker-compose logs -f backend

# Voir les logs de tous les services
docker-compose logs -f

# Entrer dans un container
docker-compose exec backend bash

# Supprimer tout (attention, supprime les données!)
docker-compose down -v
```

### Backend

```bash
# Se connecter au container backend
docker-compose exec backend bash

# Créer une migration
alembic revision --autogenerate -m "Description"

# Appliquer les migrations
alembic upgrade head

# Rollback dernière migration
alembic downgrade -1

# Créer un admin
python scripts/create_admin.py

# Tests
pytest -v

# Shell Python interactif
python
>>> from app.db.session import AsyncSessionLocal
>>> from app.db.models.user import User
```

### Base de Données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U etl_user -d etl_builder

# Commandes PostgreSQL utiles
\dt              # Lister les tables
\d users         # Décrire la table users
\du              # Lister les utilisateurs
\l               # Lister les databases
\q               # Quitter

# Requêtes SQL
SELECT * FROM users;
SELECT * FROM pipelines;
```

### Frontend

```bash
# Si développement local (sans Docker)
cd frontend
npm install
npm run dev

# Ouvre http://localhost:3000

# Build production
npm run build

# Tests
npm run test
```

## Troubleshooting

### Port déjà utilisé

```bash
# Trouver quel processus utilise le port 8000
sudo lsof -i :8000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans docker-compose.yml
```

### Services ne démarrent pas

```bash
# Voir les logs détaillés
docker-compose logs

# Redémarrer complètement
docker-compose down
docker-compose up -d

# Reconstruire les images
docker-compose build --no-cache
docker-compose up -d
```

### Base de données corrompue

```bash
# Supprimer et recréer
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend alembic upgrade head
```

### Permission denied sur script

```bash
chmod +x scripts/setup-dev.sh
```

## Développement

### Backend Local (sans Docker)

```bash
cd backend

# Créer environnement virtuel
python3.14 -m venv venv
source venv/bin/activate

# Installer dépendances
pip install -r requirements-dev.txt

# Configurer .env
cp .env.example .env
# Éditer DATABASE_URL, REDIS_URL, etc.

# Lancer serveur dev
uvicorn app.main:app --reload --port 8000
```

### Frontend Local (sans Docker)

```bash
cd frontend

# Installer dépendances
npm install

# Configurer .env
cp .env.example .env

# Lancer serveur dev
npm run dev
```

## Structure des Données

### Créer une connexion

```bash
curl -X POST http://localhost:8000/api/v1/connections \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My PostgreSQL",
    "type": "postgres",
    "config": {
      "host": "localhost",
      "port": 5432,
      "database": "mydb",
      "username": "user",
      "password": "pass"
    }
  }'
```

### Créer un pipeline

```bash
curl -X POST http://localhost:8000/api/v1/pipelines \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Extract Users",
    "description": "Extract users from database",
    "config": {
      "nodes": [
        {
          "id": "node-1",
          "type": "extractor",
          "module": "postgres",
          "config": {
            "connection_id": "CONN_UUID",
            "query": "SELECT * FROM users"
          }
        }
      ],
      "edges": []
    }
  }'
```

## Prochaines Étapes

1. **Lire la documentation**
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture complète
   - [docs/API.md](docs/API.md) - Documentation API
   - [docs/MODULES.md](docs/MODULES.md) - Créer des modules

2. **Développer les modules**
   - Voir [NEXT_STEPS.md](NEXT_STEPS.md) pour la roadmap
   - Commencer par 3 modules de base

3. **Implémenter le frontend**
   - Interface drag & drop avec React Flow
   - Configuration des modules
   - Monitoring des exécutions

## Support

- **Documentation**: Dossier `/docs`
- **API Interactive**: http://localhost:8000/docs
- **Email**: dev@logidata.ai

## Ressources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Flow Docs](https://reactflow.dev/)
- [Airflow Docs](https://airflow.apache.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Vous êtes prêt à développer! 🎉**
