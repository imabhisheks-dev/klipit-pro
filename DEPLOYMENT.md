# Klipit Pro - Production Deployment Guide

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│        Your Domain (klipit.com)         │
└──────────────────┬──────────────────────┘
                   │
           ┌───────┴────────┐
           │  Let's Encrypt │ (SSL Certificate)
           └────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Nginx Reverse     │
        │     Proxy           │
        │  (Port 80, 443)     │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐          ┌────▼────┐
   │ Backend  │          │ Frontend │
   │ (Node.js)│          │ (React)  │
   │ Port 5000│          │ Port 3000│
   └────┬─────┘          └────┬─────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │    PostgreSQL       │
        │   Database          │
        │   (Port 5432)       │
        └─────────────────────┘
```

## 📋 Prerequisites

- Ubuntu 20.04 LTS or higher (Oracle Cloud Free Tier)
- Domain name with DNS pointing to server
- SSH access to server
- 2GB+ RAM, 20GB+ storage

## 🔧 Step-by-Step Deployment

### Step 1: Server Setup

```bash
# SSH into your server
ssh ubuntu@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano
```

### Step 2: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Install Node.js & PostgreSQL Client

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Verify
node --version
npm --version
```

### Step 4: Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/klipit-pro
sudo chown $USER:$USER /opt/klipit-pro

# Clone repository
cd /opt/klipit-pro
git clone https://github.com/yourusername/klipit-pro.git .

# Or if already initialized:
git pull origin main
```

### Step 5: Setup Environment Variables

```bash
# Create production environment file
cp config/.env.example config/production.env

# Edit with secure values
nano config/production.env
```

**Important Settings for Production:**

```env
NODE_ENV=production
DATABASE_URL=postgresql://klipit:secure_password@postgres:5432/klipit
BACKEND_PORT=5000
JWT_SECRET=generate-secure-random-string-here
REFRESH_TOKEN_SECRET=generate-another-random-string
CORS_ORIGIN=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
FRONTEND_URL=https://your-domain.com
```

**Generate secure secrets:**
```bash
# In your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run twice to get two different secrets
```

### Step 6: Configure Database

```bash
# Update docker-compose to use persistent volume
# Edit docker-compose.yml to use production database settings
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Trust auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Certificate location:
# /etc/letsencrypt/live/your-domain.com/
```

### Step 8: Update Nginx Configuration

```bash
# Copy certificates to project
mkdir -p /opt/klipit-pro/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/klipit-pro/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/klipit-pro/ssl/

# Update nginx/nginx.conf to use SSL
# Add SSL directives and redirect HTTP to HTTPS
```

### Step 9: Build and Deploy

```bash
cd /opt/klipit-pro

# Build Docker images
docker-compose -f docker-compose.yml build

# Start services
docker-compose -f docker-compose.yml up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Step 10: Initialize Database

```bash
# Run database migrations
docker-compose exec backend npm run db:migrate

# Optional: Seed initial data
docker-compose exec backend npm run db:seed
```

### Step 11: Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Verify rules
sudo ufw status
```

### Step 12: Setup Automated Backups

```bash
# Create backup script
cat > /opt/klipit-pro/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/klipit-pro/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec -T postgres pg_dump -U klipit klipit > $BACKUP_DIR/klipit_$TIMESTAMP.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz /opt/klipit-pro/uploads/

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /opt/klipit-pro/backup.sh

# Add to crontab (daily backup at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/klipit-pro/backup.sh") | crontab -
```

## 🔄 Continuous Deployment (GitHub Actions)

### Setup GitHub Secrets

Go to your GitHub repository settings and add these secrets:

```
DOCKER_USERNAME = your-docker-username
DOCKER_PASSWORD = your-docker-password
SERVER_IP = your.server.ip
SERVER_USER = ubuntu
SERVER_SSH_KEY = (private SSH key content)
PROD_DATABASE_URL = postgresql://klipit:password@host:5432/klipit
```

### Deployment Workflow

Every push to `main` branch will:
1. Run tests
2. Build Docker images
3. Deploy to production

## 📊 Monitoring & Maintenance

### Check Service Status

```bash
# Check all containers
docker-compose ps

# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Check resource usage
docker stats

# Check disk space
df -h
```

### Database Maintenance

```bash
# Connect to database
docker-compose exec postgres psql -U klipit -d klipit

# Cleanup old data
docker-compose exec backend npm run db:cleanup

# Backup database
docker-compose exec postgres pg_dump -U klipit klipit > backup.sql
```

### Update Application

```bash
cd /opt/klipit-pro

# Pull latest code
git pull origin main

# Rebuild containers
docker-compose build

# Restart with new version
docker-compose up -d

# Verify deployment
docker-compose logs backend
```

## 🔐 Security Best Practices

1. **Change Default Passwords**
   ```bash
   # Change PostgreSQL password
   docker-compose exec postgres psql -U postgres
   ALTER USER klipit WITH PASSWORD 'new-secure-password';
   ```

2. **Enable UFW Firewall** (done in Step 11)

3. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Monitor Logs**
   ```bash
   # Setup log rotation
   sudo apt install -y logrotate
   ```

5. **HTTPS Only**
   - Redirect all HTTP to HTTPS
   - Use secure session cookies
   - Add HSTS headers

## 🚨 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Verify ports are free
sudo netstat -tlnp | grep -E ':(80|443|5000|3000|5432)'

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Error

```bash
# Check database container
docker-compose ps postgres

# Verify connection string in .env
# Format: postgresql://user:password@hostname:port/database
```

### Memory Issues

```bash
# Check resource usage
free -h
docker stats

# Increase swap (temporary)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📞 Production Support

- **Logs**: `/opt/klipit-pro/logs/`
- **Database Backups**: `/opt/klipit-pro/backups/`
- **Uploads**: `/opt/klipit-pro/uploads/`

---

**Deployment Checklist:**

- [ ] Clone repository
- [ ] Setup environment variables
- [ ] Install Docker & Docker Compose
- [ ] Build Docker images
- [ ] Initialize database
- [ ] Configure SSL certificate
- [ ] Update Nginx configuration
- [ ] Setup firewall
- [ ] Configure backups
- [ ] Test application in browser
- [ ] Monitor logs and services
- [ ] Document any customizations

---

**Success!** 🎉 Your Klipit Pro application is now deployed and accessible online!
