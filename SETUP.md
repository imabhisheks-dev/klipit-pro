# Klipit Pro - Setup & Installation Guide

## 📋 Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   ```bash
   # Check version
   node --version
   npm --version
   
   # Install Node.js from https://nodejs.org/
   ```

2. **PostgreSQL** (v12 or higher)
   ```bash
   # Check version
   psql --version
   
   # Install PostgreSQL from https://www.postgresql.org/download/
   ```

3. **Docker & Docker Compose** (optional, for containerized deployment)
   ```bash
   docker --version
   docker-compose --version
   
   # Install from https://www.docker.com/products/docker-desktop
   ```

4. **Git**
   ```bash
   git --version
   ```

## 🚀 Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/klipit-pro.git
cd klipit-pro
```

### Step 2: Create Environment File

```bash
cp config/.env.example config/.env
```

Edit `config/.env` with your local development settings:
- Database URL
- JWT secrets (can be auto-generated)
- API ports

### Step 3: Setup Database

```bash
# Create PostgreSQL database
createdb klipit -U postgres

# Or using psql
psql -U postgres
CREATE DATABASE klipit;
CREATE USER klipit WITH PASSWORD 'klipit';
ALTER ROLE klipit SET client_encoding TO 'utf8';
ALTER ROLE klipit SET default_transaction_isolation TO 'read committed';
ALTER ROLE klipit SET default_transaction_deferrable TO on;
ALTER ROLE klipit SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE klipit TO klipit;
\q
```

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 5: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 6: Initialize Database Schema

```bash
cd backend
# If you have migration scripts set up:
npm run db:migrate
# Alternatively, run SQL migrations manually in psql
cd ..
```

### Step 7: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Server will run on http://localhost:3000
```

### Step 8: Access Application

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health
- **API Routes**: http://localhost:5000/api

## 🐳 Docker Setup

### Quick Start with Docker Compose

```bash
# Ensure .env file is created
cp config/.env.example config/.env

# Build and start all services
docker-compose -f docker/docker-compose.yml up -d

# Check logs
docker-compose logs -f

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Nginx: http://localhost:80
```

### Docker Commands

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop all containers
docker-compose down

# Remove volumes (careful - deletes data!)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Run migrations in container
docker-compose exec backend npm run db:migrate
```

## 🔄 Database Setup

### Manual Migration (if not automated)

1. Connect to PostgreSQL:
```bash
psql -U klipit -d klipit
```

2. Run SQL scripts from `database/migrations/` folder

3. Seed initial data (optional):
```bash
psql -U klipit -d klipit -f database/seeds/initial-data.sql
```

## 📝 Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment type | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/klipit` |
| `BACKEND_PORT` | Backend server port | `5000` |
| `JWT_SECRET` | Secret for JWT tokens | Generate with: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `REACT_APP_API_URL` | Frontend API endpoint | `http://localhost:5000` |

## 🔐 Generate Secure Secrets

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate another for refresh token
openssl rand -base64 32

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## ✅ Verify Installation

```bash
# Backend health check
curl http://localhost:5000/health

# Frontend health check
curl http://localhost:3000

# Database connection
psql klipit -c "SELECT version();"
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U klipit -d klipit

# Check PostgreSQL service status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>

# Find process using port 3000
lsof -i :3000
```

### Module Not Found

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Do this in both backend and frontend directories
```

### Database Password Issues

```bash
# Reset PostgreSQL user password
sudo -u postgres psql
ALTER USER klipit WITH PASSWORD 'newpassword';
\q
```

## 📚 Useful Commands

```bash
# Backend development with auto-restart
npm run dev

# Build backend for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Frontend development
npm start

# Build frontend production build
npm run build
```

## 🚀 Next Steps

1. Customize `.env` file with your settings
2. Review the API documentation in `backend/docs/API.md`
3. Check component structure in `frontend/src/`
4. Read `CONTRIBUTING.md` for development guidelines
5. Set up Git pre-commit hooks for linting

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify all prerequisites are installed
3. Check `.env` configuration
4. Review GitHub Issues: https://github.com/yourusername/klipit-pro/issues

---

**Happy coding! 🎉**
