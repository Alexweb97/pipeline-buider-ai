# Intégration Airflow - LogiData AI

## 🎯 Vue d'ensemble

Cette documentation décrit l'intégration complète d'Apache Airflow dans LogiData AI pour l'orchestration et l'exécution des pipelines ETL/ELT.

## 📁 Fichiers créés

### 1. Client Airflow API
**Fichier:** `backend/app/integrations/airflow_client.py`

Wrapper pour l'API REST d'Airflow qui permet :
- ✅ Déclencher des DAGs
- ✅ Récupérer le statut d'exécution
- ✅ Annuler des exécutions
- ✅ Gérer les DAGs (pause/unpause)
- ✅ Récupérer les logs (à implémenter complètement)

**Classe principale:** `AirflowClient`

**Singleton:** `get_airflow_client()` pour une instance globale

### 2. Générateur de DAGs dynamiques
**Fichier:** `backend/app/airflow/dag_generator.py`

Génère automatiquement des DAGs Airflow à partir des configurations de pipelines :
- ✅ Convertit la config JSON (nodes + edges) en code Python Airflow
- ✅ Crée les fichiers DAG dans `/backend/dags/`
- ✅ Gère les dépendances entre tâches
- ✅ Supporte les schedules (cron expressions)
- ✅ Met à jour les DAGs existants

**Classe principale:** `DAGGenerator`

### 3. Opérateur Airflow personnalisé
**Fichier:** `backend/dags/operators/etl_operator.py`

Opérateur Airflow custom pour exécuter les modules ETL :
- ✅ Charge dynamiquement les classes de modules (extractors, transformers, loaders)
- ✅ Gère le passage de données via XCom entre tâches
- ✅ Convertit DataFrames en dict pour la sérialisation
- ✅ Gère les erreurs et logs
- ✅ Couleurs UI différentes par type de module

**Classe principale:** `ETLOperator`

### 4. Tâches Celery mises à jour
**Fichier:** `backend/app/workers/tasks/pipeline.py`

Tâches asynchrones pour l'orchestration :

#### `execute_pipeline(pipeline_id, params, trigger_type, user_id)`
- Charge la config du pipeline depuis la DB
- Crée un enregistrement d'exécution
- Génère/met à jour le DAG Airflow
- Déclenche l'exécution via l'API Airflow
- Met à jour le statut en base

#### `monitor_execution(execution_id)`
- Interroge l'API Airflow pour obtenir le statut
- Met à jour l'enregistrement d'exécution
- Calcule la durée d'exécution
- Map les états Airflow vers nos états

#### `cancel_pipeline(pipeline_id, execution_id)`
- Annule l'exécution Airflow via API
- Met à jour le statut à "cancelled"

### 5. Endpoints API mis à jour
**Fichier:** `backend/app/api/v1/pipelines.py`

#### `POST /api/v1/pipelines/{pipeline_id}/execute`
- Déclenche l'exécution via Celery
- Retourne le task_id Celery

**Fichier:** `backend/app/api/v1/executions.py`

#### `GET /api/v1/executions`
- Liste les exécutions avec pagination et filtres

#### `GET /api/v1/executions/{execution_id}`
- Récupère les détails d'une exécution

#### `POST /api/v1/executions/{execution_id}/monitor`
- Déclenche une mise à jour du statut depuis Airflow

#### `POST /api/v1/executions/{execution_id}/cancel`
- Annule une exécution en cours

#### `GET /api/v1/executions/{execution_id}/logs`
- Récupère les logs d'exécution

## 🔄 Workflow d'exécution

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User clicks "Execute" in UI                               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. POST /api/v1/pipelines/{id}/execute                       │
│    - FastAPI endpoint receives request                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Celery task: execute_pipeline.delay()                     │
│    - Task submitted to Redis queue                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Celery Worker picks up task                               │
│    - Load pipeline config from PostgreSQL                    │
│    - Create PipelineExecution record (status: pending)       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. DAGGenerator.update_dag()                                  │
│    - Generate Python DAG file from config                    │
│    - Write to /backend/dags/pipeline_{uuid}.py               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Airflow Scheduler detects new DAG                         │
│    - Parse DAG file                                           │
│    - Register tasks and dependencies                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. AirflowClient.trigger_dag()                                │
│    - POST to Airflow API /api/v1/dags/{dag_id}/dagRuns      │
│    - Pass pipeline config and params                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. Airflow executes DAG                                       │
│    - Airflow Worker runs ETLOperator tasks                   │
│    - Each task:                                               │
│      * Loads module class dynamically                        │
│      * Executes module.execute()                             │
│      * Passes data via XCom to next task                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 9. Monitoring (optional periodic polling)                    │
│    - POST /api/v1/executions/{id}/monitor                    │
│    - Celery task: monitor_execution.delay()                  │
│    - AirflowClient.get_dag_run_status()                       │
│    - Update PipelineExecution status in DB                   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 10. Completion                                                │
│     - Airflow marks DAG as success/failed                    │
│     - Monitor task updates final status                      │
│     - User sees result in UI                                 │
└──────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration requise

