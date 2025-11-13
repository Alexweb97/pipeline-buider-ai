# Database Schema - ETL/ELT Builder Platform

## Vue d'ensemble

Base de données PostgreSQL 15+ avec TimescaleDB pour les séries temporelles.

## Tables Principales

### 1. Users (Utilisateurs)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- admin, developer, viewer
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT users_role_check CHECK (role IN ('admin', 'developer', 'viewer'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Organizations (Organisations)

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
```

### 3. User_Organizations (Relation N-N)

```sql
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, organization_id),
    CONSTRAINT user_orgs_role_check CHECK (role IN ('owner', 'admin', 'member'))
);

CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);
```

### 4. Connections (Connexions Data Sources)

```sql
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- postgres, mysql, s3, api, etc.
    description TEXT,

    -- Credentials chiffrées
    config JSONB NOT NULL, -- {host, port, database, username, password_encrypted, etc.}

    is_active BOOLEAN DEFAULT true,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    last_test_status VARCHAR(50), -- success, failed, pending
    last_test_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT connections_type_check CHECK (type IN (
        'postgres', 'mysql', 'mongodb', 'sqlite',
        's3', 'minio', 'gcs', 'azure_blob',
        'rest_api', 'graphql', 'soap',
        'kafka', 'rabbitmq',
        'csv', 'json', 'excel', 'parquet'
    ))
);

CREATE INDEX idx_connections_org ON connections(organization_id);
CREATE INDEX idx_connections_type ON connections(type);
CREATE INDEX idx_connections_created_by ON connections(created_by);
```

### 5. Pipelines (Configurations de pipelines)

```sql
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',

    -- Configuration complète du pipeline (nodes + edges)
    config JSONB NOT NULL,

    -- Schedule CRON
    schedule VARCHAR(100), -- "0 2 * * *" ou null pour manual
    is_scheduled BOOLEAN DEFAULT false,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, active, paused, archived

    -- Tags pour filtrage
    tags TEXT[] DEFAULT '{}',

    -- Paramètres par défaut
    default_params JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT pipelines_status_check CHECK (status IN ('draft', 'active', 'paused', 'archived'))
);

CREATE INDEX idx_pipelines_org ON pipelines(organization_id);
CREATE INDEX idx_pipelines_status ON pipelines(status);
CREATE INDEX idx_pipelines_created_by ON pipelines(created_by);
CREATE INDEX idx_pipelines_tags ON pipelines USING GIN(tags);
```

### 6. Pipeline_Executions (Historique d'exécution)

```sql
CREATE TABLE pipeline_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,

    -- Airflow DAG info
    dag_id VARCHAR(255),
    dag_run_id VARCHAR(255),

    -- Trigger
    triggered_by UUID REFERENCES users(id), -- null si scheduled
    trigger_type VARCHAR(50) NOT NULL, -- manual, scheduled, api, webhook

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, success, failed, cancelled

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,

    -- Paramètres d'exécution
    params JSONB DEFAULT '{}',

    -- Résultats
    result JSONB,
    error_message TEXT,

    -- Métriques
    rows_processed INTEGER DEFAULT 0,
    data_size_bytes BIGINT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT exec_status_check CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
    CONSTRAINT exec_trigger_check CHECK (trigger_type IN ('manual', 'scheduled', 'api', 'webhook'))
);

CREATE INDEX idx_exec_pipeline ON pipeline_executions(pipeline_id);
CREATE INDEX idx_exec_status ON pipeline_executions(status);
CREATE INDEX idx_exec_started ON pipeline_executions(started_at DESC);
CREATE INDEX idx_exec_dag_run ON pipeline_executions(dag_run_id);

