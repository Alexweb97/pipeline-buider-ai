# Debug: Modules ne s'affichent pas dans Pipeline Builder

## État actuel

- ✅ Backend fonctionne: http://localhost:8000/health
- ✅ API modules retourne 14 modules: http://localhost:8000/api/v1/modules
- ✅ Frontend compile sans erreurs
- ❌ Les modules ne s'affichent pas dans le Pipeline Builder

## Tests à effectuer

### 1. Page de test des modules

J'ai créé une page de diagnostic spéciale pour tester le chargement des modules.

**Accéder à la page:**
```
http://localhost:3000/test-modules
```

Cette page va:
- Afficher le statut de chargement (loading, error)
- Montrer le nombre de modules chargés
- Afficher les modules bruts de l'API
- Afficher les modules mappés pour le frontend
- Montrer des informations de debug détaillées

### 2. Test de l'API directement

Ouvrez la console du navigateur (F12) et testez:

```javascript
fetch('http://localhost:8000/api/v1/modules')
  .then(res => res.json())
  .then(data => console.log('Modules:', data))
  .catch(err => console.error('Error:', err));
```

### 3. Vérifier les erreurs CORS

Dans la console du navigateur (F12), cherchez des erreurs comme:
```
Access to fetch at 'http://localhost:8000/api/v1/modules' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

### 4. Vérifier l'état du store Zustand

Dans la console du navigateur:

```javascript
// Obtenir l'état actuel du store
const state = window.__ZUSTAND_STORE__;
console.log('Store state:', state);
```

## Solutions possibles

### Solution 1: Problème d'authentification

Si les modules nécessitent une authentification, vous devez d'abord vous connecter:

1. Allez sur http://localhost:3000/login
2. Créez un compte ou connectez-vous
3. Ensuite allez sur http://localhost:3000/pipeline-builder

### Solution 2: Problème CORS

Si vous voyez des erreurs CORS, vérifiez la configuration dans `docker-compose.yml`:

```yaml
environment:
  - CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
```

Puis redémarrez le backend:
```bash
docker-compose restart backend
```

### Solution 3: ModulePalette ne charge pas les modules

Le composant `ModulePalette` a un useEffect qui peut avoir des problèmes. Vérifiez:

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Console
3. Regardez s'il y a des erreurs JavaScript
4. Vérifiez les appels réseau dans l'onglet Network

### Solution 4: Le frontend n'appelle pas l'API

Vérifiez dans l'onglet Network des DevTools:
1. Filtrez par XHR/Fetch
2. Vérifiez s'il y a une requête vers `/api/v1/modules`
3. Si non, le useEffect ne se déclenche pas
4. Si oui mais erreur 401, c'est un problème d'authentification

## Commandes utiles

### Voir les logs en temps réel
```bash
# Backend
docker logs -f etl_backend

# Frontend
docker logs -f etl_frontend
```

### Redémarrer les services
```bash
# Redémarrer le backend
docker-compose restart backend

# Redémarrer le frontend
docker-compose restart frontend

# Redémarrer tout
docker-compose restart
```

### Vérifier que les modules sont dans la DB
```bash
curl http://localhost:8000/api/v1/modules | jq '.total'
# Devrait retourner: 14
```

### Tester l'API depuis le conteneur frontend
```bash
docker exec etl_frontend wget -q -O- http://etl_backend:8000/api/v1/modules | head -20
```

## Prochaines étapes

1. **Ouvrir http://localhost:3000/test-modules dans votre navigateur**
2. Vérifier ce qui s'affiche
3. Ouvrir la console (F12) pour voir les logs
4. Me dire ce que vous voyez:
   - Combien de modules sont chargés?
   - Y a-t-il des erreurs dans la console?
   - Le statut affiche "Loading: Yes" ou "Loading: No"?
   - Y a-t-il des erreurs réseau dans l'onglet Network?

## Informations pour le debug

### URLs importantes
- Frontend: http://localhost:3000
- Test modules: http://localhost:3000/test-modules
- Pipeline Builder: http://localhost:3000/pipeline-builder
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Modules endpoint: http://localhost:8000/api/v1/modules

### Configuration actuelle
- API_URL dans le frontend: `http://localhost:8000`
- Base de données: PostgreSQL sur port 5433
- 14 modules seeded dans la base de données

### Fichiers modifiés
- ✅ `frontend/src/pages/TestModules.tsx` - Page de test créée
- ✅ `frontend/src/App.tsx` - Route `/test-modules` ajoutée
- ✅ `backend/app/api/v1/modules.py` - Endpoint de seed ajouté

---

**Que faire maintenant?**

1. Ouvrez votre navigateur
2. Allez sur: http://localhost:3000/test-modules
3. Regardez ce qui s'affiche
4. Ouvrez la console du navigateur (F12)
5. Dites-moi ce que vous voyez!
