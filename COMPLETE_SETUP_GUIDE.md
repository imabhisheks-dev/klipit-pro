# 🚀 Klipit Pro - Complete Setup & Deployment Guide

## ✅ What We've Done So Far

1. ✅ Created complete Klipit Pro project structure
2. ✅ Implemented Pro features:
   - Password-protected clipboards
   - Permanent data storage (5+ years)
   - Version history & restore
   - Syntax highlighting
   - Read-only public sharing
   - User subscriptions
3. ✅ Created GitHub repository: `imabhisheks-dev/klipit-pro`
4. ✅ Set up CI/CD workflows (test.yml, deploy.yml)
5. ✅ Created React Pro components
6. ✅ Node.js installation complete

---

## 📋 Next Steps

### Step 1: Install Backend Dependencies (5 minutes)

```bash
cd /home/ubuntu/klipit-pro/backend
npm install
```

### Step 2: Install Frontend Dependencies (10 minutes)

```bash
cd /home/ubuntu/klipit-pro/frontend
npm install
```

### Step 3: Set Up PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
docker pull postgres:15-alpine
docker run --name klipit-postgres \
  -e POSTGRES_DB=klipit \
  -e POSTGRES_USER=klipit \
  -e POSTGRES_PASSWORD=klipit \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**Option B: Local Installation**
```bash
sudo apt install postgresql postgresql-contrib
createdb klipit -U postgres
psql -U postgres -d klipit
```

### Step 4: Initialize Database Schema

```bash
cd /home/ubuntu/klipit-pro/backend
npm run db:migrate
```

### Step 5: Create Environment File

```bash
cd /home/ubuntu/klipit-pro
cp config/.env.example config/.env

# Edit with actual values:
nano config/.env
```

**Minimum required:**
```env
DATABASE_URL=postgresql://klipit:klipit@localhost:5432/klipit
JWT_SECRET=dev-secret-$(openssl rand -base64 32)
BACKEND_PORT=5000
REACT_APP_API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Start Development Servers (Pick One)

### Option 1: Quick Shell Scripts (EASIEST)

**Terminal 1 - Backend:**
```bash
cd /home/ubuntu/klipit-pro
bash ./start-dev.sh --npm
```

**Terminal 2 - Frontend:**
```bash
cd /home/ubuntu/klipit-pro/frontend
npm run dev
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd /home/ubuntu/klipit-pro/backend
npm run dev
# Output: Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd /home/ubuntu/klipit-pro/frontend
npm run dev
# Output: Frontend available on http://localhost:3000
```

### Option 3: Docker (Full Stack)

```bash
cd /home/ubuntu/klipit-pro
docker-compose -f docker/docker-compose.yml up -d
```

---

## 🎯 Access the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

---

## 📊 Test the API

### Create a Clipboard
```bash
curl -X POST http://localhost:5000/api/clipboard \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World", "isPublic": true}'
```

### Get a Clipboard
```bash
curl http://localhost:5000/api/clipboard/ABC123
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

---

## 🌐 Deploy to Oracle Cloud

### Prerequisites for Oracle Cloud

1. **SSH Key** (for deployment)
```bash
ssh-keygen -t ed25519 -C github-actions -f ~/.ssh/github-actions -N ""
```

2. **Get your server IP**
   - Log in to Oracle Cloud Console
   - Go to Compute → Instances
   - Note your instance IP address

### Step 1: SSH into Oracle Cloud Server

```bash
# Replace SERVER_IP with your actual IP
ssh -i ~/.ssh/github-actions ubuntu@SERVER_IP

# Or if using default Ubuntu key:
ssh ubuntu@SERVER_IP
```

### Step 2: Prepare Server (Run these commands on server)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Clone Repository on Server

```bash
# Create application directory
sudo mkdir -p /opt/klipit-pro
sudo chown $USER:$USER /opt/klipit-pro

# Clone from GitHub
cd /opt/klipit-pro
git clone https://github.com/imabhisheks-dev/klipit-pro.git .
```

### Step 4: Set Up Environment on Server

```bash
cd /opt/klipit-pro

# Create production environment
cp config/.env.example config/.env

# Edit with production values
nano config/.env
```

**Production .env settings:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://klipit:strong-password-here@localhost:5432/klipit
BACKEND_PORT=5000
JWT_SECRET=generate-secure-key-here
REACT_APP_API_URL=https://your-domain.com/api
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Step 5: Start Application on Server

```bash
cd /opt/klipit-pro

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Verify containers running
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Step 6: Configure Firewall

```bash
# Enable firewall
sudo ufw enable

