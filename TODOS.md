# 📋 LogiData AI - TODO List

> **Dernière mise à jour :** 2025-11-14
> **Status du projet :** En développement actif

---

## 🎯 Vision du Projet

Plateforme ETL/ELT no-code/low-code avec assistance IA pour data engineers et développeurs Python.

**Objectifs clés :**
- ✅ Pipeline builder visuel avec React Flow
- 🚧 Transformations flexibles (Python/SQL)
- 📅 Assistance IA pour génération de code
- 📅 Exécution distribuée avec Airflow/Celery

---

## 🏆 Priorités Actuelles

### ⚡ P0 - Critique (Cette semaine)
- [x] ~~**Module Python Transform**~~ - ✅ **TERMINÉ** (PR: #XX - branche: `feat/python-sql-transform`)
- [x] ~~**Module SQL Transform**~~ - ✅ **TERMINÉ** (PR: #XX - branche: `feat/python-sql-transform`)
- [x] ~~**Système de prévisualisation**~~ - ✅ **TERMINÉ** (PR: #XX - branche: `feat/python-sql-transform`)

### 🔥 P1 - Important (2 semaines)
- [ ] **Implémentation des extractors** - CSV, Excel, JSON, Parquet avec file_id
- [ ] **Bibliothèque de snippets** - Templates Python/SQL réutilisables
- [ ] **Testing & validation** - Tests automatiques des transformations

### 📌 P2 - Nice to have (1 mois)
- [ ] **Page de gestion des fichiers** - Interface pour gérer les uploads
- [ ] **Templates de pipelines** - Bibliothèque de pipelines pré-configurés
- [ ] **Métriques d'exécution** - Monitoring et analytics

---

## 📦 Modules & Fonctionnalités

### ✅ Complété

#### 🎨 Frontend
- [x] Pipeline Builder avec React Flow
- [x] Drag & Drop de modules
- [x] Configuration panel pour nodes
- [x] Connexion visuelle entre modules
- [x] File Upload Field component
- [x] Monaco Editor intégré
- [x] Module mapper (JSON Schema → UI)

#### 🔧 Backend
- [x] API REST FastAPI
- [x] Authentication JWT
- [x] Base de données PostgreSQL
- [x] Modèles : User, Pipeline, Module, Connection, Execution
- [x] Système d'upload de fichiers
- [x] Migration Alembic pour uploaded_files
- [x] 44 modules définis (extractors, transformers, loaders)

#### 📁 Upload System
- [x] Backend upload API (/api/v1/uploads)
- [x] Table uploaded_files avec soft delete
- [x] Frontend FileUploadField component
- [x] Intégration dans module configuration
- [x] Modules fichiers (CSV, Excel, JSON, Parquet) avec format file-upload

---

### ✅ Complété Récemment

#### 🔄 Transformations Custom
**Status :** ✅ **TERMINÉ** - PR créée
**Branche :** `feat/python-sql-transform`
**PR :** À créer sur GitHub (https://github.com/Alexweb97/pipeline-buider-ai/compare/main...feat/python-sql-transform)
**Priorité :** P0
**Échéance :** 17/11/2025
**Assigné :** Claude Code
**Terminé le :** 2025-11-14 16:30

**Tâches :**
- [x] **Backend** ✅ **TERMINÉ**
  - [x] Créer `PythonTransformer` avec sandbox RestrictedPython
  - [x] Créer `SQLTransformer` avec DuckDB
  - [x] API endpoint `/api/v1/transforms/preview` pour test en temps réel
  - [x] Validation et sécurité du code exécuté
  - [x] Gestion des timeouts et erreurs

- [x] **Frontend** ✅ **TERMINÉ**
  - [x] Component `CodeEditorField` avec Monaco Editor
  - [x] Component `DataPreview` pour afficher résultats
  - [x] Bibliothèque de snippets (20+ Python + 10+ SQL)
  - [ ] Intégration dans NodeConfigPanel (À FAIRE)
  - [ ] Tabs : Code / Preview / Snippets (À FAIRE)

- [x] **Modules** ✅ **TERMINÉ**
  - [x] Module "Python Transform" dans modules_definitions
  - [x] Module "SQL Transform" dans modules_definitions
  - [x] Définir config_schema pour les deux modules

**Fichiers créés :** ✅
```
backend/
  app/modules/transformers/
    python_transform.py          # ✅ CRÉÉ
    sql_transform.py             # ✅ CRÉÉ
  app/core/
    code_executor.py             # ✅ CRÉÉ - Sandbox sécurisé
  app/api/v1/
    transforms.py                # ✅ CRÉÉ - Preview endpoint
  app/data/
    modules_definitions.py       # ✅ MODIFIÉ - Ajout 2 modules

frontend/
  src/components/
    CodeEditorField.tsx          # ✅ CRÉÉ
    DataPreview.tsx              # ✅ CRÉÉ
  src/utils/
    codeTemplates.ts             # ✅ CRÉÉ - 30+ snippets
```

**Dépendances :**
- `RestrictedPython` pour sandbox Python
- `DuckDB` pour exécution SQL
- `@monaco-editor/react` (déjà installé)

---

### 📅 À venir

#### 🤖 Assistance IA
**Status :** Planifié
**Priorité :** P2
**Échéance :** Décembre 2025

**Objectifs :**
- Génération de code de transformation depuis description naturelle
- Suggestions d'optimisation de pipelines
- Détection d'anomalies dans les données
- Explication de code complexe

**Tâches :**
- [ ] **Infrastructure**
  - [ ] Intégration API LLM (Claude/GPT)
  - [ ] Endpoint `/api/v1/ai/suggest-transform`
  - [ ] Endpoint `/api/v1/ai/explain-code`
  - [ ] Endpoint `/api/v1/ai/optimize-pipeline`
  - [ ] Système de contexte enrichi (schema, stats, historique)

- [ ] **Frontend**
  - [ ] AI Assistant panel dans code editor
  - [ ] Chat interface pour questions
  - [ ] Bouton "Generate from description"
  - [ ] Affichage des suggestions avec accept/reject
  - [ ] Feedback loop pour améliorer suggestions

- [ ] **Prompt Engineering**
  - [ ] Templates de prompts pour transformations courantes
  - [ ] Contexte automatique (schema input, exemples)
  - [ ] Fine-tuning sur patterns métier

**Dépendances :**
- API Claude/OpenAI
- Base de connaissances (patterns, exemples)

---

#### 📊 Implémentation des Extractors
**Status :** Planifié
**Priorité :** P1
**Échéance :** 20/11/2025

**Modules à implémenter :**

- [ ] **CSV Extractor** (`backend/app/modules/extractors/csv.py`)
  - Lire fichier via file_id
  - Support délimiteur, encoding, skip_rows
  - Gestion des valeurs null
  - Détection automatique du schéma

- [ ] **Excel Extractor** (`backend/app/modules/extractors/excel.py`)
  - Support .xlsx et .xls
  - Sélection de feuille (nom ou index)
  - Support plages de colonnes
  - Skip rows et header detection

- [ ] **JSON Extractor** (`backend/app/modules/extractors/json.py`)
  - Support JSON lines et JSON array
  - JSON Path pour nested objects
  - Normalisation de structures nested
  - Multiple orientations (records, index, etc.)

- [ ] **Parquet Extractor** (`backend/app/modules/extractors/parquet.py`)
  - Lecture columnar efficace
  - Filtrage de colonnes
  - Push-down predicates
  - Support PyArrow et fastparquet

**Tâches communes :**
- [ ] Résolution file_id → file_path via UploadedFile model
- [ ] Gestion des fichiers manquants/supprimés
- [ ] Validation du format de fichier
- [ ] Conversion en pandas DataFrame standardisé
- [ ] Tests unitaires pour chaque extractor

---

#### 🗂️ Page de Gestion des Fichiers
**Status :** Planifié
**Priorité :** P2
**Échéance :** 25/11/2025

**Fonctionnalités :**
- [ ] Liste de tous les fichiers uploadés
- [ ] Recherche et filtres (type, date, utilisateur)
- [ ] Prévisualisation des données (10 premières lignes)
- [ ] Téléchargement de fichiers
- [ ] Suppression (soft delete)
- [ ] Statistiques (taille, nombre de lignes, colonnes)
- [ ] Indicateur d'utilisation (dans quels pipelines)

**Route :** `/files`

**Fichiers :**
```
frontend/src/pages/
  Files.tsx                      # NEW - Page principale

frontend/src/components/
  FilesList.tsx                  # NEW - Liste avec tableau
  FilePreviewModal.tsx           # NEW - Modal de preview
  FileUploadZone.tsx             # NEW - Zone drag & drop
```

---

#### 📚 Bibliothèque de Snippets
**Status :** Planifié
**Priorité :** P1
**Échéance :** 22/11/2025

**Catégories de snippets :**

**Python :**
- [ ] Date & Time (parsing, formatting, extraction)
- [ ] Text Processing (cleaning, normalization, extraction)
- [ ] Numeric (calculations, binning, scaling)
- [ ] Aggregation (groupby, pivot, window functions)
- [ ] Joining & Merging
- [ ] Missing Data (detection, imputation)
- [ ] Validation (regex, ranges, custom rules)

**SQL :**
- [ ] Window Functions
- [ ] CTEs (Common Table Expressions)
- [ ] Aggregations
- [ ] Joins (inner, left, right, full)
- [ ] Date Functions
- [ ] String Manipulation

**Tâches :**
- [ ] Définir structure Snippet (id, name, code, description, tags)
- [ ] Créer 30-40 snippets Python
- [ ] Créer 20-30 snippets SQL
- [ ] UI de recherche et filtrage
- [ ] Sauvegarde de snippets custom utilisateur
- [ ] Export/Import de snippets

---

#### 🧪 Testing & Validation
**Status :** Planifié
**Priorité :** P1
**Échéance :** 27/11/2025

**Backend Tests :**
- [ ] Tests des extractors (CSV, Excel, JSON, Parquet)
- [ ] Tests des transformers (Python, SQL)
- [ ] Tests du code executor (sandbox)
- [ ] Tests de l'API uploads
- [ ] Tests de l'API transforms
- [ ] Tests d'intégration pipeline complet

**Frontend Tests :**
- [ ] Tests des components (FileUploadField, CodeEditor, etc.)
- [ ] Tests du module mapper
- [ ] Tests des stores Zustand
- [ ] Tests E2E avec Cypress/Playwright

**Sécurité :**
- [ ] Audit du code sandbox (RestrictedPython)
- [ ] Tests d'injection SQL
- [ ] Tests de validation des uploads
- [ ] Tests des permissions utilisateur

---

#### 🚀 Pipeline Execution
**Status :** Planifié
**Priorité :** P1
**Échéance :** Décembre 2025

**Fonctionnalités :**
- [ ] **Résolution des dépendances**
  - Topological sort des nodes
  - Validation du DAG (pas de cycles)
  - Détection des nodes orphelins

- [ ] **Exécution séquentielle** (MVP)
  - Exécuter nodes dans l'ordre topologique
  - Passage des données entre nodes
  - Gestion des erreurs et rollback
  - Logs détaillés

- [ ] **Exécution distribuée** (Future)
  - Intégration Celery pour tasks async
  - Génération de DAGs Airflow
  - Parallélisation des branches indépendantes
  - Queue management

- [ ] **Monitoring**
  - Statut en temps réel (WebSocket)
  - Métriques (durée, rows processed, memory)
  - Logs structurés
  - Alertes en cas d'erreur

**Fichiers :**
```
backend/app/core/
  pipeline_executor.py           # NEW - Orchestration
  dag_resolver.py                # NEW - Topological sort

backend/app/modules/
  base.py                        # NEW - Base class pour modules

backend/app/api/v1/
  executions.py                  # UPDATE - Endpoints exécution
```

---

#### 📐 Templates de Pipelines
**Status :** Planifié
**Priorité :** P2
**Échéance :** Janvier 2026

**Templates à créer :**
- [ ] **Data Cleaning Pipeline**
  - CSV/Excel → Remove duplicates → Handle nulls → Type conversion → Output

- [ ] **ETL Database to Database**
  - PostgreSQL → Transform → Aggregate → MySQL

- [ ] **API to Data Lake**
  - REST API → JSON parse → Transform → S3/MinIO

- [ ] **Data Validation Pipeline**
  - Input → Validate schema → Detect anomalies → Quality report

- [ ] **Data Enrichment**
  - Base data → API lookup → Merge → Calculate KPIs → Output

**Fonctionnalités :**
- [ ] Galerie de templates avec preview
- [ ] Import de template en un clic
- [ ] Customisation des templates
- [ ] Sauvegarde de pipelines comme templates
- [ ] Partage de templates entre utilisateurs

---

## 🐛 Bugs & Issues

### 🔴 Critiques
_Aucun bug critique actuellement_

### 🟡 Moyens
- [ ] File upload : Vérifier gestion des fichiers > 100MB
- [ ] Module mapper : Tester tous les types JSON Schema

### 🟢 Mineurs
- [ ] UI : Améliorer messages d'erreur
- [ ] UI : Ajouter loading states partout

---

## 🎨 Améliorations UX/UI

### Interface Générale
- [ ] Dark mode complet
- [ ] Raccourcis clavier (save: Ctrl+S, run: Ctrl+Enter)
- [ ] Breadcrumbs pour navigation
- [ ] Notifications toast améliorées
- [ ] Onboarding tutorial pour nouveaux users

### Pipeline Builder
- [ ] Minimap pour grands pipelines
- [ ] Zoom controls améliorés
- [ ] Auto-layout des nodes
- [ ] Copy/paste de nodes
- [ ] Undo/Redo (Ctrl+Z/Ctrl+Y)
- [ ] Node search/filter dans la palette
- [ ] Validation visuelle (erreurs en rouge)

### Code Editor
- [ ] Vim mode (optionnel)
- [ ] Multiple cursors
- [ ] Code folding
- [ ] Format on save
- [ ] Diff viewer pour comparer versions

---

## 🏗️ Architecture & Technique

### Performance
- [ ] **Backend**
  - [ ] Caching avec Redis pour modules
  - [ ] Connection pooling PostgreSQL
  - [ ] Async I/O pour file operations
  - [ ] Pagination pour listes longues

- [ ] **Frontend**
  - [ ] Code splitting par route
  - [ ] Lazy loading des components
  - [ ] Virtualization pour longues listes
  - [ ] Memoization avec React.memo

### Sécurité
- [ ] Rate limiting sur API
- [ ] CORS configuration stricte
- [ ] Validation Pydantic partout
- [ ] Sanitization des inputs
- [ ] Audit logging pour actions sensibles
- [ ] Encryption des credentials connexions

### Infrastructure
- [ ] Docker compose pour dev local
- [ ] CI/CD avec GitHub Actions
- [ ] Tests automatiques sur PR
- [ ] Déploiement staging automatique
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Logging centralisé avec ELK

---

## 📚 Documentation

### Technique
- [ ] **README.md** - Setup et installation
- [ ] **ARCHITECTURE.md** - Vue d'ensemble architecture
- [ ] **API.md** - Documentation API REST
- [ ] **MODULES.md** - Guide création de modules custom
- [ ] **DEPLOYMENT.md** - Guide déploiement production

### Utilisateur
- [ ] Guide démarrage rapide
- [ ] Tutoriels vidéo
- [ ] Exemples de pipelines
- [ ] FAQ
- [ ] Glossaire des termes

### Développeur
- [ ] Contributing guide
- [ ] Code style guide
- [ ] Testing guide
- [ ] Module development SDK

---

## 🎯 Roadmap Long Terme

### Q4 2025
- [x] MVP Pipeline Builder
- [x] Upload system
- [ ] Custom transformations (Python/SQL)
- [ ] Extractors implémentés
- [ ] Exécution basique de pipelines

### Q1 2026
- [ ] Assistance IA (génération de code)
- [ ] Bibliothèque de templates
- [ ] Monitoring avancé
- [ ] Exécution distribuée (Celery)

### Q2 2026
- [ ] Marketplace de modules community
- [ ] Versioning de pipelines
- [ ] Collaboration multi-utilisateur
- [ ] Scheduling avancé (cron, triggers)

### Q3 2026
- [ ] Data catalog intégré
- [ ] Data lineage tracking
- [ ] Data quality monitoring
- [ ] Intégration dbt

---

## 📊 Métriques de Succès

### Technique
- [ ] Temps de chargement < 2s
- [ ] API response time < 200ms
- [ ] Test coverage > 80%
- [ ] Zero critical bugs en production

### Produit
- [ ] 10+ templates de pipelines
- [ ] 100+ snippets dans la bibliothèque
- [ ] Assistance IA avec 90%+ de code utilisable
- [ ] Documentation complète

---

## 🤝 Contributions

### Comment contribuer
1. Choisir une tâche dans ce TODO
2. Créer une branche : `git checkout -b feature/nom-tache`
3. Implémenter avec tests
4. Soumettre une PR avec description détaillée

### Code Review
- Toute PR nécessite 1 review
- Tests obligatoires
- Documentation à jour

---

## 📝 Notes & Décisions

### Décisions Architecturales

**2025-11-14 - Choix Python Transform vs Visual Builder**
- **Décision :** Code-first avec Python/SQL editors
- **Raison :** Utilisateurs = Data Engineers, besoin de flexibilité max
- **IA Future :** Structure prête pour génération de code automatique

**2025-11-14 - Upload System**
- **Décision :** file_id avec upload vs file_path
- **Raison :** UX améliorée, sécurité, portabilité
- **Implementation :** Table uploaded_files + FileUploadField component

**2025-11-14 - SQL Transform avec DuckDB**
- **Décision :** DuckDB au lieu de SQLite
- **Raison :** Performance sur DataFrames, syntaxe SQL standard, analytics optimisé

### Technologies Stack

**Frontend :**
- React 18 + TypeScript
- Material-UI (MUI)
- React Flow
- Monaco Editor
- Zustand (state management)
- React Query (server state)

**Backend :**
- FastAPI + Python 3.14
- SQLAlchemy 2.0
- Alembic (migrations)
- PostgreSQL
- Redis (cache & queue)
- Celery (async tasks)
- DuckDB (SQL on DataFrames)

**Infrastructure :**
- Docker + Docker Compose
- MinIO (object storage)
- Airflow (orchestration future)
- Nginx (reverse proxy)

---

## 🔗 Liens Utiles

- [Repository GitHub](https://github.com/your-org/logidata-ai)
- [Documentation](https://docs.logidata.ai)
- [API Reference](https://api.logidata.ai/docs)
- [Jira Board](https://your-org.atlassian.net)

---

**Légende :**
- ✅ Complété
- 🚧 En cours
- 📅 Planifié
- ⚡ Priorité haute
- 🔥 Urgent
- 📌 Important

---

_Dernière révision : 2025-11-14 par Claude Code_
