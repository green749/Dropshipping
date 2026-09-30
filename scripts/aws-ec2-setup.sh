#!/bin/bash
# ==============================================================================
# Dropshipping Platform - Automatic AWS EC2 Setup Script
# Works on Ubuntu 22.04 LTS / 24.04 LTS
# ==============================================================================

set -e

echo "🚀 Starting Dropshipping Platform AWS EC2 Setup..."

# 1. Update Ubuntu system packages
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose-plugin git curl

# 2. Add current user to Docker group
echo "👤 Configuring Docker permissions..."
sudo usermod -aG docker $USER || true

# 3. Create 4GB Swap Space (Prevents out-of-memory issues with 7 microservices + DB)
if [ ! -f /swapfile ]; then
    echo "💾 Creating 4GB Swap Space..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ 4GB Swap created successfully."
else
    echo "✅ Swap file already exists."
fi

# 4. Clone or update repository
APP_DIR="$HOME/Dropshipping"
if [ ! -d "$APP_DIR" ]; then
    echo "📥 Cloning Repository from GitHub..."
    git clone https://github.com/green749/Dropshipping.git "$APP_DIR"
    cd "$APP_DIR"
else
    echo "🔄 Updating Repository..."
    cd "$APP_DIR"
    git fetch origin main
    git reset --hard origin/main
fi

# 5. Build and launch Docker containers
echo "🐳 Building and starting Docker containers (Frontend + Backend + DB)..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# 6. Wait for gateway container to be healthy
echo "⏳ Waiting 15 seconds for database & microservices to initialize..."
sleep 15

# 7. Seed database with initial test dataset
echo "🌱 Seeding PostgreSQL databases..."
sudo docker exec dropship-prod-gateway node scripts/seed.js || true

echo ""
echo "=============================================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Your Frontend and Backend are now running live on AWS EC2."
echo "Access your app at: http://$(curl -s http://checkip.amazonaws.com)/login"
echo "=============================================================================="
