# Testing Guide - Frontend/Backend Integration

## Quick Start

### 1. Start All Services

```bash
cd /home/lexweb/projects/logidata_ai/infrastructure/docker
docker-compose up -d
```

### 2. Seed Modules (First Time Only)

```bash
curl -X POST http://localhost:8000/api/v1/modules/seed
```

Expected response:
```json
{
  "message": "Successfully seeded 14 modules",
  "count": 14,
  "extractors": 8,
  "transformers": 3,
  "loaders": 3
}
```

### 3. Open Frontend

Navigate to: http://localhost:3000

## Testing Checklist

### Backend API Tests

#### Health Check
```bash
curl http://localhost:8000/health
```
Expected: `{"status": "healthy", "version": "1.0.0"}`

#### List All Modules
```bash
curl http://localhost:8000/api/v1/modules | jq '.total'
```
Expected: `14`

#### Filter Extractors
```bash
curl "http://localhost:8000/api/v1/modules?type=extractor" | jq '.modules | length'
```
Expected: `8`

#### Filter Transformers
```bash
curl "http://localhost:8000/api/v1/modules?type=transformer" | jq '.modules | length'
```
Expected: `3`

#### Filter Loaders
```bash
curl "http://localhost:8000/api/v1/modules?type=loader" | jq '.modules | length'
```
Expected: `3`

#### Search Modules
```bash
curl "http://localhost:8000/api/v1/modules?search=postgres" | jq '.modules | length'
```
Expected: `2` (postgres-extractor and postgres-loader)

#### Get Module Schema
```bash
curl http://localhost:8000/api/v1/modules/extractor/postgres-extractor/schema | jq .
```
Expected: Schema with properties and defaults

### Frontend Integration Tests

#### 1. Module Palette Loading
- **Navigate to:** http://localhost:3000/pipeline/builder
- **Check:** Module Palette (left sidebar) shows all 14 modules
- **Verify:** Modules are grouped by category:
  - Data Extractors (8 modules)
  - Transformers (3 modules)
  - Data Loaders (3 modules)

#### 2. Module Search
- **Type in search:** "postgres"
- **Verify:** Only PostgreSQL extractor and loader are shown
- **Clear search:** All modules reappear

#### 3. Module Drag & Drop
- **Drag** PostgreSQL extractor onto canvas
- **Verify:** Node appears with correct name, icon, and color
- **Check:** Node ID uses module name (e.g., "postgres-extractor")

#### 4. Module Configuration Panel
- **Click** on the PostgreSQL extractor node
- **Verify:** Configuration panel opens on the right
- **Check:** Configuration fields appear:
  - Connection (text field, required)
  - SQL Query (text field, required, default: "SELECT * FROM table_name")
  - Row Limit (number field, default: 1000)

#### 5. Build Complete Pipeline
- **Add modules:**
  1. PostgreSQL extractor
  2. Filter Rows transformer
  3. PostgreSQL loader
- **Connect them:** Draw edges from output to input handles
- **Save:** Click "Save Pipeline" button
- **Verify:** Pipeline saved successfully

#### 6. Pipeline Validation
- **Create invalid pipeline:** Add only extractors, no loaders
- **Click:** "Validate" button
- **Verify:** Error message appears: "Pipeline must end with at least one loader"

### API Integration Tests

#### Create Pipeline
```bash
curl -X POST http://localhost:8000/api/v1/pipelines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Pipeline",
    "description": "Test description",
    "config": {
      "nodes": [
        {
          "id": "node1",
          "type": "extractor",
          "data": {"moduleId": "postgres-extractor"}
        }
      ],
      "edges": []
    },
    "tags": ["test"]
  }'
```

#### List Pipelines
```bash
curl http://localhost:8000/api/v1/pipelines \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

#### Validate Pipeline
```bash
curl -X POST http://localhost:8000/api/v1/pipelines/validate-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test",
    "config": {
      "nodes": [
        {"id": "1", "type": "extractor"},
        {"id": "2", "type": "loader"}
      ],
      "edges": [{"source": "1", "target": "2"}]
    }
  }'
```

Expected: `{"valid": true, "errors": [], "warnings": []}`

## Common Issues

### Issue: Frontend shows "No modules available"
**Solution:**
1. Check backend is running: `docker ps --filter "name=etl_backend"`
2. Check modules are seeded: `curl http://localhost:8000/api/v1/modules | jq .total`
3. If total is 0, seed modules: `curl -X POST http://localhost:8000/api/v1/modules/seed`
4. Check browser console for errors (F12)