-- Extension TimescaleDB pour optimisation séries temporelles
SELECT create_hypertable('pipeline_executions', 'created_at', if_not_exists => TRUE);
```

### 7. Execution_Logs (Logs détaillés)

```sql
CREATE TABLE execution_logs (
    id BIGSERIAL PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES pipeline_executions(id) ON DELETE CASCADE,

    -- Node concerné
    node_id VARCHAR(100), -- null pour logs globaux

    -- Log details
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(20) NOT NULL, -- DEBUG, INFO, WARNING, ERROR, CRITICAL
    message TEXT NOT NULL,
    metadata JSONB,

    CONSTRAINT logs_level_check CHECK (level IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'))
);

CREATE INDEX idx_logs_execution ON execution_logs(execution_id);
CREATE INDEX idx_logs_timestamp ON execution_logs(timestamp DESC);
CREATE INDEX idx_logs_level ON execution_logs(level);

-- TimescaleDB hypertable
SELECT create_hypertable('execution_logs', 'timestamp', if_not_exists => TRUE);
```

### 8. Node_Metrics (Métriques par noeud)

```sql
CREATE TABLE node_metrics (
    id BIGSERIAL PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES pipeline_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,

    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Métriques
    rows_input INTEGER DEFAULT 0,
    rows_output INTEGER DEFAULT 0,
    rows_filtered INTEGER DEFAULT 0,
    rows_error INTEGER DEFAULT 0,

    data_size_bytes BIGINT DEFAULT 0,
    duration_seconds FLOAT,
    memory_peak_mb FLOAT,
    cpu_percent FLOAT,

    metadata JSONB
);

CREATE INDEX idx_node_metrics_exec ON node_metrics(execution_id);
CREATE INDEX idx_node_metrics_timestamp ON node_metrics(timestamp DESC);

SELECT create_hypertable('node_metrics', 'timestamp', if_not_exists => TRUE);
```

### 9. API_Keys (Clés API pour intégrations)

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL, -- Pour identification (ex: "pk_live_abc...")

    permissions JSONB DEFAULT '{}', -- {"pipelines": ["read", "execute"], "connections": ["read"]}

    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

### 10. Audit_Trail (Traçabilité RGPD)

```sql
CREATE TABLE audit_trail (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),

    action VARCHAR(100) NOT NULL, -- create, read, update, delete, execute
    resource_type VARCHAR(100) NOT NULL, -- pipeline, connection, user, etc.
    resource_id UUID,

    ip_address INET,
    user_agent TEXT,

    changes JSONB, -- Before/after pour updates
    metadata JSONB
);

CREATE INDEX idx_audit_user ON audit_trail(user_id);
CREATE INDEX idx_audit_org ON audit_trail(organization_id);
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_trail(resource_type, resource_id);

SELECT create_hypertable('audit_trail', 'timestamp', if_not_exists => TRUE);
```

### 11. Notifications (Alertes et notifications)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL, -- pipeline_failed, pipeline_success, alert, info
    title VARCHAR(255) NOT NULL,
    message TEXT,

    -- Lien vers ressource
    resource_type VARCHAR(100),
    resource_id UUID,

    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT notif_type_check CHECK (type IN ('pipeline_failed', 'pipeline_success', 'alert', 'info', 'warning'))
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_org ON notifications(organization_id);
CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_notif_created ON notifications(created_at DESC);
```

### 12. Module_Templates (Templates de modules réutilisables)

```sql
CREATE TABLE module_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- extractor, transformer, loader
    type VARCHAR(100) NOT NULL, -- postgres, cleaner, s3, etc.

    -- Configuration par défaut
    config_schema JSONB NOT NULL, -- JSON Schema pour validation
    default_config JSONB,

    -- UI metadata
    icon VARCHAR(100),
    color VARCHAR(20),

    is_public BOOLEAN DEFAULT false, -- Partageable entre orgs
    is_active BOOLEAN DEFAULT true,

    usage_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_org ON module_templates(organization_id);
CREATE INDEX idx_templates_category ON module_templates(category);
CREATE INDEX idx_templates_type ON module_templates(type);
```

### 13. Data_Previews (Cache des prévisualisations)

```sql
CREATE TABLE data_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES pipeline_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,

    -- Preview data (100 premières lignes)
    sample_data JSONB NOT NULL,
    schema_info JSONB NOT NULL, -- Types de colonnes, stats basiques

    row_count INTEGER,
    column_count INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_previews_exec ON data_previews(execution_id);
CREATE INDEX idx_previews_node ON data_previews(node_id);
CREATE INDEX idx_previews_expires ON data_previews(expires_at);
```

## Views Utiles

