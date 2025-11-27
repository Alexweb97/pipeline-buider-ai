# AI Pipeline Assistant - Guide d'Utilisation

## Vue d'ensemble

L'AI Pipeline Assistant est une fonctionnalité qui utilise GPT-4o-mini d'OpenAI pour générer, améliorer et expliquer des pipelines ETL/ELT en langage naturel.

## Configuration

### 1. Ajouter votre clé API OpenAI

Dans le fichier `backend/.env`, ajoutez votre clé API :

```bash
OPENAI_API_KEY=sk-votre-cle-api-openai
```

### 2. Installer les dépendances Python

```bash
cd backend
pip install -r requirements.txt
```

Les nouvelles dépendances ajoutées :
- `openai==1.10.0` - Client OpenAI officiel
- `langchain==0.1.5` - Framework pour applications LLM
- `langchain-openai==0.0.5` - Intégration OpenAI pour LangChain

## Fonctionnalités

### 1. Générer un Pipeline

**Utilisation :**
1. Ouvrez le Pipeline Builder
2. Cliquez sur le bouton **"AI Assistant"** dans la barre d'outils
3. Dans l'onglet **"Generate New"**, décrivez votre pipeline en français ou anglais
4. Cliquez sur **"Generate Pipeline"**

**Exemples de prompts :**
- "Créer un pipeline qui récupère des données depuis l'API GitHub, filtre les repositories avec plus de 100 stars, et sauvegarde en CSV"
- "Extraire des données d'une base PostgreSQL, transformer les dates, et charger dans MySQL"
- "Lire un fichier Excel, supprimer les doublons, et exporter en JSON"
- "Récupérer des données d'une API REST, agréger par catégorie, et sauvegarder dans une base de données"

**Le système génère automatiquement :**
- Nom et description du pipeline
- Nœuds configurés (extractors, transformers, loaders)
- Connexions entre les nœuds
- Positionnement visuel sur le canvas

### 2. Améliorer un Pipeline Existant

**Utilisation :**
1. Créez ou ouvrez un pipeline existant
2. Cliquez sur **"AI Assistant"**
3. Dans l'onglet **"Improve"**, décrivez les améliorations souhaitées
4. Cliquez sur **"Improve Pipeline"**

**Exemples de requêtes d'amélioration :**
- "Ajouter une étape de nettoyage des données avant le chargement"
- "Ajouter une transformation pour filtrer les valeurs nulles"
- "Ajouter un agrégateur pour calculer des statistiques"

### 3. Expliquer un Pipeline

**Utilisation :**
1. Ouvrez un pipeline existant
2. Cliquez sur **"AI Assistant"**
3. Dans l'onglet **"Explain"**, cliquez sur **"Explain Pipeline"**
4. Lisez l'explication en langage naturel

**L'explication inclut :**
- Vue d'ensemble du pipeline
- Description de chaque étape
- Résultat final produit

## Architecture Technique

### Backend

**Service AI (`app/services/ai_service.py`) :**
- `generate_pipeline()` : Génère un pipeline depuis une description textuelle
- `improve_pipeline()` : Améliore un pipeline existant
- `explain_pipeline()` : Explique un pipeline en langage naturel

**Endpoints API (`app/api/v1/ai.py`) :**
- `POST /api/v1/ai/generate` : Génération de pipeline
- `POST /api/v1/ai/improve` : Amélioration de pipeline
- `POST /api/v1/ai/explain` : Explication de pipeline

**Schemas (`app/schemas/ai.py`) :**
- Validation des requêtes et réponses avec Pydantic
- Types stricts pour les configurations de pipeline

### Frontend

**Client API (`frontend/src/api/ai.ts`) :**
- Interface TypeScript pour les appels API
- Gestion des erreurs et typage fort

**Composant Modal (`frontend/src/components/AIAssistantModal.tsx`) :**
- Interface utilisateur avec 3 onglets
- Gestion des états de chargement et erreurs
- Prompts d'exemple pour guider l'utilisateur

**Intégration (`frontend/src/pages/PipelineBuilderPage.tsx`) :**
- Bouton "AI Assistant" dans la barre d'outils
- Application automatique des configurations générées
- Synchronisation avec le canvas React Flow

## Modules Supportés

### Extractors (Sources de données)
- `rest-api-extractor` : API REST
- `database-extractor` : Bases de données
- `csv-extractor` : Fichiers CSV
- `json-extractor` : Fichiers JSON
- `excel-extractor` : Fichiers Excel

