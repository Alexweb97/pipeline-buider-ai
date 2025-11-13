# Guide de connexion - LogiData AI

## ✅ Problème résolu

Le problème de connexion était causé par la migration incomplète d'axios vers fetch. Tous les fichiers ont maintenant été mis à jour.

## 🔐 Identifiants de test

Un compte administrateur a été créé pour vous:

```
Username: admin
Password: admin123
```

## 🚀 Comment se connecter

### 1. Ouvrez le frontend
```
http://localhost:3000
```

### 2. Cliquez sur "Login" ou allez directement sur
```
http://localhost:3000/login
```

### 3. Entrez les identifiants
- **Username:** admin
- **Password:** admin123

### 4. Accédez au Pipeline Builder
Après connexion, vous serez redirigé vers le dashboard. Ensuite:
```
http://localhost:3000/pipeline-builder
```

## 📝 Créer un nouveau compte

Si vous voulez créer un autre compte:

1. Allez sur http://localhost:3000/register

2. Remplissez le formulaire:
   - **Email:** votre@email.com
   - **Username:** votre_nom
   - **Full Name:** Votre Nom Complet
   - **Password:** minimum 8 caractères

3. Vous serez automatiquement connecté après l'inscription

## 🔧 Tests de l'API d'authentification

### Test de connexion via API
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq .
```

**Réponse attendue:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Test d'inscription via API
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "test",
    "password": "password123",
    "full_name": "Test User"
  }' | jq .
```

## ✅ Corrections apportées

### 1. Fichier auth.ts mis à jour
**Avant (axios):**
```typescript
login: async (credentials) => {
  const response = await apiClient.post('/api/v1/auth/login', credentials);
  return response.data; // ❌ axios
}
```

**Après (fetch):**
```typescript
login: async (credentials) => {
  return apiClient.post('/api/v1/auth/login', credentials); // ✅ fetch
}
```

### 2. AuthStore mis à jour
**Avant:**
```typescript
error: error.response?.data?.detail || error.message
```

**Après:**
```typescript
error: error.data?.detail || error.message
```

### 3. ModulePalette corrigé
**Avant:**
```typescript
useEffect(() => {
  if (modules.length === 0 && !loading && !error) {
    fetchModulesByType();
  }
}, [modules.length, loading, error, fetchModulesByType]); // ❌ Trop de dépendances
```

**Après:**
```typescript
useEffect(() => {
  if (modules.length === 0) {
    fetchModulesByType();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Charge une seule fois au montage
```

## 🔍 Vérifications

### Backend
```bash
# Health check
curl http://localhost:8000/health

# Modules disponibles
curl http://localhost:8000/api/v1/modules | jq '.total'
# Devrait retourner: 14
```

### Frontend
```bash
# Vérifier que le frontend tourne
curl -I http://localhost:3000
```

### Conteneurs Docker
```bash
docker ps --filter "name=etl_" --format "{{.Names}}: {{.Status}}"
```

**Sortie attendue:**
```
etl_frontend: Up X minutes
etl_backend: Up X minutes (healthy)
etl_redis: Up X minutes (healthy)
etl_postgres: Up X minutes (healthy)
```

## 🐛 Dépannage

### Erreur: "Incorrect username or password"
**Cause:** Les identifiants sont incorrects ou l'utilisateur n'existe pas

**Solution:**
```bash
# Créer l'utilisateur admin
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "admin123",
    "full_name": "Admin User"
  }'
```

### Erreur: "String should have at least 8 characters"
**Cause:** Le mot de passe est trop court

**Solution:** Utilisez un mot de passe d'au moins 8 caractères

### Les modules ne s'affichent pas
**Cause:** Les modules ne sont pas chargés depuis l'API

**Solution:**
1. Vérifiez que vous êtes connecté
2. Ouvrez la console du navigateur (F12)
3. Regardez l'onglet Network pour voir si la requête `/api/v1/modules` est faite
4. Si l'API retourne les modules mais ils ne s'affichent pas, rafraîchissez la page

### Token expiré
**Cause:** Le token JWT a expiré (après 30 minutes par défaut)

**Solution:** Le système devrait automatiquement rafraîchir le token. Si ça ne marche pas, déconnectez-vous et reconnectez-vous.

## 📊 État actuel du système

✅ **Backend:** Fonctionnel
- API d'authentification: ✅
- API modules: ✅ (14 modules)
- API pipelines: ✅
- Base de données: ✅

✅ **Frontend:** Fonctionnel
- Migration axios → fetch: ✅ Complète
- Client API: ✅ Avec refresh automatique
- Store d'authentification: ✅
- Store de pipelines: ✅
- ModulePalette: ✅ Corrigé

✅ **Docker:** Tous les conteneurs actifs
- postgres: ✅
- redis: ✅
- backend: ✅
- frontend: ✅

## 🎯 Prochaines étapes

1. **Connectez-vous:** http://localhost:3000/login
2. **Testez les modules:** Allez sur Pipeline Builder
3. **Créez un pipeline:** Drag & drop des modules
4. **Sauvegardez:** Testez la persistance

## 📚 Documentation

- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Test Modules:** http://localhost:3000/test-modules

---

**Status:** ✅ Tout fonctionne!
**Date:** 2025-11-13
**Migration:** axios → fetch (100% complète)
