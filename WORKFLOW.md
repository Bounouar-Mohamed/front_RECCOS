# 🌿 Workflow de Développement Professionnel

## 📋 Branches

- **`main`** → Production (`reccos.ae`)
  - ✅ Déploiement automatique via GitHub Actions
  - ✅ Protection : Pull Request obligatoire depuis `develop`
  - ✅ Code testé et validé uniquement

- **`develop`** → Branche de développement
  - ✅ Branche de travail pour toute l'équipe
  - ✅ Merge libre entre développeurs
  - ✅ Tests et validation avant merge vers `main`

## 🚀 Workflow Complet

### 1. Développement d'une Feature

```bash
# Se placer sur develop
git checkout develop
git pull origin develop

# Créer une branche feature
git checkout -b feature/ma-nouvelle-feature

# Développer...
# ... faire tes modifications ...

# Commit et push
git add .
git commit -m "feat: ajout de ma nouvelle feature"
git push origin feature/ma-nouvelle-feature

# Créer une Pull Request sur GitHub : feature → develop
```

### 2. Merge vers Develop

```bash
# Sur GitHub, créer une PR : feature/ma-nouvelle-feature → develop
# Après review et validation, merger la PR
```

### 3. Déploiement en Production

```bash
# Créer une Pull Request : develop → main
# Sur GitHub, créer la PR et la reviewer

# Une fois mergée, GitHub Actions déploie automatiquement sur reccos.ae
# ✅ Pas besoin de faire quoi que ce soit, tout est automatique !
```

## 🔄 Déploiement Automatique

### Quand ça se déclenche ?

- ✅ **Push sur `main`** → Déploiement automatique sur `reccos.ae`
- ✅ **Workflow Dispatch** → Déploiement manuel depuis GitHub Actions

### Ce qui se passe automatiquement :

1. ✅ GitHub Actions build le frontend
2. ✅ Se connecte au VPS via SSH
3. ✅ Pull le code depuis `main`
4. ✅ Installe les dépendances (`npm ci`)
5. ✅ Build avec les variables de production
6. ✅ Redémarre PM2 (`reccos-frontend`)
7. ✅ Vérifie que le site répond (health check)

## 🛡️ Protection de Branche

### Configuration Recommandée sur GitHub

**Settings → Branches → Add rule pour `main` :**

- ✅ Require a pull request before merging
- ✅ Require approvals (1 minimum)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

Cela garantit que :
- ✅ Aucun code ne va directement sur `main`
- ✅ Toutes les modifications passent par une PR
- ✅ Le code est reviewé avant déploiement

## 📝 Convention de Commits

Utilise des messages de commit clairs :

```
feat: ajout du système de recherche
fix: correction du bug de connexion
refactor: amélioration de la structure du code
docs: mise à jour de la documentation
style: correction du formatage
test: ajout de tests unitaires
chore: mise à jour des dépendances
```

## ✅ Checklist avant Merge vers Main

- [ ] Code reviewé par au moins une personne
- [ ] Tests passent (si tu as des tests)
- [ ] Pas d'erreurs de lint
- [ ] Variables d'environnement vérifiées
- [ ] Documentation mise à jour si nécessaire

## 🚨 En Cas de Problème

### Rollback Rapide

```bash
# Sur le VPS
cd /srv/all4one/frontend
git revert HEAD
git push origin main
# GitHub Actions redéploiera automatiquement
```

### Déploiement Manuel (si nécessaire)

```bash
# Sur le VPS
cd /srv/all4one/frontend
./scripts/deploy.sh
```

## 📚 Ressources

- `.github/workflows/README.md` - Configuration GitHub Actions
- `.github/workflows/deploy-production.yml` - Workflow de déploiement
- `scripts/deploy.sh` - Script de déploiement

