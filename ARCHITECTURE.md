# Architecture ETL/ELT Builder Platform

## Vue d'ensemble

Plateforme low-code/no-code pour la conception, configuration et exécution de pipelines ETL/ELT avec interface drag & drop et orchestration intelligente par IA.

## Stack Technologique

### Frontend
- **Framework**: React 18+ avec TypeScript
- **Drag & Drop**: React Flow v11
- **UI Components**: Material-UI (MUI) v5
- **State Management**: Zustand + React Query
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Backend
- **API Framework**: FastAPI (Python 3.11+)
- **Orchestration**: Apache Airflow 2.8+
- **Data Processing**: Pandas, PySpark, Polars
- **AI/ML**: scikit-learn, spaCy, OpenAI SDK (optionnel)
- **Async Tasks**: Celery + Redis
- **Testing**: pytest + pytest-asyncio

### Base de Données
- **Configuration & Metadata**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Time Series (Logs)**: TimescaleDB (extension PostgreSQL)

### Storage
- **Object Storage**: MinIO (compatible S3)
- **Data Lake**: Delta Lake format (Parquet)

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **Reverse Proxy**: Traefik ou Nginx
- **Monitoring**: Prometheus + Grafana
- **Logs**: Loki ou ELK Stack (optionnel)

## Architecture des Composants

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Canvas     │  │  Config      │  │  Monitoring  │      │
│  │   Editor     │  │  Panels      │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY                            │
│              (FastAPI + Authentication)                      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Pipeline    │  │  Execution   │  │   AI/ML      │      │
│  │  Manager     │  │  Engine      │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ORCHESTRATION LAYER                         │
│              Apache Airflow (Dynamic DAGs)                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │    MinIO     │      │
│  │  (Metadata)  │  │   (Cache)    │  │  (Storage)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Modules de Pipeline Supportés

### Extracteurs (Sources)
- **Bases de données**: PostgreSQL, MySQL, MongoDB, SQLite
- **APIs**: REST, GraphQL, SOAP
- **Fichiers**: CSV, JSON, XML, Excel, Parquet
- **Cloud**: S3, Google Cloud Storage, Azure Blob
- **Streaming**: Kafka, RabbitMQ

### Transformateurs
- **Nettoyage**: Déduplication, normalisation, validation
- **Agrégation**: Group by, pivot, window functions
- **Jointures**: Inner, left, right, full joins
- **Enrichissement**: API lookup, géocodage
- **ML**: Prédiction, classification, clustering
- **AI**: Analyse de sentiment, extraction d'entités

### Chargeurs (Destinations)
- **Bases de données**: PostgreSQL, MySQL, MongoDB
- **Data Warehouses**: ClickHouse, DuckDB
- **Object Storage**: S3, MinIO
- **Formats**: Parquet, Delta Lake, Iceberg
- **APIs**: REST, webhooks

## Sécurité

### Authentication & Authorization
- **JWT Tokens**: Access + Refresh tokens
- **OAuth 2.0**: Support pour SSO (Google, Microsoft)
- **RBAC**: Rôles (Admin, Developer, Viewer)
- **API Keys**: Pour intégrations externes

### Data Protection (RGPD)
- **Chiffrement**: TLS 1.3 en transit, AES-256 au repos
- **Anonymisation**: Masquage automatique des PII
- **Audit Trail**: Logs de toutes les opérations
- **Data Retention**: Politiques de conservation configurables

## Performance & Scalabilité

### Optimisations
- **Caching**: Redis pour configurations et résultats
- **Lazy Loading**: Chargement progressif des données
- **Pagination**: Limitation des résultats API
- **Compression**: Gzip pour API responses
- **Query Optimization**: Index PostgreSQL, query planning

### Scalabilité Horizontale
- **API**: Stateless, déployable sur multiples instances
- **Airflow**: Workers distribués via Celery
- **Cache**: Redis Cluster
- **Storage**: MinIO en mode distribué

## Monitoring & Observabilité

### Métriques
- **Application**: Temps de réponse, taux d'erreur
- **Pipelines**: Durée d'exécution, volumes traités
- **Infrastructure**: CPU, mémoire, I/O

### Logging
- **Niveaux**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Format**: JSON structuré
- **Agrégation**: Loki ou Elasticsearch

