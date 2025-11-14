# Backend Integration Plan - LogiData AI Pipeline Builder

## 📋 Analysis Summary

### Current State
- **Frontend**: React + TypeScript with hardcoded mock data in `pipelineBuilder.ts`
- **Backend**: FastAPI with database models but incomplete API endpoints (mostly TODOs)
- **API Client**: Already configured with axios, authentication, and token refresh

### Backend API Structure

#### Available Endpoints
```
/api/v1/pipelines
  GET    /                      - List all pipelines
  POST   /                      - Create pipeline
  GET    /{pipeline_id}         - Get pipeline by ID
  PUT    /{pipeline_id}         - Update pipeline
  DELETE /{pipeline_id}         - Delete pipeline
  POST   /{pipeline_id}/execute - Execute pipeline
  POST   /{pipeline_id}/validate - Validate pipeline

/api/v1/modules
  GET    /                           - List all modules
  GET    /{module_type}/{module_name}/schema - Get module schema

/api/v1/executions
  GET    /                  - List executions
  GET    /{execution_id}    - Get execution
  GET    /{execution_id}/logs - Get logs
```

#### Database Models

**Pipeline Model** (`backend/app/db/models/pipeline.py`)
```python
- id: UUID
- created_by: UUID (FK to users)
- name: str
- description: str | None
- version: str
- config: dict (JSONB) - stores nodes and edges
- schedule: str | None
- is_scheduled: bool
- status: str (draft, active, etc.)
- tags: list[str]
- default_params: dict
```

**Module Model** (`backend/app/db/models/module.py`)
```python
- id: UUID
- name: str (unique)
- display_name: str
- description: str
- type: str (extractor, transformer, loader)
- category: str
- version: str
- python_class: str
- config_schema: dict (JSONB)
- input_schema: dict | None
- output_schema: dict | None
- required_connections: list[str]
- tags: list[str]
- is_active: bool
- usage_count: int
- icon: str | None
- documentation_url: str | None
```

**PipelineExecution Model** (`backend/app/db/models/execution.py`)
```python
- id: UUID
- pipeline_id: UUID
- triggered_by: UUID | None
- status: str (pending, running, success, failed, cancelled)
- trigger_type: str (manual, scheduled, webhook)
- started_at: str | None
- completed_at: str | None
- duration_seconds: int | None
- params: dict
- result: dict | None
- error_message: str | None
- error_trace: str | None
- logs: list
- metrics: dict
- airflow_dag_run_id: str | None
```

### Frontend Structure

**Current Mock Data Location**: `frontend/src/types/pipelineBuilder.ts`
- 38 hardcoded module definitions (8 extractors, 20 transformers, 10 loaders)
- Configuration presets for PostgreSQL, Filter, and Aggregate modules

**Key Frontend Components**:
1. `PipelineBuilderPage.tsx` - Main canvas with ReactFlow
2. `ModulePalette.tsx` - Module sidebar (drag & drop)
3. `NodeConfigPanel.tsx` - Configuration panel
4. `CustomNode.tsx` - Individual node component

---

## 🎯 Integration Strategy

### Phase 1: API Service Layer (Priority: HIGH)
Create TypeScript API client services following the existing `authApi` pattern.

**Files to Create:**
1. `frontend/src/api/pipelines.ts` - Pipeline CRUD operations
2. `frontend/src/api/modules.ts` - Module listing and schema
3. `frontend/src/api/executions.ts` - Execution tracking
4. `frontend/src/types/api.ts` - Backend response types

**Key Actions:**
- Map backend models to TypeScript interfaces
- Handle API errors consistently
- Add loading states
- Implement retry logic for failed requests

---

### Phase 2: State Management (Priority: HIGH)
Create Zustand store for pipeline state management.

**File to Create:**
`frontend/src/stores/pipelineStore.ts`

