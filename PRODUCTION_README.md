# BloodBridge - Production Deployment Guide

## Overview

BloodBridge is a production-ready AI-powered blood management ecosystem built with Next.js, Node.js, Express, MongoDB, and Socket.IO. This guide covers deployment, configuration, security, and maintenance.

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- 4GB minimum RAM
- 2GB disk space

### Running with Docker Compose

```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- API Docs: http://localhost:5001/api-docs
- MongoDB: mongodb://admin:admin123@localhost:27017

## Environment Variables

### Critical Variables (Must Change in Production)

```bash
# JWT Secret - Generate a strong secret key
JWT_SECRET=generate-a-strong-random-string-here

# MongoDB Credentials - Use strong passwords
MONGODB_USER=admin
MONGODB_PASSWORD=strong-password-here
MONGODB_URI=mongodb://admin:password@your-mongo-host:27017/bloodbridge

# Allowed Origins - List your frontend URLs
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Server URL - Your backend URL
API_SERVER_URL=https://api.yourdomain.com
```

### Frontend Variables

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Backend Variables

```bash
# Server
PORT=5001
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_FILE=logs/bloodbridge.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Requests per window

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password

# Features
ENABLE_SOCKET_IO=true
ENABLE_AI_PREDICTIONS=true
ENABLE_HELMET=true
ENABLE_RATE_LIMITING=true
```

## Database Setup

### Seed Database

```bash
# Using Docker
docker-compose exec backend npm run seed

# Using npm directly
cd server
npm run seed
```

This creates:
- 3 Hospital users with test credentials
- 2 Blood Bank users
- 2 Donor users
- 1 Admin user
- Sample inventory data for all blood groups

### Test Credentials

```
Hospital:
  Email: hospital1@example.com
  Password: SecurePass123!

Blood Bank:
  Email: bloodbank1@example.com
  Password: SecurePass123!

Donor:
  Email: donor1@example.com
  Password: SecurePass123!

Admin:
  Email: admin@example.com
  Password: AdminPass123!
```

**Important:** Change these credentials in production!

## Docker Deployment

### Build Images

```bash
# Build all images
docker-compose build

# Push to registry (example with Docker Hub)
docker tag bloodbridge-backend myregistry/bloodbridge-backend:1.0.0
docker push myregistry/bloodbridge-backend:1.0.0

docker tag bloodbridge-frontend myregistry/bloodbridge-frontend:1.0.0
docker push myregistry/bloodbridge-frontend:1.0.0
```

### Production Docker Compose

Update `docker-compose.yml` for production:

```yaml
services:
  backend:
    image: myregistry/bloodbridge-backend:1.0.0
    environment:
      MONGODB_URI: mongodb+srv://user:password@cluster.mongodb.net/bloodbridge
      JWT_SECRET: ${JWT_SECRET}  # Use secure secret management
      NODE_ENV: production

  frontend:
    image: myregistry/bloodbridge-frontend:1.0.0
    environment:
      NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.com/api/v1
      NODE_ENV: production
```

### Health Checks

Services include health checks:

```bash
# Check individual service health
docker-compose ps

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
```

## Kubernetes Deployment

### Create Namespace

```bash
kubectl create namespace bloodbridge
```

### Deploy Backend

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bloodbridge-backend
  namespace: bloodbridge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bloodbridge-backend
  template:
    metadata:
      labels:
        app: bloodbridge-backend
    spec:
      containers:
      - name: backend
        image: myregistry/bloodbridge-backend:1.0.0
        ports:
        - containerPort: 5001
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: bloodbridge-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: bloodbridge-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 5001
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 5001
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: bloodbridge-backend
  namespace: bloodbridge
spec:
  selector:
    app: bloodbridge-backend
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 5001
    targetPort: 5001
EOF
```

## Security Best Practices

### 1. Environment Variables

```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use environment variable management:
# - Docker Secrets (Docker Swarm)
# - Kubernetes Secrets
# - AWS Secrets Manager
# - HashiCorp Vault
```

### 2. Database Security

```bash
# MongoDB Atlas (Recommended for Production)
# - Enable IP whitelist
# - Use VPC peering or PrivateLink
# - Enable encryption at rest
# - Enable audit logs

# MongoDB Credentials
# - Use strong passwords (16+ characters)
# - Rotate credentials regularly
# - Use least privilege roles
```

### 3. API Security

```bash
# Helmet protects against:
# - Content Security Policy (CSP)
# - X-Frame-Options (Clickjacking)
# - X-Content-Type-Options (MIME sniffing)
# - Strict Transport Security (HSTS)

# Rate Limiting configured for:
# - Authentication endpoints: 5 requests/15 minutes
# - General endpoints: 100 requests/15 minutes
# - API endpoints: 30 requests/minute
```

### 4. CORS Configuration

```bash
# Only allow your frontend domain
ALLOWED_ORIGINS=https://yourdomain.com

# In production, never use '*'
# Always specify exact origins
```

### 5. JWT Security

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set expiration times
JWT_EXPIRE=7d

