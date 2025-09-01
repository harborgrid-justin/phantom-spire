# Phantom Spire - Quick Start Deployment Guide

> **Get Phantom Spire running in production in under 10 minutes**

## 🚀 One-Command Installation

```bash
curl -fsSL https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/install.sh | bash
```

This single command will:
- Install all system dependencies (Node.js, MongoDB, Redis)
- Create system user and service
- Deploy and configure Phantom Spire
- Start all services
- Configure firewall and security

## 📦 Alternative Installation Methods

### Docker (Recommended for Production)

```bash
# Clone repository
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env  # Update with your settings

# Start production stack
docker-compose -f deployment/docker/docker-compose.prod.yml up -d
```

### Manual Installation

```bash
# Prerequisites
sudo apt update
sudo apt install -y nodejs npm mongodb redis-server nginx

# Clone and setup
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire
npm install --production
npm run build

# Configure environment
cp .env.example .env
# Edit .env with production settings

# Start application
npm start
```

## ⚙️ Essential Configuration

### Environment Variables (`.env`)
```bash
# REQUIRED: Update these for production
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-here
MONGODB_URI=mongodb://localhost:27017/phantom-spire
CORS_ORIGINS=https://yourdomain.com

# OPTIONAL: Enhanced security
BCRYPT_ROUNDS=12
ENABLE_RATE_LIMITING=true
LOG_LEVEL=info
```

### Generate Secure Secrets
```bash
# JWT Secret (256-bit)
openssl rand -hex 32

# Session Secret
openssl rand -hex 32
```

## 🔐 Security Setup

### 1. SSL/TLS Certificate
```bash
# Self-signed (for testing)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem

# Let's Encrypt (production)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 2. Firewall Configuration
```bash
# Ubuntu/Debian
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --add-service=ssh --permanent
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

## 🗄️ Database Setup

### MongoDB Authentication
```bash
# Connect to MongoDB
mongo phantom-spire

# Create database user
db.createUser({
  user: "phantom-spire",
  pwd: "your-secure-password",
  roles: ["dbOwner"]
});

# Update .env with authenticated URI
MONGODB_URI=mongodb://phantom-spire:your-secure-password@localhost:27017/phantom-spire
```

### Redis Security
```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Add password
requirepass your-redis-password

# Restart Redis
sudo systemctl restart redis

# Update .env
REDIS_URL=redis://:your-redis-password@localhost:6379
```

## 🏥 Health Checks

### Application Status
```bash
# Health endpoint
curl http://localhost:3000/health

# Expected response
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": "0 days, 0 hours, 5 minutes",
  "environment": "production"
}
```

### Service Status
```bash
# Check all services
sudo systemctl status phantom-spire
sudo systemctl status mongod
sudo systemctl status redis
sudo systemctl status nginx
```

## 👥 Create First Admin User

```bash
# POST to registration endpoint
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "System Administrator",
    "role": "admin"
  }'
```

## 📊 Basic Operations

### Login and Get Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!"
  }'
```

### Create IOC (Indicator of Compromise)
```bash
curl -X POST http://localhost:3000/api/v1/iocs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "malicious.example.com",
    "type": "domain",
    "severity": "high",
    "confidence": 90,
    "tags": ["malware", "c2"]
  }'
```

## 🔧 Troubleshooting

### Common Issues

**Service won't start**
```bash
# Check logs
sudo journalctl -u phantom-spire -f
tail -f /var/log/phantom-spire/phantom-spire.log
```

**Database connection failed**
```bash
# Test MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

**High CPU/Memory usage**
```bash
# Monitor resources
htop
docker stats (if using Docker)

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 📈 Production Optimization

### Performance Tuning
```bash
# MongoDB indexing
mongo phantom-spire --eval "
  db.iocs.createIndex({value: 1});
  db.iocs.createIndex({type: 1, severity: 1});
  db.alerts.createIndex({createdAt: -1});
"

# Node.js optimization
export NODE_ENV=production
export NODE_OPTIONS="--optimize-for-size"
```

### Monitoring Setup
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Log rotation
sudo nano /etc/logrotate.d/phantom-spire
# Add configuration for log rotation
```

## 🆘 Support

### Logs Location
- Application: `/var/log/phantom-spire/`
- Nginx: `/var/log/nginx/`
- MongoDB: `/var/log/mongodb/`
- System: `sudo journalctl -u phantom-spire`

### Key Endpoints
- **Health Check**: `GET /health`
- **API Documentation**: `GET /api-docs` (dev only)
- **Authentication**: `POST /api/v1/auth/login`

### Contact
- **Issues**: [GitHub Issues](https://github.com/harborgrid-justin/phantom-spire/issues)
- **Security**: See SECURITY.md
- **Documentation**: See README.md

---

🎉 **Your Phantom Spire Enterprise CTI Platform is now ready for production use!**