**Store Structure:**
```typescript
interface PipelineStore {
  // State
  pipelines: Pipeline[]
  currentPipeline: Pipeline | null
  modules: ModuleDefinition[]
  loading: boolean
  error: string | null

  // Actions
  fetchPipelines: () => Promise<void>
  fetchPipeline: (id: string) => Promise<void>
  createPipeline: (data: PipelineSaveData) => Promise<string>
  updatePipeline: (id: string, data: PipelineSaveData) => Promise<void>
  deletePipeline: (id: string) => Promise<void>
  executePipeline: (id: string) => Promise<string>
  validatePipeline: (id: string) => Promise<ValidationResult>

  fetchModules: () => Promise<void>
  fetchModuleSchema: (type: string, name: string) => Promise<ConfigSchema>
}
```

---

### Phase 3: Backend Implementation (Priority: HIGH)
Complete the backend API endpoints that are currently marked as TODO.

**Files to Update:**
1. `backend/app/api/v1/pipelines.py` - Implement all TODO endpoints
2. `backend/app/api/v1/modules.py` - Implement module registry
3. `backend/app/schemas/` - Create Pydantic schemas for request/response

**Implementation Order:**
1. **Modules API** (needed first for frontend to work)
   - Seed database with 38 module definitions
   - Implement `GET /modules` - return all active modules
   - Implement `GET /modules/{type}/{name}/schema`

2. **Pipelines API**
   - Implement `POST /pipelines` - create with nodes/edges in config
   - Implement `GET /pipelines` - list with pagination
   - Implement `GET /pipelines/{id}` - get full config
   - Implement `PUT /pipelines/{id}` - update config
   - Implement `DELETE /pipelines/{id}`
   - Implement `POST /pipelines/{id}/validate` - validate connections

3. **Executions API**
   - Implement execution tracking
   - WebSocket for real-time logs

---

### Phase 4: Frontend Integration (Priority: MEDIUM)
Update frontend components to use real API instead of mock data.

**Files to Update:**
1. `PipelineBuilderPage.tsx`
   - Add store integration
   - Replace mock save with API call
   - Add loading states
   - Add error handling

2. `ModulePalette.tsx`
   - Fetch modules from API on mount
   - Handle loading state
   - Handle errors

3. `NodeConfigPanel.tsx`
   - Fetch dynamic schemas from API
   - Support server-side validation

---

### Phase 5: Advanced Features (Priority: LOW)
Additional enhancements after basic integration.

**Features:**
1. **Configuration Templates**
   - Backend endpoint: `POST /api/v1/templates`
   - Store user-saved templates in database
   - Share templates across team

2. **Pipeline Versioning**
   - Track pipeline changes
   - Rollback to previous versions

3. **Real-time Execution Monitoring**
   - WebSocket connection for live logs
   - Progress tracking
   - Metrics display

4. **AI-Assisted Pipeline Building**
   - Suggest next modules
   - Auto-validate connections
   - Optimize pipeline structure

---

## 📊 Data Mapping

### Frontend → Backend

**Pipeline Save Data:**
```typescript
// Frontend (PipelineSaveData)
{
  name: string
  description: string
  type: 'etl' | 'elt' | 'streaming'
  nodes: PipelineNode[]  // ReactFlow nodes
  edges: Edge[]          // ReactFlow edges
}

// Backend (Pipeline.config)
{
  name: string
  description: string
  version: "1.0.0"
  config: {
    nodes: [...],
    edges: [...]
  }
  status: "draft"
  tags: []
  default_params: {}
}
```

**Module Definition:**
```typescript
// Frontend
{
  id: 'postgres-extractor'
  type: 'extractor'
  category: 'database'
  name: 'PostgreSQL'
  description: '...'
  icon: 'database'
  color: '#4F46E5'
  defaultConfig: {...}
  configSchema: ConfigField[]
  presets?: ConfigPreset[]
}

// Backend
{
  id: UUID
  name: 'postgres-extractor'
  display_name: 'PostgreSQL'
  type: 'extractor'
  category: 'database'
  config_schema: {...}  // JSON Schema format
  icon: 'database'
  is_active: true
}
```

---

## 🔧 Implementation Steps

### Step 1: Create API Service Layer
```bash
# Files to create
frontend/src/api/pipelines.ts
frontend/src/api/modules.ts
frontend/src/api/executions.ts
frontend/src/types/api.ts
```

### Step 2: Create Zustand Store
```bash
# File to create
frontend/src/stores/pipelineStore.ts
```

