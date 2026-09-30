#!/bin/bash
# ==============================================================================
# Dropshipping Platform - Automatic AWS EC2 Setup Script
# Works on Ubuntu 22.04 LTS / 24.04 LTS
# ==============================================================================

set -e

echo "🚀 Starting Dropshipping Platform AWS EC2 Setup..."

# 1. Update Ubuntu system packages & install Docker
echo "📦 Installing Docker & dependencies..."
sudo apt-get update -y
sudo apt-get install -y docker.io git curl

# Install Docker Compose plugin if missing
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-v2 || sudo apt-get install -y docker-compose || true
fi

# Ensure Docker service is running
sudo systemctl enable --now docker

# 2. Add current user to Docker group
echo "👤 Configuring Docker permissions..."
sudo usermod -aG docker $USER || true

# 3. Create 4GB Swap Space (Prevents out-of-memory issues with microservices)
if [ ! -f /swapfile ] || [ $(stat -c%s /swapfile 2>/dev/null || echo 0) -gt 2000000000 ]; then
    echo "💾 Creating 1GB Swap Space..."
    sudo swapoff /swapfile 2>/dev/null || true
    sudo rm -f /swapfile
    sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab || true
    echo "✅ 1GB Swap created successfully."
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
sudo docker compose -f docker-compose.prod.yml pull || true
sudo docker compose -f docker-compose.prod.yml up -d --build

# 6. Wait for containers to initialize
echo "⏳ Waiting 15 seconds for database & microservices to initialize..."
sleep 15

# 7. Seed database with initial dataset
echo "🌱 Seeding PostgreSQL databases..."
if docker compose version &> /dev/null; then
    sudo docker exec dropship-prod-gateway node scripts/seed.js || true
else
    sudo docker-compose -f docker-compose.prod.yml exec -T api-gateway node scripts/seed.js || true
fi

echo ""
echo "=============================================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Your Frontend and Backend are now running live on AWS EC2."
echo "Access your app at: http://$(curl -s http://checkip.amazonaws.com)/login"
echo "=============================================================================="