### Transformers (Traitement)
- `filter-transformer` : Filtrage de lignes
- `aggregate-transformer` : Agrégation de données
- `join-transformer` : Jointure de datasets
- `python-transformer` : Code Python personnalisé
- `clean-transformer` : Nettoyage de données
- `deduplicate-transformer` : Suppression de doublons

### Loaders (Destinations)
- `database-loader` : Chargement en base de données
- `csv-loader` : Export CSV
- `json-loader` : Export JSON
- `api-loader` : Envoi vers API

## Coûts et Utilisation

**Modèle utilisé :** GPT-4o-mini
- Coût approximatif : ~$0.15 pour 1 million de tokens d'entrée
- Coût approximatif : ~$0.60 pour 1 million de tokens de sortie

**Consommation typique par requête :**
- Génération de pipeline : ~1,000-2,000 tokens (~$0.0003 par génération)
- Amélioration de pipeline : ~1,500-3,000 tokens (~$0.0005 par amélioration)
- Explication de pipeline : ~500-1,000 tokens (~$0.0002 par explication)

**Recommandations :**
- En développement : Utilisez librement, les coûts sont négligeables
- En production : Considérez l'ajout de rate limiting par utilisateur
- Surveillance : Monitorer les coûts dans la console OpenAI

## Bonnes Pratiques

### Pour obtenir de meilleurs résultats :

1. **Soyez spécifique dans vos prompts**
   - ❌ "Créer un pipeline ETL"
   - ✅ "Extraire des données utilisateurs depuis une API REST, filtrer les comptes actifs, et charger dans PostgreSQL"

2. **Mentionnez les formats et sources**
   - "Lire un fichier CSV avec délimiteur ';'"
   - "Extraire depuis PostgreSQL, table 'users'"
   - "Sauvegarder en JSON avec orientation 'records'"

3. **Décrivez les transformations clairement**
   - "Supprimer les lignes avec des valeurs nulles dans la colonne 'email'"
   - "Agréger par 'category' et calculer la somme de 'amount'"
   - "Joindre avec la table 'products' sur la clé 'product_id'"

4. **Itérez avec l'amélioration**
   - Commencez avec un pipeline simple
   - Utilisez "Improve" pour ajouter des fonctionnalités progressivement
   - Testez chaque itération avant d'ajouter plus de complexité

## Limitations Actuelles

1. **Contexte limité** : Le modèle ne peut pas voir vos bases de données ou fichiers réels
2. **Validation** : Les configurations générées doivent être vérifiées manuellement
3. **Modules customs** : Seuls les modules prédéfinis sont supportés
4. **Complexité** : Les pipelines très complexes peuvent nécessiter des ajustements manuels

## Prochaines Étapes Possibles

### Phase 2 - Améliorations :
1. **Génération de code Python personnalisé** pour les transformers
2. **Analyse d'erreurs** - Diagnostiquer les échecs d'exécution
3. **Suggestions proactives** - Recommandations d'optimisation
4. **Validation automatique** - Vérifier la validité des configurations

### Phase 3 - Fonctionnalités avancées :
1. **Dashboard Assistant** - Générer des dashboards depuis des questions
2. **Chat Data Analyst** - Interface conversationnelle pour l'analyse de données
3. **Auto-cleanup** - Détection et correction automatique des problèmes de qualité
4. **Documentation auto** - Génération de documentation technique

## Support et Dépannage

### Erreur : "Failed to generate pipeline"
- Vérifiez que votre clé API OpenAI est valide
- Vérifiez que le service backend est démarré
- Consultez les logs backend pour plus de détails

### Les configurations générées sont incorrectes
- Affinez votre prompt avec plus de détails
- Utilisez l'onglet "Improve" pour corriger
- Ajustez manuellement les configurations si nécessaire

### Le modal ne s'ouvre pas
- Vérifiez la console browser pour les erreurs
- Vérifiez que les dépendances frontend sont installées
- Redémarrez le serveur de développement frontend

## Contact et Contribution

Pour toute question ou suggestion :
- Créez une issue sur le repository
- Consultez la documentation OpenAI pour les capacités du modèle
- Référez-vous aux exemples de prompts dans le modal

---

**Note :** Cette fonctionnalité est en phase Beta. Vos retours sont essentiels pour l'améliorer !