### Step 3: Backend Implementation
```bash
# Files to update
backend/app/api/v1/pipelines.py
backend/app/api/v1/modules.py
backend/app/schemas/pipeline.py
backend/app/schemas/module.py
backend/app/crud/pipeline.py
backend/app/crud/module.py
```

### Step 4: Database Seed Script
```bash
# Create seed script for modules
backend/scripts/seed_modules.py
```

### Step 5: Update Frontend Components
```bash
# Files to update
frontend/src/pages/PipelineBuilderPage.tsx
frontend/src/components/ModulePalette.tsx
frontend/src/components/NodeConfigPanel.tsx
```

### Step 6: Error Handling & Loading States
- Add error boundaries
- Add skeleton loaders
- Add retry logic
- Add toast notifications

---

## 🚨 Critical Gaps & Decisions Needed

### 1. Module Registry Strategy
**Question**: Should we store all 38 module definitions in the database or keep them in code?

**Options:**
- **Option A**: Database (recommended)
  - ✅ Dynamic module management
  - ✅ No redeployment needed to add modules
  - ✅ Track usage statistics
  - ❌ Requires seed script

- **Option B**: Code-based
  - ✅ Simpler deployment
  - ✅ Type-safe
  - ❌ Less flexible
  - ❌ Requires redeployment for changes

**Recommendation**: Option A (Database) - Better for production scalability

### 2. Configuration Presets
**Current**: Hardcoded in frontend
**Needed**: Backend storage for presets

**Options:**
- Store presets in Module model as JSONB field
- Create separate ConfigPreset table
- Keep in frontend (simpler but less flexible)

**Recommendation**: Add `presets` JSONB field to Module model

### 3. Pipeline Validation
**Backend endpoint exists**: `POST /pipelines/{id}/validate`

**Validation Rules Needed:**
- All nodes must be connected (no orphans)
- Must start with extractor
- Must end with loader
- Connection type compatibility (extractor → transformer → loader)
- Required config fields filled
- Database connection credentials valid

### 4. Execution Engine
**Current**: Airflow integration mentioned in models
**Question**: How should pipeline execution work?

**Options:**
- Airflow DAG generation
- Celery tasks
- Direct execution
- Kubernetes jobs

**Recommendation**: Start with direct execution, add Airflow later

---

## 📅 Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | API Service Layer | 2-3 hours |
| Phase 2 | State Management | 1-2 hours |
| Phase 3 | Backend Implementation | 6-8 hours |
| Phase 4 | Frontend Integration | 3-4 hours |
| Phase 5 | Testing & Bug Fixes | 2-3 hours |
| **Total** | | **14-20 hours** |

---

## ✅ Next Immediate Actions

1. **Create API service layer** (`frontend/src/api/pipelines.ts`, `modules.ts`)
2. **Create Zustand store** (`frontend/src/stores/pipelineStore.ts`)
3. **Create Pydantic schemas** for backend request/response
4. **Implement modules API** - Start with `GET /modules` endpoint
5. **Create database seed script** for 38 modules
6. **Update PipelineBuilderPage** to use store instead of mock data

---

## 🎯 Success Criteria

- [ ] All 38 modules loaded from backend API
- [ ] Pipeline save/load works with backend
- [ ] No mock data remains in frontend
- [ ] Error handling in place
- [ ] Loading states for all async operations
- [ ] Pipeline validation works
- [ ] Configuration presets loaded from backend
- [ ] User can create, save, and execute pipelines end-to-end
- [ ] Real-time execution logs visible
- [ ] All TypeScript types match backend models

---

## 📚 References

**Backend Files:**
- `backend/app/api/v1/pipelines.py` - Pipeline endpoints
- `backend/app/db/models/pipeline.py` - Pipeline model
- `backend/app/db/models/module.py` - Module model
- `backend/app/main.py` - FastAPI app configuration

**Frontend Files:**
- `frontend/src/types/pipelineBuilder.ts` - Current mock data
- `frontend/src/pages/PipelineBuilderPage.tsx` - Main page
- `frontend/src/api/auth.ts` - Example API client pattern
- `frontend/src/api/client.ts` - Configured axios instance

---

**Document Created**: 2025-11-13
**Status**: Ready for Implementation
**Next Step**: Begin Phase 1 - API Service Layer