# Allow ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Check status
sudo ufw status
```

### Step 7: Setup Domain & SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 8: Point Domain to Server

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Point `A` record to your server IP:
   ```
   your-domain.com  A  your.server.ip
   www.your-domain.com  A  your.server.ip
   ```
4. Wait for DNS propagation (5-30 minutes)

### Step 9: Update Nginx Config for SSL

Update `/opt/klipit-pro/nginx/nginx.conf`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
    
    # ... rest of config ...
}
```

### Step 10: Restart Services

```bash
# Update Nginx configuration
docker-compose restart nginx

# Or rebuild and restart everything
docker-compose down
docker-compose up -d
```

---

## 📊 GitHub CI/CD Setup

### Add GitHub Secrets

Go to: `https://github.com/imabhisheks-dev/klipit-pro/settings/secrets/actions`

Add these secrets:

| Secret | Value | Example |
|--------|-------|---------|
| `SERVER_IP` | Your Oracle Cloud IP | `140.238.99.123` |
| `SERVER_USER` | SSH user | `ubuntu` |
| `SERVER_SSH_KEY` | Private key content | `cat ~/.ssh/github-actions` |
| `PROD_DATABASE_URL` | PostgreSQL URL | `postgresql://klipit:pwd@localhost:5432/klipit` |

### How CI/CD Works

1. **On Pull Request**: Runs tests
   - Linting
   - Unit tests
   - Build verification

2. **On Push to `main`**: Deploys to production
   - SSH to server
   - Pull latest code
   - Rebuild containers
   - Run migrations
   - Restart services

---

## 🔍 Monitoring & Maintenance

### Check Server Status

```bash
# SSH to server
ssh ubuntu@your-server-ip

# Check containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Check disk usage
df -h

# Check memory
free -h
```

### Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U klipit klipit > backup.sql

# Restore database
docker-compose exec -T postgres psql -U klipit klipit < backup.sql
```

### Update Application

```bash
cd /opt/klipit-pro

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Run migrations if needed
docker-compose exec backend npm run db:migrate
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if database is running
docker ps | grep postgres

# Test connection
psql -h localhost -U klipit -d klipit -c "SELECT 1"
```

### Containers Won't Start

```bash
# View error logs
docker-compose logs

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

---

## 📱 Frontend React Components (Added)

### Pro Clipboard Creation
```tsx
<ProClipboardCreate onClipboardCreated={handleSuccess} />
```

### Version History
```tsx
<ClipboardVersionHistory handle="ABC123" />
```

### Subscription Dashboard
```tsx
<SubscriptionDashboard />
```

---

## 📚 Project Structure

```
/home/ubuntu/klipit-pro/
├── backend/                 # Node.js + Express
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, logging
│   │   └── config/         # Database config
│   └── package.json
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── components/     # React components
│   │   └── pages/          # Page components
│   └── package.json
├── docker/                  # Docker setup
├── nginx/                   # Web server
├── config/                  # .env file
└── .github/workflows/       # CI/CD
    ├── test.yml
    └── deploy.yml
```

---

## 🎯 Manual Testing Checklist

- [ ] Backend server starts on port 5000
- [ ] Frontend loads on port 3000
- [ ] Can create a clipboard via API
- [ ] Can retrieve clipboard content
- [ ] Can register a new user
- [ ] Can login user
- [ ] Can create Pro clipboard
- [ ] Can view version history
- [ ] QR code generates correctly

---

## 📞 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code

# Docker
docker-compose up -d               # Start containers
docker-compose down                # Stop containers
docker-compose logs -f backend     # View logs
docker ps                          # List running containers

# Git/GitHub
git push origin main              # Push to GitHub
git pull origin main              # Pull from GitHub
git log --oneline                 # View commit history
```

---

## ✨ You're Ready to Go!

**Current Status:**
- ✅ Project fully set up locally
- ✅ GitHub repository created
- ✅ Pro features implemented
- ✅ React components added
- ✅ Ready to deploy to Oracle Cloud

**Next Action:** Start the development servers and test!

```bash
# Terminal 1:
cd /home/ubuntu/klipit-pro/backend && npm run dev

# Terminal 2:
cd /home/ubuntu/klipit-pro/frontend && npm run dev

# Then open:  
http://localhost:3000
```

---

**Happy coding! 🎉**

For detailed guides, see:
- `QUICK_START.md` - Quick reference
- `SETUP.md` - Detailed setup
- `backend/API.md` - API documentation
- `CONTRIBUTING.md` - Development guidelines
