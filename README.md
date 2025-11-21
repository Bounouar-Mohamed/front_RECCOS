# 🚀 Frontend RECCOS

Frontend Next.js pour la plateforme RECCOS.

## 🌿 Branches

- **`main`** → Production (`reccos.ae`) - Déploiement automatique
- **`develop`** → Développement - Branche de travail pour l'équipe

## 🚀 Déploiement Automatique

Chaque push sur `main` déclenche automatiquement le déploiement sur `reccos.ae` via GitHub Actions.

### Configuration Requise

1. **Configurer les secrets GitHub** (voir `SETUP-GITHUB-SECRETS.md`)
2. **Workflow automatique** : Push sur `main` → Déploiement auto

## 📚 Documentation

- **`WORKFLOW.md`** - Guide complet du workflow de développement
- **`SETUP-GITHUB-SECRETS.md`** - Configuration des secrets GitHub
- **`.github/workflows/README.md`** - Documentation GitHub Actions

## 🛠️ Développement Local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm run start
```

## ⚠️ Important

**Ne JAMAIS lancer `npm run dev` dans `/srv/all4one/frontend` quand la production tourne !**

Le script `.dev-protection.sh` empêche cela automatiquement.

## 🔄 Workflow

1. Développer sur `develop` ou une branche feature
2. Créer une Pull Request : `develop` → `main`
3. Merger la PR → Déploiement automatique sur `reccos.ae`

Voir `WORKFLOW.md` pour plus de détails.