### Alerting
- **Échecs de pipeline**: Notification email/Slack
- **Seuils de performance**: Alertes Prometheus
- **Anomalies**: Détection ML des comportements inhabituels

## Workflow d'Exécution

```
1. User creates pipeline in UI
   ↓
2. Frontend sends pipeline config (JSON) to API
   ↓
3. Backend validates config & stores in PostgreSQL
   ↓
4. Pipeline Manager generates Airflow DAG
   ↓
5. Airflow schedules & executes tasks
   ↓
6. Workers execute extraction, transformation, loading
   ↓
7. Results stored, logs aggregated
   ↓
8. WebSocket pushes real-time updates to UI
   ↓
9. User views results & metrics in dashboard
```

## Format de Configuration Pipeline

```json
{
  "id": "pipeline-uuid",
  "name": "Customer Data Processing",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "node-1",
      "type": "extractor",
      "module": "postgres",
      "config": {
        "connection": "prod-db",
        "query": "SELECT * FROM customers WHERE created_at > :start_date"
      },
      "position": {"x": 100, "y": 100}
    },
    {
      "id": "node-2",
      "type": "transformer",
      "module": "cleaner",
      "config": {
        "remove_duplicates": true,
        "columns": ["email", "phone"]
      },
      "position": {"x": 300, "y": 100}
    },
    {
      "id": "node-3",
      "type": "loader",
      "module": "s3",
      "config": {
        "bucket": "data-lake",
        "format": "parquet",
        "partition_by": ["year", "month"]
      },
      "position": {"x": 500, "y": 100}
    }
  ],
  "edges": [
    {"source": "node-1", "target": "node-2"},
    {"source": "node-2", "target": "node-3"}
  ],
  "schedule": "0 2 * * *",
  "notifications": {
    "on_failure": ["admin@example.com"],
    "on_success": []
  }
}
```

## Roadmap de Développement

### Phase 1: MVP (8-10 semaines)
- ✅ Architecture de base frontend/backend
- ✅ Interface drag & drop avec React Flow
- ✅ 3 extracteurs (PostgreSQL, CSV, API)
- ✅ 2 transformateurs (nettoyage, agrégation)
- ✅ 2 chargeurs (PostgreSQL, S3)
- ✅ Exécution basique avec Airflow
- ✅ Authentication JWT

### Phase 2: Amélioration (6-8 semaines)
- 🔄 Prévisualisation des données
- 🔄 Module IA pour suggestions
- 🔄 Monitoring en temps réel
- 🔄 10+ modules supplémentaires
- 🔄 Tests unitaires & intégration

### Phase 3: Production (4-6 semaines)
- ⏳ Optimisations performance
- ⏳ Documentation complète
- ⏳ CI/CD pipeline
- ⏳ Conformité RGPD
- ⏳ Déploiement production

## Estimations Budget

### Infrastructure Open Source (recommandé)
- **Serveur**: OVH/Hetzner (€50-100/mois)
- **Base de données**: PostgreSQL self-hosted (inclus)
- **Storage**: MinIO self-hosted (inclus)
- **Total**: ~€100/mois

### Cloud Hybride
- **API/Frontend**: Vercel/Netlify (gratuit pour démarrage)
- **Backend**: AWS EC2/Fargate (€150-300/mois)
- **RDS PostgreSQL**: €50-150/mois
- **S3 Storage**: €10-50/mois
- **Total**: €200-500/mois

## Conformité RGPD

### Mesures Techniques
1. **Privacy by Design**: Minimisation des données collectées
2. **Encryption**: Toutes données sensibles chiffrées
3. **Access Control**: RBAC strict avec audit trail
4. **Data Portability**: Export en formats standards
5. **Right to Deletion**: Suppression automatisée
6. **Breach Detection**: Alertes automatiques
7. **Consent Management**: Tracking des consentements
8. **Data Localization**: Stockage EU disponible

## Prochaines Étapes

1. **Validation Architecture**: Review avec stakeholders
2. **Setup Environnement**: Docker Compose local
3. **Backend MVP**: API FastAPI + PostgreSQL
4. **Frontend MVP**: React + React Flow
5. **Intégration Airflow**: Premier pipeline fonctionnel
6. **Tests & Itération**: Feedback utilisateurs
