# Klipit Pro - Online Clipboard Service

Klipit Pro is a modern, feature-rich online clipboard application that allows users to share data and files between devices seamlessly using unique links and QR codes.

## 📋 Features

- **Cross-Device Clipboard**: Share text/data between any devices via unique links
- **QR Code Sharing**: Generate QR codes for easy clipboard access
- **File Upload**: Upload and share files (Klipit Pro feature)
- **Auto-Expiration**: Data clears automatically after 24 hours
- **Unique Handles**: Secure, difficult-to-guess clipboard identifiers
- **Real-time Updates**: Live clipboard updates across devices
- **Dark Mode**: Modern UI with dark/light theme support
- **Analytics**: Track clipboard usage and file transfers
- **User Accounts**: Create accounts for managing multiple clipboards

## 🏗️ Architecture

```
klipit-pro/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Node.js Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Services
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration
│   │   └── index.ts
│   ├── tests/               # Unit and integration tests
│   ├── package.json
│   └── tsconfig.json
├── database/                # Database setup and migrations
│   ├── migrations/          # SQL migration files
│   └── seeds/               # Seed data
├── docker/                  # Docker configuration
│   ├── Dockerfile           # Main application Dockerfile
│   ├── Dockerfile.prod      # Production Dockerfile
│   └── docker-compose.yml   # Docker Compose configuration
├── nginx/                   # Nginx configuration
│   └── nginx.conf           # Nginx reverse proxy config
├── config/                  # Configuration files
│   ├── .env.example         # Example environment variables
│   └── production.env       # Production environment (git-ignored)
├── .github/
│   └── workflows/
│       ├── test.yml         # Run tests on PR
│       └── deploy.yml       # Deploy on push to main
├── migrations/              # Database migrations
└── logs/                    # Application logs

```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- PostgreSQL 12+
- Docker & Docker Compose (for containerized deployment)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/klipit-pro.git
   cd klipit-pro
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   cd ..

   # Frontend
   cd frontend
   npm install
   cd ..
   ```

3. **Setup environment variables**
   ```bash
   cp config/.env.example config/.env
   # Edit config/.env with your settings
   ```

4. **Initialize database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # In backend directory
   npm run dev

   # In frontend directory (new terminal)
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🐳 Docker Deployment

### Build and run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Node.js backend (port 5000)
- React frontend (port 3000)
- Nginx reverse proxy (port 80)

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop containers
```bash
docker-compose down
```

## ☁️ Production Deployment

### Deploy to Ubuntu Server (Oracle Cloud)

1. **SSH into your server**
   ```bash
   ssh ubuntu@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql docker.io docker-compose git nginx
   ```

3. **Clone repository**
   ```bash
   cd /opt
   sudo git clone https://github.com/yourusername/klipit-pro.git
   cd klipit-pro
   ```

4. **Setup environment**
   ```bash
   sudo cp config/.env.example config/production.env
   sudo nano config/production.env  # Edit with production values
   ```

5. **Build and deploy**
   ```bash
   sudo docker-compose -f docker-compose.yml up -d
   ```

6. **Configure Nginx as reverse proxy**
   ```bash
   sudo cp nginx/nginx.conf /etc/nginx/sites-available/klipit-pro
   sudo ln -s /etc/nginx/sites-available/klipit-pro /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 🔄 CI/CD Pipeline (GitHub Actions)

Automatic testing and deployment on every push:

- **On Pull Request**: Run tests and linting
- **On Push to main**: Build, test, and deploy to production

Configure secrets in GitHub:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `SERVER_IP`
- `SERVER_USER`
- `SERVER_SSH_KEY`
- `PROD_DATABASE_URL`

## 📝 Environment Variables

Required environment variables (see `config/.env.example`):

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/klipit
DB_POOL_SIZE=10

# Backend
NODE_ENV=development
BACKEND_PORT=5000
JWT_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret

# Frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000

# File Upload
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,txt,jpg,jpeg,png,gif

# AWS S3 (optional for file storage)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# Security
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your-session-secret
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm run test

# Run frontend tests
cd frontend
npm run test

# Run end-to-end tests
npm run test:e2e
```

## 📊 API documentation

API endpoints are documented in `backend/docs/API.md`

Key Endpoints:
- `GET /api/clipboard/:handle` - Retrieve clipboard content
- `POST /api/clipboard` - Create new clipboard
- `PUT /api/clipboard/:handle` - Update clipboard content
- `DELETE /api/clipboard/:handle` - Delete clipboard
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/uploads` - Upload file
- `GET /api/stats` - Get usage statistics

## 🔐 Security Features

- JWT authentication
- HTTPS/SSL encryption
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens
- Rate limiting
- Input validation and sanitization
- Secure file upload handling

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE.md file for details.

## 📞 Support & Contact

- **Issues**: GitHub Issues
- **Email**: support@klipit-pro.com
- **Website**: https://klipit.in

## 🙏 Acknowledgments

Inspired by the original Klipit application and built with modern web technologies.

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Status**: Production Ready
