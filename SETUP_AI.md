# Configuration de l'AI Assistant - Setup Rapide

> **Note :** L'application fonctionne normalement sans configuration AI. Cette fonctionnalité est **optionnelle** et ne sera active que si vous configurez une clé API OpenAI.

## 🚀 Démarrage Rapide

### 1. Obtenir une clé API OpenAI

1. Visitez [platform.openai.com](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans **API Keys** dans le menu
4. Cliquez sur **"Create new secret key"**
5. Copiez la clé (elle commence par `sk-...`)

### 2. Configurer le Backend

Ajoutez votre clé dans `backend/.env` :

```bash
# AI/ML Services
OPENAI_API_KEY=sk-votre-cle-ici
```

### 3. Installer les Dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 4. Redémarrer le Backend

```bash
# Si vous utilisez Docker
docker-compose restart backend

# Ou si vous lancez directement
cd backend
uvicorn app.main:app --reload
```

### 5. Tester la Fonctionnalité

1. Ouvrez l'application frontend : `http://localhost:3000`
2. Connectez-vous
3. Allez dans **Pipeline Builder**
4. Cliquez sur **"AI Assistant"**
5. Essayez un prompt : "Créer un pipeline qui lit un CSV et sauvegarde en JSON"

## ✅ Vérification

Pour vérifier que tout fonctionne :

```bash
# Test rapide de l'API
curl -X POST http://localhost:8000/api/v1/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"prompt": "Create a simple CSV to JSON pipeline"}'
```

## 💰 Coûts

**GPT-4o-mini** est très économique :
- ~$0.0003 par génération de pipeline
- ~$0.0005 par amélioration
- ~$0.0002 par explication

**En développement :** Les coûts sont négligeables (< $1/mois)

## 🔒 Sécurité

⚠️ **Important :**
- Ne committez JAMAIS votre clé API dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- En production, utilisez des secrets managers (AWS Secrets, Azure Key Vault, etc.)

## 📚 Documentation Complète

Pour plus de détails, consultez [AI_ASSISTANT_GUIDE.md](./AI_ASSISTANT_GUIDE.md)

## 🐛 Problèmes Courants

### "Failed to generate pipeline"
- Vérifiez que `OPENAI_API_KEY` est bien défini dans `.env`
- Vérifiez que votre clé est valide sur platform.openai.com
- Vérifiez les logs backend : `docker-compose logs backend`

### "OpenAI API key not configured"
C'est le message attendu si vous n'avez pas configuré de clé API. L'application fonctionne normalement, seules les fonctionnalités AI sont désactivées. Pour activer l'AI Assistant, suivez les étapes ci-dessus pour obtenir et configurer une clé API OpenAI.

### "Module 'openai' not found"
```bash
cd backend
pip install -r requirements.txt
```

### Le backend ne redémarre pas
```bash
# Force rebuild
docker-compose down
docker-compose up --build
```

## 🎯 Exemples de Prompts

**Simples :**
- "Lire un CSV et sauvegarder en JSON"
- "Extraire depuis une API REST et charger en base"

**Intermédiaires :**
- "Récupérer des données de l'API GitHub, filtrer les repos avec plus de 100 stars, et sauvegarder en CSV"
- "Lire un Excel, supprimer les doublons, et charger dans PostgreSQL"

**Avancés :**
- "Extraire des utilisateurs depuis PostgreSQL, joindre avec la table orders, agréger les ventes par mois, et sauvegarder en JSON"

## ✨ Prêt à utiliser !

Vous pouvez maintenant générer des pipelines avec l'IA ! 🎉
