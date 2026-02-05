# 🚀 NexusAPI Installation Guide

## 📋 Prerequisites

Before installing NexusAPI, ensure your system meets the following requirements:

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Docker**: 20.x or higher (for containerized deployment)
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher

### Development Tools

- **Git**: For version control
- **VS Code** (recommended): With TypeScript and NestJS extensions
- **Postman** or **Insomnia**: For API testing

---

## 🏗️ Installation Methods

### Method 1: Git Clone (Recommended)

```bash
# Clone the repository
git clone https://github.com/MertcanMert/nexus-api.git
cd nexus-api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables (see Configuration section)
nano .env

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run start:dev
```

### Method 2: Docker Development

```bash
# Clone the repository
git clone https://github.com/MertcanMert/nexus-api.git
cd nexus-api

# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
docker-compose exec nexus-api npx prisma migrate dev

# View logs
docker-compose logs -f nexus-api
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env` file with the following configuration:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/nexus_db

# Authentication
JWT_SECRET=YourSuperSecretKeyAtLeast32CharsLong!
JWT_REFRESH_SECRET=DifferentSuperSecretKeyAtLeast32CharsLong!
JWT_EXPIRES_IN_ACCESS_TOKEN=15m
JWT_EXPIRES_IN_REFRESH_TOKEN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@yourdomain.com

# Storage (Optional)
STORAGE_DRIVER=local
# For S3:
# STORAGE_DRIVER=s3
# S3_REGION=us-east-1
# S3_BUCKET=your-bucket-name
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key

# CORS (Production)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Security
BCRYPT_ROUNDS=12
```

### Environment Validation

The application includes built-in environment validation using Joi:

```bash
# Test environment configuration
npm run start:dev

# If configuration is invalid, you'll see detailed error messages
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb nexus_db

# Create user (optional)
createuser nexus_user
psql -c "ALTER USER nexus_user PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE nexus_db TO nexus_user;"
```

### Option 2: Docker PostgreSQL

```bash
# Using the provided docker-compose
docker-compose up -d postgres

# Or manually
docker run -d \
  --name nexus-postgres \
  -e POSTGRES_DB=nexus_db \
  -e POSTGRES_USER=nexus_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:14
```

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

### Database Seeding (Optional)

```bash
# Seed with sample data
npx prisma db seed

# Custom seed file location: prisma/seed.ts
```

---

## 🔧 Redis Setup

### Option 1: Local Redis

```bash
# Install Redis (macOS)
brew install redis

# Start Redis service
brew services start redis

# Test connection
redis-cli ping
```

### Option 2: Docker Redis

```bash
# Using provided docker-compose
docker-compose up -d redis

# Or manually
docker run -d \
  --name nexus-redis \
  -p 6379:6379 \
  redis:6-alpine
```

---

## 🚀 Running the Application

### Development Mode

```bash
# Start with hot reload
npm run start:dev

# Start with debugging
npm run start:debug

# Start in watch mode
npm run start:watch
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Production

```bash
# Build Docker image
docker build -t nexus-api .

# Run with environment file
docker run -d \
  --name nexus-api \
  --env-file .env \
  -p 3000:3000 \
  nexus-api
```

---

## 🌐 Accessing the Application

### API Endpoints

- **Base URL**: `http://localhost:3000/api`
- **API Documentation**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/api/health`

### Common Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!@","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!@"}'
```

---

## 🧪 Testing the Installation

### Health Checks

```bash
# Check API health
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "info": {
    "version": "0.0.1",
    "uptime": 1234,
    "timestamp": "2026-02-05T15:30:00.000Z",
    "environment": "development"
  }
}
```

### Database Connection

```bash
# Test database connection
npx prisma db pull

# Check tables
npx prisma db seed
```

### Redis Connection

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### API Authentication Test

```bash
# Register and login to test auth flow
npm run test:e2e
```

---

## 🔍 Common Installation Issues

### Issue: Node.js Version

**Problem**: `Error: Node.js version 18.x required`
**Solution**:

```bash
# Use nvm to manage Node versions
nvm install 18
nvm use 18
```

### Issue: Database Connection

**Problem**: `Can't reach database server`
**Solution**:

- Check PostgreSQL is running: `brew services list | grep postgres`
- Verify DATABASE_URL format
- Check network connectivity

### Issue: Redis Connection

**Problem**: `Redis connection failed`
**Solution**:

- Start Redis service: `brew services start redis`
- Verify REDIS_HOST and REDIS_PORT
- Check firewall settings

### Issue: Migration Failures

**Problem**: `Migration failed with error`
**Solution**:

- Reset database: `npx prisma migrate reset`
- Check database permissions
- Verify schema.sql syntax

### Issue: Port Already in Use

**Problem**: `Port 3000 is already in use`
**Solution**:

- Find process: `lsof -ti:3000`
- Kill process: `kill -9 $(lsof -ti:3000)`
- Or use different port: `PORT=3001 npm run start:dev`

---

## 📚 Next Steps

After successful installation:

1. **Read the Documentation**: Visit `/docs` for comprehensive guides
2. **Explore API Documentation**: Open `/docs` in your browser
3. **Run Tests**: `npm run test` to verify everything works
4. **Configure Production**: Update `.env` for production settings
5. **Deploy**: Follow the [Deployment Guide](./deployment.md)

---

## 🆘 Getting Help

If you encounter issues during installation:

1. **Check Logs**: `npm run start:dev` shows detailed error messages
2. **Review Configuration**: Verify all required environment variables
3. **Check System Requirements**: Ensure all prerequisites are met
4. **Search Issues**: [GitHub Issues](https://github.com/MertcanMert/nexus-api/issues)
5. **Start Discussion**: [GitHub Discussions](https://github.com/MertcanMert/nexus-api/discussions)

---

## 🔄 Updating NexusAPI

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations (if schema changed)
npx prisma migrate dev

# Restart the application
npm run start:dev
```

---

_Installation Guide Last Updated: February 5, 2026_
