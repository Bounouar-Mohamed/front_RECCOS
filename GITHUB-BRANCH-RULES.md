# 🛡️ Configuration des Branch Rulesets GitHub

## 📋 Configuration Recommandée pour `main` (Production)

### Accès au Settings
1. Va sur : `https://github.com/Bounouar-Mohamed/front_RECCOS/settings/rules`
2. Clique sur **"New ruleset"** ou **"Add rule"**

### Paramètres pour la Branche `main`

#### 1. **Ruleset name**
```
Production Protection
```

#### 2. **Target branches**
- ✅ **Branch name pattern** : `main`
- ✅ **Include matching branches**

#### 3. **Rules**

##### ✅ **Require a pull request before merging**
- ✅ **Required approvals** : `1` (minimum)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** : (optionnel, si tu as un fichier CODEOWNERS)
- ✅ **Restrict who can dismiss pull request reviews** : (optionnel)

##### ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Status checks that are required** :
  - `build` (si tu as un workflow de build)
  - `deploy-production` (si tu veux forcer le workflow de déploiement)

##### ✅ **Require conversation resolution before merging**
- ✅ **Require all conversations on code to be resolved before merging**

##### ✅ **Require linear history**
- ✅ **Prevent merge commits from being pushed to matching branches**

##### ✅ **Require deployments to succeed before merging**
- (Optionnel, si tu veux forcer que le déploiement réussisse)

##### ✅ **Lock branch**
- ❌ **Ne PAS activer** (sinon personne ne pourra push)

##### ✅ **Do not allow bypassing the above settings**
- ✅ **Do not allow bypassing the above settings** (Important !)

##### ✅ **Restrict who can push to matching branches**
- ✅ **Restrict pushes that create files larger than** : `100 MB` (recommandé)
- ✅ **Restrict pushes that create files that match** : (optionnel, ex: `*.log`, `*.env`)

##### ✅ **Require signed commits**
- (Optionnel, pour plus de sécurité)

##### ✅ **Require pull requests to be up to date before merging**
- ✅ **Require branches to be up to date before merging**

#### 4. **Bypass list** (Optionnel)
- Tu peux ajouter des utilisateurs/organisations qui peuvent bypass ces règles (ex: admins)
- **Recommandation** : Ne pas ajouter de bypass pour `main` (sécurité maximale)

#### 5. **Apply to**
- ✅ **All repositories** (si tu veux appliquer à tous les repos)
- ✅ **Selected repositories** : `front_RECCOS` (si tu veux juste ce repo)

---

## 📋 Configuration Recommandée pour `develop` (Développement)

### Paramètres pour la Branche `develop`

#### 1. **Ruleset name**
```
Development Protection
```

#### 2. **Target branches**
- ✅ **Branch name pattern** : `develop`
- ✅ **Include matching branches**

#### 3. **Rules** (Moins strictes que `main`)

##### ✅ **Require a pull request before merging** (Optionnel)
- ⚠️ **Moins strict** : Tu peux permettre les merges directs entre développeurs
- Ou activer avec **Required approvals** : `0` (juste pour traçabilité)

##### ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- (Optionnel pour develop)

##### ❌ **Require conversation resolution** : Désactivé
- (Moins strict pour develop)

##### ❌ **Require linear history** : Désactivé
- (Permet les merge commits sur develop)

##### ✅ **Do not allow bypassing the above settings**
- ✅ **Do not allow bypassing the above settings**

##### ✅ **Restrict who can push to matching branches**
- ✅ **Restrict pushes that create files larger than** : `100 MB`

#### 4. **Bypass list**
- Tu peux ajouter les admins si nécessaire

---

## 🎯 Configuration Complète Recommandée (Copier-Coller)

### Pour `main` (Production) - Configuration Maximale

```
Ruleset name: Production Protection

Target branches:
  Pattern: main
  Include matching branches: ✅

Rules:
  ✅ Require a pull request before merging
     - Required approvals: 1
     - Dismiss stale approvals: ✅
     - Require branches to be up to date: ✅
  
  ✅ Require status checks to pass
     - Require branches to be up to date: ✅
  
  ✅ Require conversation resolution: ✅
  
  ✅ Require linear history: ✅
  
  ✅ Do not allow bypassing: ✅
  
  ✅ Restrict file size: 100 MB
```

### Pour `develop` (Développement) - Configuration Légère

```
Ruleset name: Development Protection

Target branches:
  Pattern: develop
  Include matching branches: ✅

Rules:
  ✅ Require a pull request before merging (optionnel)
     - Required approvals: 0 (juste pour traçabilité)
  
  ✅ Do not allow bypassing: ✅
  
  ✅ Restrict file size: 100 MB
```

---

## 📝 Étapes Détaillées dans GitHub

### 1. Créer le Ruleset pour `main`

1. **Settings** → **Rules** → **New ruleset**
2. **Ruleset name** : `Production Protection`
3. **Target branches** :
   - Sélectionne **"Branch name pattern"**
   - Entre : `main`
4. **Rules** :
   - ✅ Coche **"Require a pull request before merging"**
     - Met **"Required approvals"** à `1`
     - ✅ Coche **"Dismiss stale pull request approvals when new commits are pushed"**
     - ✅ Coche **"Require branches to be up to date before merging"**
   - ✅ Coche **"Require status checks to pass before merging"**
     - ✅ Coche **"Require branches to be up to date before merging"**
   - ✅ Coche **"Require conversation resolution before merging"**
   - ✅ Coche **"Require linear history"**
   - ✅ Coche **"Do not allow bypassing the above settings"**
   - ✅ Coche **"Restrict pushes that create files larger than"** → `100` MB
5. **Bypass list** : Laisse vide (ou ajoute seulement les admins)
6. Clique sur **"Create ruleset"**

### 2. Créer le Ruleset pour `develop` (Optionnel)

1. **Settings** → **Rules** → **New ruleset**
2. **Ruleset name** : `Development Protection`
3. **Target branches** :
   - Sélectionne **"Branch name pattern"**
   - Entre : `develop`
4. **Rules** :
   - ✅ Coche **"Do not allow bypassing the above settings"**
   - ✅ Coche **"Restrict pushes that create files larger than"** → `100` MB
5. Clique sur **"Create ruleset"**

---

## ✅ Résultat Attendu

Après configuration :

- ✅ **Impossible de push directement sur `main`**
- ✅ **Pull Request obligatoire** pour merger vers `main`
- ✅ **1 approbation minimum** requise
- ✅ **Status checks** doivent passer
- ✅ **Conversations résolues** avant merge
- ✅ **Historique linéaire** (pas de merge commits)
- ✅ **Fichiers > 100 MB** bloqués

---

## 🚨 Notes Importantes

1. **Bypass** : Si tu coches "Do not allow bypassing", même les admins devront suivre les règles
2. **Status checks** : Assure-toi que tes workflows GitHub Actions ont des noms de jobs cohérents
3. **Linear history** : Force l'utilisation de `rebase` au lieu de `merge` (plus propre)
4. **File size** : 100 MB est une bonne limite pour éviter les gros fichiers accidentels

---

## 🔄 Workflow Final

```
1. Développement sur `develop` ou feature branch
   ↓
2. Push vers `develop`
   ↓
3. Créer Pull Request : `develop` → `main`
   ↓
4. Code review (1 approbation minimum)
   ↓
5. Status checks passent (build, tests, etc.)
   ↓
6. Toutes les conversations résolues
   ↓
7. Merge possible → Déploiement automatique ✅
```

---

## 📚 Ressources

- [GitHub Docs - Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs - Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)

