# 🔧 Configuration GitHub Actions pour Frontend

## 📋 Secrets Requis

Pour que le déploiement automatique fonctionne, tu dois configurer ces secrets dans GitHub :

**Settings → Secrets and variables → Actions → New repository secret**

### Secrets à créer :

1. **`SSH_PRIVATE_KEY`**
   - Contenu : La clé privée SSH complète (celle qui correspond à la clé publique ajoutée sur le VPS)
   - Pour la récupérer : `cat ~/.ssh/id_ed25519_github` sur le VPS
   - Format : Commence par `-----BEGIN OPENSSH PRIVATE KEY-----` ou `-----BEGIN PRIVATE KEY-----`

2. **`SERVER_HOST`**
   - Contenu : L'IP ou le hostname du serveur VPS
   - Exemple : `54.37.73.231` ou `vps-35be2bac.vps.ovh.net`

3. **`SERVER_USER`**
   - Contenu : L'utilisateur SSH pour se connecter au VPS
   - Exemple : `debian`

## 🚀 Workflow

### Déploiement Automatique

Quand tu pushes sur `main`, GitHub Actions :
1. ✅ Build le frontend
2. ✅ Se connecte au VPS via SSH
3. ✅ Pull le code depuis `main`
4. ✅ Installe les dépendances
5. ✅ Build avec les variables de production
6. ✅ Redémarre PM2
7. ✅ Vérifie que le site répond

### Déclenchement Manuel

Tu peux aussi déclencher le déploiement manuellement :
- GitHub → Actions → "🚀 Deploy Frontend to Production" → "Run workflow"

## 🔒 Sécurité

- Les secrets sont chiffrés par GitHub
- La clé SSH est utilisée uniquement pour le déploiement
- Le script utilise `set -e` pour arrêter en cas d'erreur

## 📝 Notes

- Le workflow utilise `npm ci` pour une installation propre
- Le build utilise les variables d'environnement de production
- PM2 redémarre automatiquement le service `reccos-frontend`



