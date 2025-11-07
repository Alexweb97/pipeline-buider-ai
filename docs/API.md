# API Documentation

Documentation complète de l'API REST de ETL/ELT Builder.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Obtenir un token

```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=your_username&password=your_password
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Utiliser le token

Incluez le token dans le header `Authorization` de chaque requête:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### Authentication

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "viewer"
}
```

#### POST /auth/login
Se connecter et obtenir un token JWT.

#### POST /auth/refresh
Rafraîchir le token d'accès.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /auth/me
Obtenir les informations de l'utilisateur connecté.

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "developer",
  "is_active": true
}
```

### Pipelines

#### GET /pipelines
Lister tous les pipelines.

**Query Parameters:**
- `page` (int): Numéro de page (default: 1)
- `page_size` (int): Taille de page (default: 20, max: 100)
- `status` (string): Filtrer par status (draft, active, paused, archived)
- `search` (string): Recherche par nom
- `tags` (array): Filtrer par tags

**Response:**
```json
{
  "pipelines": [
    {
      "id": "uuid",
      "name": "Customer Data Pipeline",
      "description": "Extract and process customer data",
      "status": "active",
      "version": "1.0.0",
      "schedule": "0 2 * * *",
      "is_scheduled": true,
      "tags": ["customers", "daily"],
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "last_execution": {
        "id": "exec-uuid",
        "status": "success",
        "started_at": "2025-01-20T02:00:00Z",
        "completed_at": "2025-01-20T02:05:30Z",
        "rows_processed": 15000
      }
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

#### POST /pipelines
Créer un nouveau pipeline.

**Request:**
```json
{
  "name": "New Data Pipeline",
  "description": "Pipeline description",
  "config": {
    "nodes": [
      {
        "id": "node-1",
        "type": "extractor",
        "module": "postgres",
        "position": {"x": 100, "y": 100},
        "config": {
          "connection_id": "conn-uuid",
          "query": "SELECT * FROM users WHERE created_at > :start_date"
        }
      },
      {
        "id": "node-2",
        "type": "transformer",
        "module": "cleaner",
        "position": {"x": 300, "y": 100},
        "config": {
          "remove_duplicates": true,
          "columns": ["email"]
        }
      },
      {
        "id": "node-3",
        "type": "loader",
        "module": "s3",
        "position": {"x": 500, "y": 100},
        "config": {
          "bucket": "data-lake",
          "path": "processed/users/",
          "format": "parquet"
        }
      }
    ],
    "edges": [
      {"source": "node-1", "target": "node-2"},
      {"source": "node-2", "target": "node-3"}
    ]
  },
  "schedule": "0 2 * * *",
  "tags": ["users", "daily"],
  "default_params": {
    "start_date": "2025-01-01"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "New Data Pipeline",
  "status": "draft",
  "message": "Pipeline created successfully"
}
```

#### GET /pipelines/{pipeline_id}
Obtenir un pipeline par ID.

#### PUT /pipelines/{pipeline_id}
Mettre à jour un pipeline.

#### DELETE /pipelines/{pipeline_id}
Supprimer un pipeline.

#### POST /pipelines/{pipeline_id}/execute
Exécuter un pipeline manuellement.

**Request:**
```json
{
  "params": {
    "start_date": "2025-01-15",
    "end_date": "2025-01-20"
  }
}
```

**Response:**
```json
{
  "execution_id": "exec-uuid",
  "pipeline_id": "pipeline-uuid",
  "status": "pending",
  "started_at": "2025-01-20T10:30:00Z"
}
```

#### POST /pipelines/{pipeline_id}/validate
Valider la configuration d'un pipeline.

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Node 'node-2' has no description"
  ]
}
```

### Executions

#### GET /executions
Lister toutes les exécutions.

**Query Parameters:**
- `pipeline_id` (uuid): Filtrer par pipeline
- `status` (string): Filtrer par status
- `page`, `page_size`: Pagination

**Response:**
```json
{
  "executions": [
    {
      "id": "exec-uuid",
      "pipeline_id": "pipeline-uuid",
      "pipeline_name": "Customer Data Pipeline",
      "status": "success",
      "trigger_type": "scheduled",
      "started_at": "2025-01-20T02:00:00Z",
      "completed_at": "2025-01-20T02:05:30Z",
      "duration_seconds": 330,
      "rows_processed": 15000,
      "data_size_bytes": 1048576
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 20
}
```

#### GET /executions/{execution_id}
Obtenir une exécution par ID.

#### GET /executions/{execution_id}/logs
Obtenir les logs d'une exécution.

**Query Parameters:**
- `level` (string): Filtrer par niveau (DEBUG, INFO, WARNING, ERROR)
- `node_id` (string): Filtrer par noeud

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2025-01-20T02:00:05Z",
      "level": "INFO",
      "node_id": "node-1",
      "message": "Extracted 15000 rows from PostgreSQL",
      "metadata": {
        "duration_ms": 2350
      }
    },
    {
      "timestamp": "2025-01-20T02:00:10Z",
      "level": "INFO",
      "node_id": "node-2",
      "message": "Removed 150 duplicate rows",
      "metadata": {
        "rows_before": 15000,
        "rows_after": 14850
      }
    }
  ],
  "total": 45
}
```

#### GET /executions/{execution_id}/metrics
Obtenir les métriques d'une exécution.

**Response:**
```json
{
  "nodes": [
    {
      "node_id": "node-1",
      "rows_input": 0,
      "rows_output": 15000,
      "duration_seconds": 2.35,
      "memory_peak_mb": 125.5,
      "cpu_percent": 35.2
    },
    {
      "node_id": "node-2",
      "rows_input": 15000,
      "rows_output": 14850,
      "rows_filtered": 150,
      "duration_seconds": 1.8,
      "memory_peak_mb": 98.3,
      "cpu_percent": 28.5
    }
  ]
}
```

### Connections

#### GET /connections
Lister toutes les connexions.

#### POST /connections
Créer une nouvelle connexion.

**Request:**
```json
{
  "name": "Production Database",
  "type": "postgres",
  "description": "Main production PostgreSQL database",
  "config": {
    "host": "db.example.com",
    "port": 5432,
    "database": "production",
    "username": "etl_user",
    "password": "secure_password",
    "ssl_mode": "require"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "conn-uuid",
  "name": "Production Database",
  "type": "postgres",
  "status": "active",
  "last_tested_at": null
}
```

#### GET /connections/{connection_id}
Obtenir une connexion par ID.

#### PUT /connections/{connection_id}
Mettre à jour une connexion.

#### DELETE /connections/{connection_id}
Supprimer une connexion.

#### POST /connections/{connection_id}/test
Tester une connexion.

**Response:**
```json
{
  "status": "success",
  "message": "Connection successful",
  "details": {
    "latency_ms": 45,
    "version": "PostgreSQL 15.3"
  }
}
```

### Modules

#### GET /modules
Lister tous les modules disponibles.

**Response:**
```json
{
  "extractors": [
    {
      "name": "postgres",
      "display_name": "PostgreSQL Extractor",
      "description": "Extract data from PostgreSQL database",
      "icon": "database",
      "color": "#336791"
    }
  ],
  "transformers": [
    {
      "name": "cleaner",
      "display_name": "Data Cleaner",
      "description": "Clean and validate data",
      "icon": "broom",
      "color": "#10B981"
    }
  ],
  "loaders": [
    {
      "name": "s3",
      "display_name": "S3 Loader",
      "description": "Load data to S3/MinIO",
      "icon": "cloud-upload",
      "color": "#FF9900"
    }
  ]
}
```

#### GET /modules/{module_type}/{module_name}/schema
Obtenir le schéma de configuration d'un module.

**Response:**
```json
{
  "schema": {
    "type": "object",
    "properties": {
      "connection_id": {
        "type": "string",
        "title": "Connection",
        "description": "PostgreSQL connection to use"
      },
      "query": {
        "type": "string",
        "title": "SQL Query",
        "format": "code",
        "language": "sql"
      }
    },
    "required": ["connection_id", "query"]
  },
  "defaults": {
    "query": "SELECT * FROM table_name"
  }
}
```

## WebSocket

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/pipeline/{pipeline_id}');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

### Messages

**Execution Update:**
```json
{
  "type": "execution_update",
  "execution_id": "exec-uuid",
  "status": "running",
  "progress": 45,
  "current_node": "node-2"
}
```

**Log Entry:**
```json
{
  "type": "log",
  "execution_id": "exec-uuid",
  "timestamp": "2025-01-20T02:00:05Z",
  "level": "INFO",
  "message": "Processing batch 3/10"
}
```

## Error Responses

Toutes les erreurs suivent ce format:

```json
{
  "detail": "Error message",
  "error_code": "INVALID_PIPELINE_CONFIG",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

### Status Codes

- `200 OK`: Succès
- `201 Created`: Ressource créée
- `400 Bad Request`: Requête invalide
- `401 Unauthorized`: Non authentifié
- `403 Forbidden`: Non autorisé
- `404 Not Found`: Ressource non trouvée
- `422 Unprocessable Entity`: Erreur de validation
- `429 Too Many Requests`: Rate limit dépassé
- `500 Internal Server Error`: Erreur serveur

## Rate Limiting

L'API est limitée à 60 requêtes par minute par utilisateur.

Headers de réponse:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705748400
```

## Pagination

Les endpoints de liste supportent la pagination:

**Query Parameters:**
- `page`: Numéro de page (default: 1)
- `page_size`: Nombre d'éléments par page (default: 20, max: 100)

**Response Headers:**
```
X-Total-Count: 150
X-Page: 1
X-Page-Size: 20
X-Total-Pages: 8
```

## Interactive Documentation

Documentation interactive Swagger disponible à:
```
http://localhost:8000/docs
```

Documentation ReDoc disponible à:
```
http://localhost:8000/redoc
```

## SDKs

### Python Client

```python
from etl_builder_client import Client

client = Client(
    base_url="http://localhost:8000",
    api_key="your-api-key"
)

# List pipelines
pipelines = client.pipelines.list()

# Create pipeline
pipeline = client.pipelines.create(
    name="My Pipeline",
    config={...}
)

# Execute pipeline
execution = client.pipelines.execute(pipeline.id)
```

### JavaScript/TypeScript Client

```typescript
import { ETLBuilderClient } from '@etl-builder/client';

const client = new ETLBuilderClient({
  baseUrl: 'http://localhost:8000',
  apiKey: 'your-api-key'
});

// List pipelines
const pipelines = await client.pipelines.list();

// Create pipeline
const pipeline = await client.pipelines.create({
  name: 'My Pipeline',
  config: {...}
});

// Execute pipeline
const execution = await client.pipelines.execute(pipeline.id);
```

## Support

Pour toute question sur l'API:
- Documentation interactive: http://localhost:8000/docs
- GitHub Issues: https://github.com/votre-organisation/logidata_ai/issues
- Email: api-support@logidata.ai