### Vue des pipelines actifs avec dernière exécution

```sql
CREATE VIEW pipelines_with_last_execution AS
SELECT
    p.id,
    p.name,
    p.status,
    p.schedule,
    p.organization_id,
    p.created_by,
    p.created_at,
    p.updated_at,
    e.id as last_execution_id,
    e.status as last_execution_status,
    e.started_at as last_execution_started,
    e.completed_at as last_execution_completed,
    e.rows_processed as last_execution_rows
FROM pipelines p
LEFT JOIN LATERAL (
    SELECT * FROM pipeline_executions
    WHERE pipeline_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
) e ON true
WHERE p.status IN ('active', 'paused');
```

### Vue des statistiques utilisateur

```sql
CREATE VIEW user_statistics AS
SELECT
    u.id,
    u.username,
    u.email,
    COUNT(DISTINCT p.id) as pipeline_count,
    COUNT(DISTINCT c.id) as connection_count,
    COUNT(DISTINCT pe.id) as execution_count,
    MAX(pe.started_at) as last_execution_date
FROM users u
LEFT JOIN pipelines p ON p.created_by = u.id
LEFT JOIN connections c ON c.created_by = u.id
LEFT JOIN pipeline_executions pe ON EXISTS (
    SELECT 1 FROM pipelines p2
    WHERE p2.id = pe.pipeline_id
    AND p2.created_by = u.id
)
GROUP BY u.id, u.username, u.email;
```

## Fonctions Utiles

### Fonction de mise à jour automatique updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application aux tables concernées
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Fonction de nettoyage automatique des données expirées

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Supprimer previews expirés
    DELETE FROM data_previews WHERE expires_at < NOW();

    -- Supprimer vieilles exécutions (> 90 jours)
    DELETE FROM pipeline_executions
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('success', 'failed');

    -- Supprimer vieux logs (> 30 jours)
    DELETE FROM execution_logs
    WHERE timestamp < NOW() - INTERVAL '30 days';

    -- Archiver audit trail (> 180 jours)
    DELETE FROM audit_trail
    WHERE timestamp < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- Job planifié (nécessite pg_cron extension)
-- SELECT cron.schedule('cleanup-job', '0 3 * * *', 'SELECT cleanup_expired_data()');
```

## Politique de Backup

1. **Dump complet quotidien**: pg_dump avec compression
2. **WAL Archiving**: Continuous archiving pour PITR
3. **Réplication**: Replica en lecture seule pour HA
4. **Rétention**: 7 jours de dumps + 30 jours de WAL

## Politiques de Sécurité

### Row Level Security (RLS) - Exemple pour pipelines

```sql
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see pipelines from their organizations
CREATE POLICY pipelines_org_isolation ON pipelines
    FOR ALL
    TO authenticated_user
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_organizations
            WHERE user_id = current_setting('app.current_user_id')::uuid
        )
    );
```

## Chiffrement des Données Sensibles

Les champs sensibles (passwords, API keys dans config JSONB) doivent être chiffrés avec:

- **pgcrypto extension**: Pour chiffrement côté DB
- **Application-level encryption**: AES-256-GCM avant insertion

Exemple:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Chiffrer
INSERT INTO connections (config)
VALUES (
    jsonb_set(
        '{"host": "db.example.com"}'::jsonb,
        '{password}',
        to_jsonb(pgp_sym_encrypt('secret_password', 'encryption_key'))
    )
);

-- Déchiffrer
SELECT
    config - 'password' ||
    jsonb_build_object('password', pgp_sym_decrypt((config->>'password')::bytea, 'encryption_key'))
FROM connections;
```

## Migrations

Utiliser **Alembic** (Python) pour gérer les migrations de schéma:

```bash
# Créer migration
alembic revision --autogenerate -m "Add pipelines table"

# Appliquer migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Performance Tips

1. **Partitioning**: Tables temporelles (executions, logs) partitionnées par mois
2. **Index sélectifs**: Sur status, created_at, organization_id
3. **Vacuum régulier**: Autovacuum correctement configuré
4. **Connection pooling**: PgBouncer pour gérer connexions
5. **Query optimization**: EXPLAIN ANALYZE pour identifier bottlenecks
