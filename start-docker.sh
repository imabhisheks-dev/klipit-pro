#!/bin/bash

# Quick Start Klipit Pro with Docker

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Klipit Pro - Starting with Docker                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/home/ubuntu/klipit-pro"
cd "$PROJECT_DIR"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "✓ Docker: $(docker --version)"
echo "✓ Docker Compose: $(docker-compose --version)"
echo ""

# Create .env if not exists
if [ ! -f "config/.env" ]; then
    echo "Creating environment configuration..."
    cp config/.env.example config/.env
    echo "✓ Environment file created"
fi

echo ""
echo "Creating required directories..."
mkdir -p uploads logs
echo "✓ Directories ready"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Starting Docker containers..."
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Add current user to docker group for this session
sudo usermod -aG docker $USER 2>/dev/null || true

# Start with sudo (in case permissions are still needed)
if ! docker ps &> /dev/null; then
    echo "Setting up Docker permissions..."
    sudo systemctl restart docker
    sudo usermod -aG docker $USER
fi

# Start containers
docker-compose -f docker/docker-compose.yml down 2>/dev/null || true
docker-compose -f docker/docker-compose.yml up -d

echo ""
sleep 3

# Check status
if docker-compose ps | grep -q "Up"; then
    echo "✓ Services started successfully!"
    echo ""
    docker-compose ps
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "✨ Application Ready!"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "Access the application:"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  📡 API: http://localhost:5000"
    echo "  📊 Nginx: http://localhost"
    echo ""
    echo "Credentials:"
    echo "  DB User: klipit"
    echo "  DB Pass: klipit"
    echo "  DB Name: klipit"
    echo ""
    echo "Useful commands:"
    echo "  View logs:     docker-compose logs -f backend"
    echo "  Stop:          docker-compose -f docker/docker-compose.yml down"
    echo "  Rebuild:       docker-compose build --no-cache"
    echo ""
else
    echo "⚠️  Containers may be starting. Please wait a moment..."
    echo "Check status: docker-compose ps"
    echo "View logs: docker-compose logs"
fi
