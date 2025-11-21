# 🔐 Configuration des Secrets GitHub

## 📋 Étapes pour Activer le Déploiement Automatique

### 1. Aller sur GitHub

1. Va sur ton repo : `https://github.com/Bounouar-Mohamed/front_RECCOS`
2. Clique sur **Settings** (en haut à droite)
3. Dans le menu de gauche, clique sur **Secrets and variables** → **Actions**
4. Clique sur **New repository secret**

### 2. Ajouter les 3 Secrets Requis

#### Secret 1 : `SSH_PRIVATE_KEY`

- **Name** : `SSH_PRIVATE_KEY`
- **Secret** : Pour récupérer la clé privée, exécute sur le VPS :

```bash
cat ~/.ssh/id_ed25519_github
```

⚠️ **Important** : 
- Copie TOUTE la clé, y compris les lignes `-----BEGIN OPENSSH PRIVATE KEY-----` et `-----END OPENSSH PRIVATE KEY-----`
- Ne partage JAMAIS cette clé publiquement
- Si tu n'as pas la clé, crée-en une nouvelle : `ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/id_ed25519_github`

#### Secret 2 : `SERVER_HOST`

- **Name** : `SERVER_HOST`
- **Secret** : `vps-35be2bac.vps.ovh.net` (ou l'IP de ton VPS)

#### Secret 3 : `SERVER_USER`

- **Name** : `SERVER_USER`
- **Secret** : `debian`

### 3. Vérifier la Configuration

Une fois les 3 secrets ajoutés, tu devrais voir :

```
SSH_PRIVATE_KEY    ••••••••••
SERVER_HOST        ••••••••••
SERVER_USER        ••••••••••
```

### 4. Tester le Déploiement

1. Va dans **Actions** (onglet en haut)
2. Clique sur **🚀 Deploy Frontend to Production**
3. Clique sur **Run workflow** → **Run workflow**
4. Le workflow va s'exécuter et déployer automatiquement

## ✅ Vérification

Une fois le workflow terminé :

1. ✅ Vérifie que le workflow est vert (succès)
2. ✅ Va sur `https://reccos.ae` pour vérifier que le site fonctionne
3. ✅ Vérifie les logs PM2 : `pm2 logs reccos-frontend`

## 🚨 En Cas d'Erreur

### Erreur SSH

Si tu vois `Permission denied (publickey)` :
- ✅ Vérifie que la clé privée est complète (avec BEGIN et END)
- ✅ Vérifie que la clé publique est bien sur le VPS : `cat ~/.ssh/id_ed25519_github.pub`
- ✅ Vérifie que la clé est dans `~/.ssh/authorized_keys` sur le VPS

### Erreur de Build

Si le build échoue :
- ✅ Vérifie les logs dans GitHub Actions
- ✅ Vérifie que les variables d'environnement sont correctes
- ✅ Teste le build en local : `npm run build`

## 📝 Notes

- Les secrets sont chiffrés par GitHub et ne sont jamais visibles
- La clé SSH est utilisée uniquement pour le déploiement
- Tu peux régénérer la clé si nécessaire (mais il faudra la remettre sur le VPS)

