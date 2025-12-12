#!/bin/bash

###############################################################################
# Script de déploiement frontend
# 
# Ce script est appelé par GitHub Actions pour déployer le frontend
# Il peut aussi être exécuté manuellement en local
###############################################################################

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement FRONTEND démarré..."

# Aller dans le répertoire du frontend
cd /srv/all4one/frontend

# Pull les dernières modifications
echo "📥 Récupération du code..."
git fetch origin main
git reset --hard origin/main

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci --production=false

# Build avec les variables d'environnement de production
echo "🏗️ Build du frontend..."
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=/api
export NEXT_PUBLIC_FRONTEND_URL=https://reccos.ae
npm run build

# Redémarrer le service PM2
echo "🔄 Redémarrage du service frontend..."
pm2 restart reccos-frontend || pm2 start ecosystem.config.js --name reccos-frontend
pm2 save

echo "✅ Déploiement FRONTEND terminé !"