### Variables d'environnement (backend/.env)

```env
# Airflow Configuration
AIRFLOW_API_URL=http://airflow-webserver:8080/api/v1
AIRFLOW_USERNAME=admin
AIRFLOW_PASSWORD=admin
AIRFLOW_HOME=/opt/airflow
AIRFLOW_WEBSERVER_PORT=8080
```

### Services Docker Compose

Les services suivants doivent être actifs :
- `airflow-postgres` : Base de données métadonnées Airflow
- `airflow-webserver` : Interface web Airflow (port 8080)
- `airflow-scheduler` : Planificateur de tâches
- `airflow-worker` : Exécuteur de tâches (Celery)
- `airflow-init` : Initialisation et création user admin

## 📊 Modèle de données

### PipelineExecution
Champs importants pour Airflow :
- `airflow_dag_run_id`: ID de l'exécution Airflow
- `status`: État mappé depuis Airflow (pending, running, success, failed, cancelled)
- `started_at`: Timestamp de début (ISO format)
- `completed_at`: Timestamp de fin (ISO format)
- `duration_seconds`: Durée calculée

### Mapping des états Airflow

| État Airflow | État LogiData AI |
|--------------|------------------|
| `queued`     | `pending`        |
| `running`    | `running`        |
| `success`    | `success`        |
| `failed`     | `failed`         |
| Autre        | `unknown`        |

## 🧪 Tests à effectuer

### Test 1: Exécution simple
```bash
# 1. Créer un pipeline simple (CSV → Filter → PostgreSQL)
# 2. Exécuter via API
curl -X POST http://localhost:8000/api/v1/pipelines/{id}/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"params": {}, "trigger_type": "manual"}'

# 3. Vérifier le DAG généré
ls backend/dags/pipeline_*.py

# 4. Vérifier dans Airflow UI
open http://localhost:8080

# 5. Monitorer l'exécution
curl -X POST http://localhost:8000/api/v1/executions/{execution_id}/monitor \
  -H "Authorization: Bearer $TOKEN"
```

### Test 2: Annulation
```bash
# 1. Lancer une exécution longue
# 2. Annuler via API
curl -X POST http://localhost:8000/api/v1/executions/{execution_id}/cancel \
  -H "Authorization: Bearer $TOKEN"

# 3. Vérifier que le statut passe à "cancelled"
```

### Test 3: Pipeline complexe
```bash
# 1. Créer un pipeline avec plusieurs transformateurs
# 2. Vérifier les dépendances dans le DAG généré
# 3. Vérifier le passage de données via XCom
```

## 🚀 Prochaines étapes

### Court terme
- [ ] Tester l'intégration complète avec les services Docker
- [ ] Corriger les bugs éventuels
- [ ] Ajouter la gestion des logs depuis Airflow
- [ ] Implémenter le monitoring automatique périodique

### Moyen terme
- [ ] WebSocket pour le monitoring en temps réel
- [ ] Métriques détaillées par tâche
- [ ] Retry automatique des tâches échouées
- [ ] Alertes en cas d'échec

### Long terme
- [ ] Support des DAGs conditionnels (branches)
- [ ] Support des DAGs avec boucles
- [ ] Optimisation des performances
- [ ] Gestion avancée des ressources

## ⚠️ Points d'attention

### 1. Sérialisation XCom
Les DataFrames Pandas doivent être convertis en dict pour passer via XCom :
```python
result_dict = {
    "data": df.to_dict(orient="records"),
    "columns": df.columns.tolist(),
    "shape": df.shape,
}
```

### 2. Import des modules
Le DAG généré doit pouvoir importer les modules depuis `/app` :
```python
sys.path.insert(0, '/app')
```

### 3. Délai de détection des DAGs
Après génération, attendre 2 secondes pour qu'Airflow détecte le nouveau DAG :
```python
time.sleep(2)
```

### 4. Gestion des erreurs
- Les erreurs dans les modules ETL doivent remonter à Airflow
- Le statut doit être mis à jour en cas d'échec
- Les logs doivent être conservés

## 📖 Ressources

- [Documentation Airflow](https://airflow.apache.org/docs/)
- [Airflow REST API](https://airflow.apache.org/docs/apache-airflow/stable/stable-rest-api-ref.html)
- [Custom Operators](https://airflow.apache.org/docs/apache-airflow/stable/howto/custom-operator.html)
- [XCom](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/xcoms.html)

## 🤝 Contribution

Pour toute modification de l'intégration Airflow :
1. Documenter les changements dans ce fichier
2. Tester avec plusieurs types de pipelines
3. Vérifier la compatibilité avec les versions Airflow 2.8+

---

**Auteur:** LogiData AI Team
**Date:** 2024-11-19
**Version:** 1.0.0
