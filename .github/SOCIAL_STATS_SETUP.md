# Configuration des Statistiques Social Media

Ce document explique comment configurer la récupération automatique des statistiques depuis GitHub, YouTube, et autres plateformes.

## 📊 Plateformes supportées

### ✅ GitHub (Fonctionne sans configuration)

- **Statistiques récupérées** : Followers, Repos publics, Following
- **API** : GitHub REST API (publique, rate limit: 60 req/h sans token)
- **Token optionnel** : `GITHUB_TOKEN` pour augmenter le rate limit (5000 req/h)

### ⚠️ YouTube (Nécessite une clé API)

- **Statistiques récupérées** : Abonnés, Vues totales, Nombre de vidéos
- **API** : YouTube Data API v3
- **Configuration requise** : `YOUTUBE_API_KEY`

### ⚠️ LinkedIn (Limité sans token)

- **Statistiques récupérées** : Headline, Location (via Open Graph), Connections (avec token)
- **Méthode 1** : Open Graph meta tags (limité, pas de stats détaillées)
- **Méthode 2** : LinkedIn API v2 (nécessite `LINKEDIN_ACCESS_TOKEN` OAuth)
- **Script dédié** : `pnpm run sync-linkedin` pour synchroniser le profil avec site.ts

### ✅ Omnivya (Fonctionne sans configuration)

- **Statistiques récupérées** : Statut du site web (accessible/offline), Followers LinkedIn (si API disponible)
- **Vérification** : Test d'accessibilité du site <www.omnivya.fr>
- **API** : Aucune API requise (vérification HTTP simple)

### ✅ Simplifi'ed (GitHub Organization)

- **Statistiques récupérées** : Nombre de repos publics, total d'étoiles, total de forks, top repos
- **API** : GitHub REST API (publique, même token que GitHub personnel)
- **Organisation** : `simplifi-ed` sur GitHub
- **Données détaillées** : Top 10 repos avec description, stars, forks, language, date de mise à jour

## 🔧 Configuration

### 1. GitHub Token (Optionnel mais recommandé)

1. Créer un Personal Access Token sur GitHub :

   - Aller sur <https://github.com/settings/tokens>
   - Générer un nouveau token (classic)
   - Permissions : `public_repo` (read-only)

2. Ajouter le token dans GitHub Actions :
   - Repository → Settings → Secrets and variables → Actions
   - Nouveau secret : `GITHUB_TOKEN`
   - Valeur : votre token

**Note** : Le script utilise automatiquement `GITHUB_TOKEN` de l'environnement GitHub Actions si disponible.

### 2. YouTube API Key (Optionnel)

1. Créer un projet sur Google Cloud Console :

   - Aller sur <https://console.cloud.google.com/>
   - Créer un nouveau projet
   - Activer l'API "YouTube Data API v3"

2. Créer une clé API :

   - APIs & Services → Credentials
   - Créer une clé API
   - (Optionnel) Restreindre la clé à YouTube Data API v3

3. Ajouter la clé dans GitHub Actions :
   - Repository → Settings → Secrets and variables → Actions
   - Nouveau secret : `YOUTUBE_API_KEY`
   - Valeur : votre clé API

### 3. LinkedIn Access Token (Optionnel, pour données complètes)

1. Créer une application LinkedIn :

   - Aller sur <https://www.linkedin.com/developers/apps>
   - Créer une nouvelle app
   - Obtenir les permissions : `r_liteprofile`, `r_emailaddress`

2. Générer un token OAuth :

   - Suivre le processus OAuth 2.0
   - Obtenir un access token

3. Ajouter le token dans GitHub Actions :
   - Repository → Settings → Secrets and variables → Actions
   - Nouveau secret : `LINKEDIN_ACCESS_TOKEN`
   - Valeur : votre token OAuth

**Note** : Sans token, le script utilise Open Graph (données limitées).

### 4. Local Development

Pour tester localement, créer un fichier `.env.local` :

```bash
GITHUB_TOKEN=your_github_token_here
YOUTUBE_API_KEY=your_youtube_api_key_here
LINKEDIN_ACCESS_TOKEN=your_linkedin_token_here
```

Puis charger les variables d'environnement avant d'exécuter le script :

```bash
export $(cat .env.local | xargs)
pnpm run fetch-social-stats
pnpm run sync-linkedin  # Pour synchroniser le profil LinkedIn avec site.ts
```

## 📝 Utilisation

### Scripts disponibles

**Récupérer les stats sociales** :

```bash
pnpm run fetch-social-stats
```

**Synchroniser le profil LinkedIn avec site.ts** :

```bash
pnpm run sync-linkedin
```

**Build complet (inclut fetch-social-stats)** :

```bash
pnpm run ci:build
```

### Fichier généré

Les statistiques sont sauvegardées dans :

- `src/data/social-stats.json`

### Utilisation dans les composants

```astro
---
import socialStats from "../data/social-stats.json";
---

<p>GitHub: {socialStats.github.followers} followers</p>
```

## 🔄 Mise à jour

Les statistiques sont mises à jour :

- **À chaque build** : Automatiquement lors du CI/CD
- **Manuellement** : Exécuter `pnpm run fetch-social-stats`

### Données récupérées

**GitHub** :

- Followers, repos publics, following
- Mise à jour à chaque build

**YouTube** :

- Abonnés, vues totales, nombre de vidéos
- Nécessite `YOUTUBE_API_KEY`

**Omnivya** :

- Statut du site web (accessible ✅ / offline ❌)
- Vérification automatique de <www.omnivya.fr>
- Mise à jour à chaque build

## ⚠️ Limitations

1. **Rate Limits** :

   - GitHub : 60 req/h sans token, 5000 req/h avec token
   - YouTube : 10,000 units/jour (gratuit)

2. **Données en cache** :

   - Les stats sont mises à jour uniquement au build
   - Pour des stats en temps réel, utiliser une API côté client

3. **LinkedIn** :
   - Pas d'API publique disponible
   - Nécessiterait OAuth et consentement utilisateur

## 🐛 Dépannage

### GitHub stats ne se chargent pas

- Vérifier que le username est correct dans `fetch-social-stats.mjs`
- Vérifier le rate limit : <https://api.github.com/rate_limit>

### YouTube stats ne se chargent pas

- Vérifier que `YOUTUBE_API_KEY` est défini
- Vérifier que l'API est activée dans Google Cloud Console
- Vérifier les quotas : <https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas>

### Erreurs de build

- Le script continue même en cas d'erreur (`continue-on-error: true`)
- Les valeurs par défaut (0) sont utilisées si les APIs échouent
