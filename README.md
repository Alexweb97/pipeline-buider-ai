# LogiData AI - Plateforme ETL/ELT Low-Code

**Plateforme low-code/no-code** permettant de concevoir, configurer et exécuter des pipelines ETL/ELT via une interface visuelle moderne, avec orchestration intelligente et monitoring en temps réel.

![LogiData AI Dashboard](screenshots/01-dashboard.png)

---

## 🌟 Fonctionnalités Principales

| **Fonctionnalité**               | **Description**                                                                                     |
|-----------------------------------|-----------------------------------------------------------------------------------------------------|
| **Dashboard Interactif**         | Vue d'ensemble complète avec statistiques en temps réel et KPIs.                                    |
| **Gestion des Pipelines**       | Création, configuration et monitoring de pipelines ETL/ELT avec statuts en direct.                  |
| **Sources de Données Multiples** | Support de PostgreSQL, MySQL, MongoDB, Redis, APIs REST, S3, CSV, JSON, Excel, et plus.            |
| **Transformations Réutilisables**| Bibliothèque de transformations (Filter, Map, Aggregate, Join, Validate, Custom).                  |
| **Planification Avancée**        | Schedules avec fréquences hourly, daily, weekly, monthly et expressions cron personnalisées.       |
| **Analytics & Monitoring**       | Tableaux de bord analytiques avec métriques de performance et analyse des erreurs.                  |
| **Upload de Fichiers**           | Interface drag & drop pour importer des fichiers CSV, JSON, Excel, Parquet avec tracking.          |
| **Authentication & Security**    | JWT authentication, RBAC, et sécurité des données.                                                  |

---

## 📸 Captures d'Écran

### Dashboard Principal
![Dashboard](screenshots/01-dashboard.png)
*Vue d'ensemble avec statistiques clés, actions rapides et guide de démarrage*

### Gestion des Pipelines
![Pipelines](screenshots/02-pipeline.png)
*Création et monitoring des pipelines avec statuts en temps réel*

### Sources de Données
![Data Sources](screenshots/03-data-sources.png)
*Connexion et gestion de multiples types de sources de données*

### Transformations
![Transformations](screenshots/04-transformations.png)
*Bibliothèque de transformations réutilisables avec filtrage et catégorisation*

### Planifications
![Schedules](screenshots/05-schedules.png)
*Configuration de schedules avec différentes fréquences et monitoring des exécutions*

### Analytics
![Analytics](screenshots/06-analytics.png)
*Tableaux de bord analytiques avec métriques de performance et analyse des erreurs*

### Uploads
![Uploads](screenshots/07-uploads.png)
*Interface de téléchargement de fichiers avec tracking de progression*

---

## 🛠 Stack Technologique

