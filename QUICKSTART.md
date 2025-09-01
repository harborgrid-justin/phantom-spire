# Phantom Spire CTI Platform - Quick Start Guide

Welcome to Phantom Spire! This guide will help you get your enterprise-grade Cyber Threat Intelligence platform up and running in minutes.

## 🚀 One-Command Installation (Recommended)

The enhanced installation script provides complete setup with all databases and admin tools:

```bash
# Download and run enhanced installer (requires sudo)
curl -fsSL https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/scripts/enhanced-install.sh | sudo bash
```

**What this does:**
- ✅ Installs Docker and Docker Compose
- ✅ Sets up all 4 databases (PostgreSQL, MySQL, MongoDB, Redis)
- ✅ Creates system user and systemd service
- ✅ Installs Node.js and builds the application
- ✅ Configures firewall and security
- ✅ Starts all services automatically
- ✅ Provides database admin tools

After installation completes, visit: **http://localhost:3000/setup**

## 🛠️ Manual Setup (Development)

If you prefer manual control or are setting up for development:

### Step 1: Prerequisites

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl git docker.io docker-compose nodejs npm

# CentOS/RHEL/Fedora  
sudo yum install -y curl git docker docker-compose nodejs npm
sudo systemctl start docker && sudo systemctl enable docker
```

### Step 2: Get Phantom Spire

```bash
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire
```

### Step 3: Start Database Layer

```bash
# Start all databases with admin tools
docker-compose up -d

# Or start individual databases
docker-compose up -d postgres mysql mongo redis
```

**Wait for databases to initialize** (30-60 seconds)

### Step 4: Configure & Start Application

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Build application
npm run build

# Start application
npm start
```

### Step 5: Complete Setup

Visit **http://localhost:3000/setup** to complete configuration through the interactive wizard.

## 🎯 After Installation

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Main Application** | http://localhost:3000 | Primary interface |
| **Setup Wizard** | http://localhost:3000/setup | Initial configuration |
| **API Documentation** | http://localhost:3000/api/docs | API reference |
| **Health Check** | http://localhost:3000/health | System status |
| **Database Admin** | http://localhost:8080 | Adminer (all databases) |
| **MongoDB Admin** | http://localhost:8081 | Mongo Express |
| **Redis Admin** | http://localhost:8082 | Redis Commander |

### Default Database Connections

| Database | Connection | Credentials |
|----------|------------|-------------|
| **PostgreSQL** | localhost:5432 | postgres/phantom_secure_pass |
| **MySQL** | localhost:3306 | phantom_user/phantom_secure_pass |
| **MongoDB** | localhost:27017 | admin/phantom_secure_pass |
| **Redis** | localhost:6379 | password: phantom_redis_pass |

## 🔧 Common Operations

### Managing Services

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Reset all data (CAUTION: destroys all data)
docker-compose down -v
docker-compose up -d
```

### Application Management

```bash
# Start application
npm start

# Development mode (auto-restart)
npm run dev

# Build production version
npm run build

# Run tests
npm test

# Check health
curl http://localhost:3000/health
```

### System Service (Linux)

If installed with enhanced installer:

```bash
# Start/stop/restart
sudo systemctl start phantom-spire
sudo systemctl stop phantom-spire
sudo systemctl restart phantom-spire

# View logs
sudo journalctl -u phantom-spire -f

# Enable/disable auto-start
sudo systemctl enable phantom-spire
sudo systemctl disable phantom-spire
```

## 🔍 Troubleshooting

### Database Connection Issues

1. **Check containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Check database logs:**
   ```bash
   docker-compose logs postgres
   docker-compose logs mysql
   docker-compose logs mongo
   docker-compose logs redis
   ```

3. **Test individual connections:**
   ```bash
   # PostgreSQL
   docker-compose exec postgres pg_isready -U postgres
   
   # MySQL
   docker-compose exec mysql mysqladmin ping
   
   # MongoDB
   docker-compose exec mongo mongosh --eval "db.adminCommand('ismaster')"
   
   # Redis
   docker-compose exec redis redis-cli ping
   ```

### Application Issues

1. **Check application logs:**
   ```bash
   # Docker logs
   docker-compose logs app
   
   # System service logs (if using enhanced installer)
   sudo journalctl -u phantom-spire -f
   
   # Direct logs
   tail -f logs/application.log
   ```

2. **Verify environment configuration:**
   ```bash
   # Check .env file exists and has database URLs
   cat .env | grep -E "(MONGODB|POSTGRESQL|MYSQL|REDIS)_URI"
   ```

3. **Test health endpoint:**
   ```bash
   curl -v http://localhost:3000/health
   ```

### Port Conflicts

If default ports are in use, you can modify `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Change to 5433 if 5432 is in use
  mysql:
    ports:
      - "3307:3306"  # Change to 3307 if 3306 is in use
  # ... etc
```

Don't forget to update your `.env` file accordingly.

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in after this command
```

## 🎯 Next Steps

After successful setup:

1. **Complete the setup wizard** at http://localhost:3000/setup
2. **Create your administrator account**
3. **Configure external integrations** (MISP, OTX, VirusTotal)
4. **Import threat intelligence feeds**
5. **Set up automated workflows**
6. **Configure user roles and permissions**

## 📚 Additional Resources

- **Full Documentation**: [README.md](README.md)
- **Development Guide**: [.development/docs/DEVELOPMENT.md](.development/docs/DEVELOPMENT.md)
- **API Documentation**: http://localhost:3000/api/docs (after setup)
- **Security Guide**: [SECURITY.md](SECURITY.md)
- **Production Setup**: [.development/docs/PRODUCTION.md](.development/docs/PRODUCTION.md)

## 🆘 Getting Help

- **GitHub Issues**: https://github.com/harborgrid-justin/phantom-spire/issues
- **Discussions**: https://github.com/harborgrid-justin/phantom-spire/discussions
- **Documentation**: Check the `/docs` directory in your installation

---

**Ready to secure your organization with enterprise-grade threat intelligence!** 🛡️

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