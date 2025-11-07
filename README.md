# ETL/ELT Builder - Plateforme Modulaire de Pipelines de Données

**Plateforme low-code/no-code** permettant de concevoir, configurer et exécuter des pipelines ETL/ELT via une interface visuelle **drag & drop**, avec orchestration intelligente et intégration IA.

![ETL/ELT Builder Demo](https://via.placeholder.com/800x400?text=ETL%2FELT+Builder+Demo) *(Remplace par une capture d'écran ou un GIF de ton application)*

---

## 🌟 Caractéristiques Principales

| **Fonctionnalité**               | **Description**                                                                                     |
|-----------------------------------|-----------------------------------------------------------------------------------------------------|
| **Interface Drag & Drop**         | Canvas interactif inspiré de **n8n** et **Databricks** pour une conception intuitive.               |
| **Modules Extensibles**          | Extracteurs, transformateurs et chargeurs pour diverses sources (SQL, APIs, fichiers, etc.).       |
| **Orchestration Intelligente**   | Moteur basé sur **Apache Airflow** pour planifier et exécuter les pipelines.                         |
| **IA Intégrée**                  | Suggestions automatiques de transformations et optimisations.                                      |
| **Prévisualisation en Temps Réel** | Visualisation des données à chaque étape du pipeline.                                             |
| **Monitoring Avancé**            | Logs, métriques et alertes en temps réel avec **Prometheus & Grafana**.                            |
| **Conformité RGPD**              | Chiffrement, anonymisation et audit trail pour les données sensibles.                               |

---

## 🛠 Stack Technologique

### **Frontend**
- **Framework** : [React 18+](https://reactjs.org/) avec [TypeScript](https://www.typescriptlang.org/)
- **Drag & Drop** : [React Flow](https://reactflow.dev/)
- **UI** : [Material-UI (MUI)](https://mui.com/)
- **State Management** : [Zustand](https://github.com/pmndrs/zustand)
- **Build Tool** : [Vite](https://vitejs.dev/)

### **Backend**
- **Framework** : [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14)
- **Base de Données** : [PostgreSQL 15+](https://www.postgresql.org/) avec [TimescaleDB](https://www.timescale.com/)
- **Orchestration** : [Apache Airflow](https://airflow.apache.org/)
- **Cache** : [Redis](https://redis.io/)
- **Stockage** : [MinIO](https://min.io/)

### **Infrastructure**
- **Conteneurisation** : [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Reverse Proxy** : [Nginx](https://www.nginx.com/)
- **Monitoring** : [Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/)

---

## 🚀 Installation Rapide

### **Prérequis**
- Docker & Docker Compose
- Node.js 18+ (pour le développement frontend)
- Python 3.14 (pour le développement backend)
- Git

### **1. Cloner le Projet**
```bash
git clone https://github.com/Alexweb97/pipeline-builder-ai.git
cd pipeline-builder-ai


### 1. Cloner le Projet

```bash
git clone https://github.com/Alexweb97/pipeline-buider-ai.git
cd pipeline-builder-ai
```

### 2. Configuration

```bash
# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Éditer les variables d'environnement
nano backend/.env  # Configurer DB, Redis, etc.
```

### 3. Démarrer avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### 4. Initialiser la Base de Données

```bash
# Exécuter les migrations
docker-compose exec backend alembic upgrade head

# Créer un utilisateur admin
docker-compose exec backend python scripts/create_admin.py
```

### 5. Accéder à l'Application (developpement)

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Airflow**: http://localhost:8080 (user: admin, password: admin)
- **MinIO**: http://localhost:9001 (user: minioadmin, password: minioadmin)

## Développement Local

### Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements-dev.txt

# Lancer le serveur de développement
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Lancer Celery worker
celery -A app.workers.celery_app worker --loglevel=info

# Tests
pytest -v --cov=app tests/
```

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build production
npm run build

# Tests
npm run test
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│  React + TypeScript + React Flow + Material-UI              │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY                            │
│              FastAPI + Authentication + CORS                 │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                         │
│  Pipeline Manager | Execution Engine | AI/ML Service        │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ORCHESTRATION LAYER                         │
│              Apache Airflow (Dynamic DAGs)                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  PostgreSQL (Metadata) | Redis (Cache) | MinIO (Storage)    │
└─────────────────────────────────────────────────────────────┘
```

Pour plus de détails, consultez [ARCHITECTURE.md](./ARCHITECTURE.md).

## Créer votre Premier Pipeline

### Via l'Interface Web

1. Connectez-vous à http://localhost:3000
2. Cliquez sur "Nouveau Pipeline"
3. Glissez-déposez des modules depuis la palette:
   - **Extracteur PostgreSQL**: Connectez-vous à votre base de données
   - **Nettoyeur**: Supprimez les doublons et validez les données
   - **Chargeur S3**: Sauvegardez dans un bucket S3/MinIO
4. Connectez les modules avec des flèches
5. Configurez chaque module via le panneau latéral
6. Cliquez sur "Exécuter" pour lancer le pipeline

### Via l'API

```bash
curl -X POST http://localhost:8000/api/v1/pipelines \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Data Export",
    "nodes": [
      {
        "id": "extract-1",
        "type": "extractor",
        "module": "postgres",
        "config": {
          "connection_id": "conn-uuid",
          "query": "SELECT * FROM customers"
        }
      },
      {
        "id": "load-1",
        "type": "loader",
        "module": "s3",
        "config": {
          "bucket": "data-lake",
          "format": "parquet"
        }
      }
    ],
    "edges": [
      {"source": "extract-1", "target": "load-1"}
    ]
  }'
```

## Modules Disponibles

### Extracteurs (Sources)
- PostgreSQL, MySQL, MongoDB, SQLite
- REST API, GraphQL
- CSV, JSON, Excel, Parquet
- S3, Google Cloud Storage, Azure Blob
- Kafka, RabbitMQ

### Transformateurs
- **Cleaner**: Déduplication, normalisation, validation
- **Aggregator**: Group by, pivot, window functions
- **Joiner**: Jointures de datasets
- **Filter**: Filtrage avec conditions
- **Enricher**: Enrichissement via APIs
- **ML Transformer**: Prédictions, classification

### Chargeurs (Destinations)
- PostgreSQL, MySQL, MongoDB
- ClickHouse, DuckDB
- S3, MinIO
- Parquet, Delta Lake, Iceberg

Pour développer vos propres modules, consultez [docs/MODULES.md](./docs/MODULES.md).

## Tests

### Backend
```bash
cd backend

# Tests unitaires
pytest tests/unit/ -v

# Tests d'intégration
pytest tests/integration/ -v

# Tests E2E
pytest tests/e2e/ -v

# Tous les tests avec coverage
pytest --cov=app --cov-report=html tests/
```

### Frontend
```bash
cd frontend

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## Déploiement

### Docker Compose (Recommandé pour commencer)

```bash
# Production
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# Staging
docker-compose -f infrastructure/docker/docker-compose.staging.yml up -d
```

### Kubernetes

```bash
cd infrastructure/kubernetes

# Créer le namespace
kubectl apply -f namespace.yaml

# Déployer les services
kubectl apply -f .

# Vérifier le déploiement
kubectl get pods -n etl-builder
```

Pour plus de détails, consultez [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Documentation

- [Architecture](./ARCHITECTURE.md) - Vue d'ensemble de l'architecture
- [Database Schema](./DATABASE_SCHEMA.md) - Schéma de base de données
- [Project Structure](./PROJECT_STRUCTURE.md) - Structure du projet
- [API Documentation](./docs/API.md) - Documentation de l'API REST
- [Module Development](./docs/MODULES.md) - Créer des modules personnalisés


### Workflow

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: add amazing feature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de Code

- **Backend**: Black, isort, flake8, mypy
- **Frontend**: ESLint, Prettier
- **Commits**: Conventional Commits
- **Tests**: Coverage > 80%

## Support

- **Issues**: [GitHub Issues](https://github.com/Alexweb97/pipeline-buider-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Alexweb97/pipeline-buider-ai/discussions)
- **Email**: alexandretoto.dev@gmail.com

## Roadmap

### Phase 1: MVP (Q1 2025)
- ✅ Architecture de base
- ✅ Interface drag & drop
- ✅ Modules de base (extracteurs, transformateurs, chargeurs)
- 🔄 Exécution avec Airflow
- 🔄 Authentication & RBAC

### Phase 2: Amélioration (Q2 2025)
- ⏳ Prévisualisation des données
- ⏳ Suggestions IA
- ⏳ Monitoring avancé
- ⏳ 20+ modules

### Phase 3: Production (Q3 2025)
- ⏳ Optimisations performance
- ⏳ Conformité RGPD complète
- ⏳ Documentation complète
- ⏳ CI/CD production

## Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

## Crédits

Développé avec ❤️ par Alexweb97.

### Technologies Utilisées

- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Apache Airflow](https://airflow.apache.org/)
- [React Flow](https://reactflow.dev/)
- [Material-UI](https://mui.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [MinIO](https://min.io/)

---

**Note**: Ce projet est en développement actif. Les fonctionnalités et l'API peuvent changer.