### **Frontend**
- **Framework** : [React 18+](https://reactjs.org/) avec [TypeScript](https://www.typescriptlang.org/)
- **UI Library** : [Material-UI (MUI) v5](https://mui.com/)
- **State Management** : [Zustand](https://github.com/pmndrs/zustand)
- **Routing** : [React Router v6](https://reactrouter.com/)
- **Data Fetching** : [TanStack Query](https://tanstack.com/query)
- **Build Tool** : [Vite](https://vitejs.dev/)

### **Backend**
- **Framework** : [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14)
- **Base de Données** : [PostgreSQL 15+](https://www.postgresql.org/)
- **Authentication** : JWT avec bcrypt
- **Rate Limiting** : SlowAPI
- **CORS** : FastAPI CORS middleware
- **Validation** : Pydantic v2

### **Infrastructure**
- **Conteneurisation** : [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Reverse Proxy** : [Nginx](https://www.nginx.com/)
- **Base de données** : PostgreSQL avec migrations Alembic

---

## 🚀 Installation Rapide

### **Prérequis**
- Docker & Docker Compose
- Node.js 18+ (pour le développement frontend)
- Python 3.14 (pour le développement backend)
- Git

### **1. Cloner le Projet**
```bash
git clone https://github.com/Alexweb97/logidata_ai.git
cd logidata_ai
```

### **2. Configuration**
```bash
# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Éditer les variables d'environnement
nano backend/.env  # Configurer DB, JWT secret, etc.
```

### **3. Démarrer avec Docker Compose**
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### **4. Initialiser la Base de Données**
```bash
# Exécuter les migrations
docker-compose exec backend alembic upgrade head

# Créer un utilisateur admin (optionnel)
docker-compose exec backend python scripts/create_admin.py
```

### **5. Accéder à l'Application**

**Mode Développement:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

**Mode Production (via Nginx):**
- **Application**: http://localhost (port 80)
- **API**: http://localhost/api

**Identifiants par défaut:**
- Username: `admin`
- Password: `admin123`

---

## 💻 Développement Local

### **Backend**

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur de développement
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tests
pytest -v --cov=app tests/
```

### **Frontend**

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build production
npm run build

# Preview du build
npm run preview

# Tests
npm run test
```

---

## 📁 Structure du Projet

```
logidata_ai/
├── backend/                    # API Backend FastAPI
│   ├── app/
│   │   ├── api/               # Endpoints API
│   │   │   └── v1/
│   │   │       ├── auth.py    # Authentication endpoints
│   │   │       ├── users.py   # User management
│   │   │       └── ...
│   │   ├── core/              # Configuration & security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── main.py            # Application entry point
│   ├── tests/                 # Tests unitaires & intégration
│   ├── alembic/               # Database migrations
│   └── requirements.txt
│
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PipelinesPage.tsx
│   │   │   ├── DataSourcesPage.tsx
│   │   │   ├── TransformationsPage.tsx
│   │   │   ├── SchedulesPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── UploadsPage.tsx
│   │   ├── types/             # Types TypeScript
│   │   ├── stores/            # State management (Zustand)
│   │   ├── api/               # API client
│   │   └── App.tsx
│   └── package.json
│
├── screenshots/               # Captures d'écran pour README
├── docker-compose.yml         # Orchestration Docker
├── nginx.conf                 # Configuration Nginx
└── README.md
```

---

## 🎯 Fonctionnalités Détaillées

### **1. Dashboard**
- **Vue d'ensemble** avec statistiques clés (Pipelines, Data Sources, Jobs, Success Rate)
- **Quick Actions** pour créer rapidement des pipelines et sources
- **Recent Activity** pour suivre l'activité récente
- **Getting Started Guide** pour les nouveaux utilisateurs

### **2. Pipelines**
- **Création** de pipelines ETL/ELT/Streaming
- **Monitoring** en temps réel des statuts (Active, Paused, Failed, Completed)
- **Métriques** : Total runs, success rate, dernière exécution
- **Actions** : Run, Edit, Duplicate, Pause, Delete

### **3. Data Sources**
- **Support de 9+ types** : PostgreSQL, MySQL, MongoDB, Redis, REST API, S3, CSV, JSON, Kafka
- **Test de connexion** pour vérifier la validité
- **Statuts** : Connected, Disconnected, Error, Testing
- **Gestion des credentials** sécurisée

### **4. Transformations**
- **10 types** : Filter, Map, Aggregate, Join, Sort, Deduplicate, Pivot, Unpivot, Validate, Custom
- **Catégories** : Data Quality, Data Shaping, Data Enrichment, Custom
- **Réutilisabilité** : Bibliothèque de transformations partagées
- **Tags & Search** pour une navigation facile

### **5. Schedules**
- **6 fréquences** : Once, Hourly, Daily, Weekly, Monthly, Custom (Cron)
- **Upcoming Runs** : Visualisation des 5 prochaines exécutions
- **Statistiques** : Total runs, successful runs, failed runs, success rate
- **Configuration** : Retries, timeout, notifications

### **6. Analytics**
- **KPIs** avec tendances : Total Runs, Success Rate, Avg Execution Time, Data Processed
- **Performance par pipeline** avec statuts (Healthy, Warning, Critical)
- **Analyse des erreurs** par type avec distribution
- **Sélecteur de période** : 24h, 7d, 30d, 90d, All

### **7. Uploads**
- **Drag & Drop** interface pour les fichiers
- **Support formats** : CSV, JSON, Excel (XLSX), XML, Parquet
- **Tracking** : Progress bars en temps réel
- **Statuts** : Pending, Uploading, Processing, Completed, Failed
- **Statistiques** : Total data uploaded, rows processed

---

## 🔒 Sécurité

- **Authentication JWT** avec tokens d'accès et de rafraîchissement
- **Hachage de mots de passe** avec bcrypt
- **Rate limiting** pour prévenir les abus
- **CORS** configuré pour la sécurité
- **Validation des entrées** avec Pydantic
- **Protected routes** côté frontend

---

## 📊 Pages Disponibles

| Page | Route | Description | Statut |
|------|-------|-------------|--------|
| Dashboard | `/dashboard` | Vue d'ensemble et statistiques | ✅ |
| Pipelines | `/pipelines` | Gestion des pipelines | ✅ |
| Data Sources | `/sources` | Sources de données | ✅ |
| Transformations | `/transformations` | Bibliothèque de transformations | ✅ |
| Schedules | `/schedules` | Planifications | ✅ |
| Analytics | `/analytics` | Analytics & monitoring | ✅ |
| Uploads | `/uploads` | Upload de fichiers | ✅ |
| Login | `/login` | Authentification | ✅ |
| Register | `/register` | Inscription | ✅ |

---

## 🧪 Tests

### **Backend**
```bash
cd backend

# Tests unitaires
pytest tests/unit/ -v

# Tests d'intégration
pytest tests/integration/ -v

# Tous les tests avec coverage
pytest --cov=app --cov-report=html tests/
```

### **Frontend**
```bash
cd frontend

# Tests unitaires
npm run test

# Coverage
npm run test:coverage
```

---

## 🚢 Déploiement

### **Docker Compose (Recommandé)**

```bash
# Production
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les services
docker-compose ps
```

### **Variables d'Environnement**

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@postgres:5432/logidata_ai
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
```

---

## 📖 Documentation API

L'API est documentée automatiquement avec Swagger UI et ReDoc :

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### **Endpoints Principaux**

```
POST   /api/v1/auth/register        # Inscription
POST   /api/v1/auth/login           # Connexion
POST   /api/v1/auth/refresh         # Rafraîchir token
GET    /api/v1/auth/me              # Profil utilisateur
GET    /api/v1/users/               # Liste des utilisateurs
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### **Workflow**

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: add amazing feature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### **Standards de Code**

- **Backend**: Black, isort, flake8, mypy
- **Frontend**: ESLint, Prettier, TypeScript strict
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Tests**: Coverage > 80%

---

## 🗺 Roadmap

### **Phase 1: MVP** ✅
- ✅ Architecture frontend/backend complète
- ✅ Authentication & Authorization (JWT)
- ✅ Dashboard avec 7 pages fonctionnelles
- ✅ Types TypeScript complets
- ✅ Mock data pour démonstration
- ✅ Design Material-UI moderne

### **Phase 2: Backend Integration** 🔄
- ⏳ Endpoints API pour tous les modules
- ⏳ Base de données PostgreSQL complète
- ⏳ Intégration des données réelles
- ⏳ CRUD complet pour toutes les entités

### **Phase 3: Advanced Features** 📋
- ⏳ Interface drag & drop pour pipelines
- ⏳ Exécution réelle des pipelines
- ⏳ Monitoring en temps réel avec WebSocket
- ⏳ Notifications et alertes

### **Phase 4: AI & Optimization** 🚀
- ⏳ Suggestions IA pour transformations
- ⏳ Auto-optimisation des pipelines
- ⏳ Détection d'anomalies
- ⏳ Prédiction de performances

---

## 📝 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

---

## 👤 Auteur

**Alexandre (Alexweb97)**
- GitHub: [@Alexweb97](https://github.com/Alexweb97)
- Email: alexandretoto.dev@gmail.com

---

## 🙏 Remerciements

### **Technologies Utilisées**
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material-UI](https://mui.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Alexweb97/logidata_ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Alexweb97/logidata_ai/discussions)
- **Email**: alexandretoto.dev@gmail.com

---

**Note**: Ce projet est en développement actif. Les fonctionnalités et l'API peuvent évoluer.

