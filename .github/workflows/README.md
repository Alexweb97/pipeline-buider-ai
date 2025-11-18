# GitHub Actions Workflows

Ce dossier contient les workflows CI/CD pour le projet LogiData AI Pipeline Builder.

## Workflows disponibles

### 1. CI (`.github/workflows/ci.yml`)
**Déclenchement**: Push ou PR sur `main` ou `develop`

Workflow principal qui orchestre les autres workflows en fonction des fichiers modifiés.

### 2. Backend CI (`.github/workflows/backend-ci.yml`)
**Déclenchement**: Modifications dans `backend/**`

- Lint du code Python avec `flake8`
- Tests unitaires avec `pytest`
- Couverture de code avec `pytest-cov`
- Upload des rapports de couverture vers Codecov

**Prérequis**:
- Base de données PostgreSQL 15
- Python 3.11

### 3. Frontend CI (`.github/workflows/frontend-ci.yml`)
**Déclenchement**: Modifications dans `frontend/**`

- Installation des dépendances avec `npm ci`
- Lint du code (si configuré)
- Vérification des types TypeScript
- Tests unitaires (si configurés)
- Build de production

**Prérequis**:
- Node.js 20

### 4. Docker Compose Test (`.github/workflows/docker-compose-test.yml`)
**Déclenchement**: Modifications dans les Dockerfiles ou docker-compose.yml

- Build des images Docker
- Démarrage des services
- Vérification de la santé des services
- Tests d'intégration

### 5. Docker Build & Push (`.github/workflows/docker-build.yml`)
**Déclenchement**: Push sur `main` ou tags `v*`

- Build des images Docker pour backend et frontend
- Push vers GitHub Container Registry (ghcr.io)
- Tagging automatique basé sur les branches/tags

**Images produites**:
- `ghcr.io/<owner>/<repo>/backend:latest`
- `ghcr.io/<owner>/<repo>/frontend:latest`

## Configuration requise

### Secrets GitHub
Aucun secret supplémentaire n'est requis. Les workflows utilisent `GITHUB_TOKEN` qui est automatiquement fourni.

### Badges de statut

Ajoutez ces badges dans votre README.md principal:

```markdown
![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)
![Backend CI](https://github.com/<owner>/<repo>/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/<owner>/<repo>/actions/workflows/frontend-ci.yml/badge.svg)
![Docker](https://github.com/<owner>/<repo>/actions/workflows/docker-build.yml/badge.svg)
```

## Déploiement

### Déploiement automatique

Pour activer le déploiement automatique après un push sur `main`:

1. Créer un workflow de déploiement (voir exemple ci-dessous)
2. Configurer les secrets nécessaires dans GitHub
3. Le déploiement se fera automatiquement après le succès des tests

### Exemple de workflow de déploiement

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [backend-ci, frontend-ci, docker-build]

    steps:
    - name: Deploy to production
      run: |
        # Vos commandes de déploiement ici
        echo "Deploying to production..."
```

## Développement local

Pour tester les workflows localement, utilisez [act](https://github.com/nektos/act):

```bash
# Installer act
brew install act  # macOS
# ou
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Tester un workflow
act -W .github/workflows/backend-ci.yml

# Tester avec un événement spécifique
act push -W .github/workflows/ci.yml
```

## Maintenance

### Mise à jour des dépendances des Actions

Les workflows utilisent des versions spécifiques des GitHub Actions. Pour les mettre à jour:

1. Vérifier les dernières versions sur le [GitHub Marketplace](https://github.com/marketplace?type=actions)
2. Mettre à jour les versions dans les workflows
3. Tester localement avec `act`
4. Créer une PR avec les mises à jour

### Optimisation des temps de build

- Les workflows utilisent le cache pour `pip` et `npm`
- Les images Docker peuvent être mises en cache avec `docker/build-push-action`
- Les tests peuvent être parallélisés si nécessaire