### Issue: CORS errors in browser console
**Solution:**
1. Check `docker-compose.yml` CORS settings
2. Verify `VITE_API_URL` in frontend environment
3. Restart backend: `docker-compose restart backend`

### Issue: Cannot connect to backend
**Solution:**
1. Verify backend is healthy: `curl http://localhost:8000/health`
2. Check backend logs: `docker logs etl_backend`
3. Check network: `docker network inspect etl_network`

### Issue: PostgreSQL connection refused
**Solution:**
1. Check postgres is running: `docker ps --filter "name=etl_postgres"`
2. Verify port mapping: `docker port etl_postgres`
3. Test connection: `docker exec -it etl_postgres psql -U etl_user -d etl_builder`

### Issue: Module mapper errors
**Solution:**
1. Check API response format: `curl http://localhost:8000/api/v1/modules | jq '.modules[0]'`
2. Verify moduleMapper.ts handles all fields
3. Check browser console for mapping errors

## Performance Tests

### Load Test - List Modules
```bash
# 100 requests
for i in {1..100}; do
  curl -s http://localhost:8000/api/v1/modules > /dev/null
  echo "Request $i complete"
done
```

### Response Time Test
```bash
time curl -s http://localhost:8000/api/v1/modules > /dev/null
```
Expected: < 100ms

## Database Verification

### Connect to PostgreSQL
```bash
docker exec -it etl_postgres psql -U etl_user -d etl_builder
```

### Check Module Count
```sql
SELECT COUNT(*) FROM modules;
-- Expected: 14
```

### List Module Types
```sql
SELECT type, COUNT(*) FROM modules GROUP BY type;
-- Expected:
-- extractor | 8
-- transformer | 3
-- loader | 3
```

### View All Modules
```sql
SELECT name, display_name, type, category FROM modules ORDER BY type, display_name;
```

## Integration Flow Test

### Complete End-to-End Test

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Seed modules:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/modules/seed
   ```

3. **Open frontend:**
   - Navigate to http://localhost:3000
   - Click "Create Pipeline"

4. **Build pipeline:**
   - Drag PostgreSQL extractor to canvas
   - Configure: connection_id = "test", query = "SELECT * FROM users"
   - Drag Filter transformer to canvas
   - Configure: column = "status", operator = "==", value = "active"
   - Drag PostgreSQL loader to canvas
   - Configure: connection_id = "test", table = "active_users"
   - Connect: Extractor → Transformer → Loader

5. **Save pipeline:**
   - Click "Save Pipeline"
   - Enter name: "Active Users ETL"
   - Enter description: "Extract active users and load to new table"
   - Click "Save"

6. **Verify in database:**
   ```bash
   docker exec -it etl_postgres psql -U etl_user -d etl_builder \
     -c "SELECT name, status FROM pipelines WHERE name = 'Active Users ETL';"
   ```

7. **Test validation:**
   - Open saved pipeline
   - Delete the loader node
   - Click "Validate"
   - Should show error: "Pipeline must end with at least one loader"
   - Re-add loader
   - Click "Validate"
   - Should show: "✓ Pipeline is valid"

## Monitoring

### Watch Backend Logs
```bash
docker logs -f etl_backend
```

### Watch Frontend Logs
```bash
docker logs -f etl_frontend
```

### Watch All Services
```bash
docker-compose logs -f
```

### Check Container Resource Usage
```bash
docker stats
```

## Cleanup

### Restart All Services
```bash
docker-compose restart
```

### Clean Restart (Removes Data)
```bash
docker-compose down -v
docker-compose up -d
curl -X POST http://localhost:8000/api/v1/modules/seed
```

### Stop All Services
```bash
docker-compose down
```

## Success Criteria

- ✅ Backend health check responds
- ✅ 14 modules returned by API
- ✅ Frontend loads without errors
- ✅ Module palette displays all modules
- ✅ Modules can be dragged onto canvas
- ✅ Configuration panel opens on node click
- ✅ Configuration fields show correct types and defaults
- ✅ Pipelines can be saved to database
- ✅ Pipeline validation works correctly
- ✅ No hardcoded data in frontend

## Next Steps After Testing

1. Test pipeline execution functionality
2. Verify WebSocket connection for real-time updates
3. Test connection management UI
4. Verify Airflow integration
5. Test execution history and logs
6. Performance testing with large pipelines
7. Security testing (authentication, authorization)
8. Cross-browser testing

---

**Last Updated:** 2025-11-13
**Status:** Backend/Frontend integration complete and ready for testing
