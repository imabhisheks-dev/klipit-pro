#!/bin/bash

# Klipit Pro - Local Development Startup Script

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Klipit Pro - Local Development Environment Setup             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/home/ubuntu/klipit-pro"
cd "$PROJECT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "✓ Node.js: $(node --version)"

# Check if PostgreSQL client is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client not found. Installing..."
    sudo apt-get install -y postgresql-client
fi
echo "✓ PostgreSQL client installed"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi
echo "✓ Docker: $(docker --version 2>/dev/null || echo 'installing...')"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi
echo "✓ Docker Compose: $(docker-compose --version 2>/dev/null || echo 'installing...')"

echo ""
echo -e "${BLUE}Step 2: Setting up environment configuration...${NC}"
echo ""

if [ ! -f "config/.env" ]; then
    echo "Creating .env from template..."
    cp config/.env.example config/.env
    echo "✓ Environment file created at config/.env"
else
    echo "✓ Environment file already exists"
fi

echo ""
echo -e "${BLUE}Step 3: Starting Docker containers...${NC}"
echo ""

if [ -n "$1" ] && [ "$1" = "--npm" ]; then
    echo "Starting with npm (local development)..."
    
    echo ""
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    echo ""
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Setup complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "To start the application:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd $PROJECT_DIR/backend"
    echo "  npm run dev"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd $PROJECT_DIR/frontend"
    echo "  npm run dev"
    echo ""
    echo "Then open:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - API: http://localhost:5000"
    
else
    echo "Starting with Docker..."
    
    # Create uploads directory if not exists
    mkdir -p uploads logs
    
    # Start containers
    docker-compose -f docker/docker-compose.yml up -d
    
    sleep 5
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}✓ All containers started successfully!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        docker-compose ps
        echo ""
        echo "Application running at:"
        echo "  - Frontend: http://localhost:3000"
        echo "  - Backend API: http://localhost:5000"
        echo "  - Nginx: http://localhost"
        echo ""
        echo "Database credentials:"
        echo "  - User: klipit"
        echo "  - Password: klipit"
        echo "  - Database: klipit"
        echo "  - Host: localhost:5432"
        echo ""
        echo "View logs:"
        echo "  docker-compose logs -f backend"
        echo "  docker-compose logs -f frontend"
        echo "  docker-compose logs -f postgres"
        echo ""
        echo "To stop containers:"
        echo "  docker-compose -f docker/docker-compose.yml down"
    else
        echo ""
        echo -e "${YELLOW}Container startup may still be in progress.${NC}"
        echo "Check status: docker-compose ps"
        echo "View logs: docker-compose logs"
    fi
fi

echo ""
echo "Documentation:"
echo "  - README.md - Full project overview"
echo "  - QUICK_START.md - Quick reference"
echo "  - backend/API.md - API endpoints"
echo "  - SETUP.md - Detailed setup guide"
echo ""