# Use HTTPS only
# Implement token refresh logic
# Monitor for token abuse
```

## Monitoring & Logging

### Log Files

```bash
# Logs are written to
server/logs/bloodbridge.log

# Log rotation (using external tool)
# - logrotate (Linux)
# - pm2-logrotate (PM2)
# - CloudWatch Logs (AWS)
```

### Monitoring Services

```bash
# View real-time logs
docker-compose logs -f backend

# Check service status
docker-compose ps

# Monitor resource usage
docker stats

# Health endpoint
curl http://localhost:5001/api/v1/health
```

### Recommended Monitoring Tools

- **Prometheus** - Metrics collection
- **Grafana** - Dashboards and visualization
- **DataDog** - APM and monitoring
- **New Relic** - Application performance
- **Sentry** - Error tracking

## Performance Optimization

### 1. Caching

```bash
# Redis for session/cache management
# Configure MongoDB indexes
# Implement query optimization
```

### 2. Database Optimization

```bash
# Create indexes for frequently queried fields
db.hospitals.createIndex({ city: 1, state: 1 })
db.bloodinventory.createIndex({ bloodGroup: 1, status: 1 })
db.emergencyrequest.createIndex({ status: 1, priority: 1 })
```

### 3. API Optimization

```bash
# Pagination limits
- Default: 10 items
- Maximum: 100 items

# Field selection
- Only return required fields
- Use projections in MongoDB queries
```

### 4. Frontend Optimization

```bash
# Next.js built-in optimizations
- Image optimization
- Code splitting
- Static generation
- API routes caching
```

## Backup & Disaster Recovery

### MongoDB Backup

```bash
# Create backup
mongodump --uri="mongodb://admin:password@localhost:27017/bloodbridge" --out=backup

# Restore backup
mongorestore --uri="mongodb://admin:password@localhost:27017/bloodbridge" backup/bloodbridge
```

### Backup Strategy

```bash
# Daily backups
0 2 * * * mongodump --uri="mongodb://..." --out=/backups/daily-$(date +\%Y\%m\%d)

# Weekly snapshots
0 3 * * 0 aws s3 sync /backups s3://your-bucket/backups/weekly

# Monthly archives
0 4 1 * * tar -czf /archives/monthly-$(date +\%Y\%m).tar.gz /backups
```

## API Documentation

### Swagger UI

Access API documentation at:
```
http://localhost:5001/api-docs
```

Features:
- Interactive API explorer
- Test endpoints directly
- View request/response schemas
- Authentication support

### API Endpoints

**Authentication:**
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get profile

**Resources:**
- `GET/POST /api/v1/hospitals` - Hospital management
- `GET/POST /api/v1/blood-banks` - Blood bank management
- `GET/POST /api/v1/donors` - Donor management
- `GET/POST /api/v1/inventory` - Blood inventory

**Emergency & AI:**
- `GET/POST /api/v1/emergency` - Emergency requests
- `POST /api/v1/emergency/matching/:requestId` - Execute matching
- `GET /api/v1/ai/predictions` - AI predictions
- `GET /api/v1/ai/shortages` - Shortage detection

Full API documentation available in Swagger UI.

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Verify credentials
docker-compose logs mongodb

# Test connection
docker-compose exec backend npm run test:db
```

**Port Already in Use**
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

**Frontend Can't Connect to Backend**
```bash
# Verify CORS configuration
echo $ALLOWED_ORIGINS

# Check API URL
echo $NEXT_PUBLIC_API_BASE_URL

# Test API endpoint
curl -i http://localhost:5001/api/v1/health
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug docker-compose up backend

# View detailed MongoDB logs
docker-compose logs mongodb
```

## Maintenance

### Regular Tasks

```bash
# Weekly: Update dependencies
docker-compose exec backend npm outdated

# Monthly: Backup database
mongodump --uri="..." --out=/backups/monthly-$(date +%Y%m)

# Quarterly: Security audit
npm audit
docker image scan bloodbridge-backend:latest

# Annually: Certificate renewal (TLS)
# - Check expiration dates
# - Renew certificates 30 days before expiry
```

### Deployment Updates

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Start new version
docker-compose down
docker-compose up -d

# Verify health
curl http://localhost:5001/api/v1/health
```

## Support & Resources

- **Documentation**: See FRONTEND_INTEGRATION_GUIDE.md
- **API Docs**: http://localhost:5001/api-docs
- **GitHub**: https://github.com/bhavjitsingh01/BloodBridge
- **Issues**: Report bugs on GitHub Issues

## Scaling Recommendations

### Horizontal Scaling

```bash
# Backend: Use load balancer (Nginx, AWS ALB)
# Database: Use MongoDB Atlas with sharding
# Cache: Add Redis for sessions
# Storage: Use S3/CloudStorage for logs
```

### Vertical Scaling

```bash
# Increase container resources in docker-compose.yml
# Monitor CPU and memory usage
# Optimize database queries
# Implement caching strategies
```

## License

MIT License - See LICENSE file for details

---

**Last Updated**: July 29, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
