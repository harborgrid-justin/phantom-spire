# Phantom Spire CTI Platform - Enterprise Installation Guide

## 🏆 Enterprise-Grade Cyber Threat Intelligence Platform

Phantom Spire is an enterprise-ready Cyber Threat Intelligence (CTI) platform designed to compete with industry leaders like Anomali. This installation guide provides secure, production-ready deployment options.

## 🚀 Quick Start

### One-Line Installation (Basic)
```bash
curl -fsSL https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/install.sh | sudo bash
```

### Enhanced Installation (Recommended for Enterprise)
```bash
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire
sudo ./scripts/enhanced-install.sh
```

## 📋 System Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+, CentOS 8+, Fedora 35+, or macOS 12+
- **Memory**: 4GB RAM (8GB+ recommended for production)
- **Storage**: 20GB available disk space (50GB+ recommended)
- **Network**: Internet connection for downloads and updates

### Production Requirements
- **Memory**: 16GB+ RAM
- **CPU**: 4+ cores
- **Storage**: 100GB+ SSD storage
- **Network**: Dedicated network interface
- **SSL Certificate**: Valid TLS certificate for HTTPS

## 🔒 Security Features

### ✅ Enterprise Security Standards
- **Secure Installation**: No unsafe curl | bash patterns
- **Strong Cryptography**: 64-byte JWT secrets, 32-byte session keys
- **System Hardening**: Systemd service isolation and resource limits
- **HTTPS Support**: Built-in SSL/TLS configuration
- **Audit Logging**: Comprehensive security event logging
- **Rate Limiting**: DDoS protection and API throttling
- **Input Validation**: Comprehensive security checks

### 🛡️ Security Hardening Features
- Process isolation with systemd
- File system restrictions
- Network namespace isolation
- Memory and CPU limits
- No new privileges enforcement
- Real-time restrictions

## 🏢 Enterprise Features

### Advanced CTI Capabilities
- **Threat Intelligence Feeds**: Automated ingestion and processing
- **Incident Response**: Workflow automation and case management
- **Risk Assessment**: Automated threat scoring and prioritization
- **Integration APIs**: Enterprise system integration
- **Multi-Database Support**: PostgreSQL, MySQL, MongoDB, Redis
- **Scalable Architecture**: Microservices with service mesh

### 📊 Monitoring & Observability
- Health check endpoints
- Prometheus metrics integration
- Centralized logging with rotation
- Performance monitoring
- Automated backup and recovery

## 📖 Installation Options

### Option 1: Standard Installation (`install.sh`)
- Single-database setup (MongoDB + Redis)
- Basic configuration
- Suitable for development and small deployments

```bash
# Download and run
curl -fsSL https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/install.sh -o phantom-spire-install.sh
chmod +x phantom-spire-install.sh
sudo ./phantom-spire-install.sh
```

### Option 2: Enhanced Installation (`enhanced-install.sh`)
- Multi-database support (PostgreSQL, MySQL, MongoDB, Redis)
- Docker-based database containers
- Enterprise SSL/TLS configuration
- Advanced monitoring and logging
- Recommended for production

```bash
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire
sudo ./scripts/enhanced-install.sh
```

## 🔧 Post-Installation Configuration

### 1. Initial Setup
Access the setup wizard at:
- **HTTPS**: https://localhost:3443/setup
- **HTTP**: http://localhost:3000/setup

### 2. Create Administrator Account
```bash
curl -X POST https://localhost:3443/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure_password",
    "email": "admin@yourcompany.com",
    "role": "administrator"
  }'
```

### 3. Configure Production Settings

Edit the configuration file:
```bash
sudo -u phantom-spire nano /opt/phantom-spire/.env
```

Key settings to update:
```env
# Update CORS origins for your domain
CORS_ORIGINS=https://your-production-domain.com

# Configure database authentication
MONGODB_URI=mongodb://username:password@localhost:27017/phantom-spire
REDIS_URL=redis://password@localhost:6379

# SSL/TLS configuration
HTTPS_ENABLED=true
HTTPS_PORT=3443
SSL_CERT_PATH=/path/to/your/certificate.crt
SSL_KEY_PATH=/path/to/your/private.key
```

### 4. Database Security
Configure database authentication:

**MongoDB:**
```bash
sudo -u phantom-spire mongosh phantom-spire --eval "
db.createUser({
  user: 'phantom-spire',
  pwd: 'secure_database_password',
  roles: ['dbOwner']
})"
```

**Redis:**
```bash
echo "requirepass secure_redis_password" | sudo tee -a /etc/redis/redis.conf
sudo systemctl restart redis
```

## 🚀 Production Deployment

### Reverse Proxy Configuration (nginx)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Firewall Configuration
```bash
# Allow HTTPS traffic
sudo ufw allow 443/tcp
sudo ufw allow 3443/tcp

# Restrict database ports to localhost only
sudo ufw deny 27017  # MongoDB
sudo ufw deny 6379   # Redis
sudo ufw deny 5432   # PostgreSQL
sudo ufw deny 3306   # MySQL
```

## 🔍 Validation & Testing

Run the enterprise validation script:
```bash
./scripts/validate-installation.sh
```

Expected result: **Grade: ENTERPRISE READY** (90%+ pass rate)

### Health Checks
```bash
# Application health
curl -k https://localhost:3443/health

# Service status
sudo systemctl status phantom-spire

# View logs
sudo journalctl -u phantom-spire -f
```

## 🛠️ Service Management

### SystemD Commands
```bash
# Start service
sudo systemctl start phantom-spire

# Stop service
sudo systemctl stop phantom-spire

# Restart service
sudo systemctl restart phantom-spire

# Check status
sudo systemctl status phantom-spire

# View logs
sudo journalctl -u phantom-spire -f
```

### Database Management
```bash
# Start databases (enhanced installation)
cd /opt/phantom-spire && sudo -u phantom-spire docker-compose up -d

# View database logs
cd /opt/phantom-spire && sudo -u phantom-spire docker-compose logs -f

# Database administration interfaces
# Adminer (all databases): http://localhost:8080
# MongoDB Admin: http://localhost:8081
# Redis Commander: http://localhost:8082
```

## 📊 Monitoring & Maintenance

### Log Files
- **Application**: `/var/log/phantom-spire/`
- **System Service**: `sudo journalctl -u phantom-spire`
- **Database**: `docker-compose logs` (enhanced installation)

### Backup & Recovery
Automated backups are configured to run daily at 2 AM:
```bash
# Check backup status
ls -la /var/lib/phantom-spire/backups/

# Manual backup
sudo -u phantom-spire /opt/phantom-spire/scripts/backup.sh
```

### Performance Monitoring
- **Metrics**: http://localhost:9090 (if Prometheus enabled)
- **Health Check**: https://localhost:3443/health
- **System Resources**: `htop`, `iotop`, `netstat`

## 🆘 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   sudo journalctl -u phantom-spire --no-pager -l
   ```

2. **Database connection errors**
   ```bash
   # Check database status
   sudo systemctl status mongod redis
   
   # Enhanced installation database check
   cd /opt/phantom-spire && docker-compose ps
   ```

3. **Permission issues**
   ```bash
   sudo chown -R phantom-spire:phantom-spire /opt/phantom-spire
   sudo chown -R phantom-spire:phantom-spire /var/log/phantom-spire
   ```

4. **Port conflicts**
   ```bash
   sudo netstat -tlnp | grep -E ":(3000|3443|8080|8081|8082)"
   ```

### Getting Help
- **Documentation**: `/opt/phantom-spire/.development/docs/`
- **Issues**: https://github.com/harborgrid-justin/phantom-spire/issues
- **Discussions**: https://github.com/harborgrid-justin/phantom-spire/discussions

## 🏆 Enterprise Comparison

### vs. Anomali ThreatStream
| Feature | Phantom Spire | Anomali ThreatStream |
|---------|---------------|---------------------|
| **Installation Security** | ✅ Enterprise-grade | ⚠️ Standard |
| **Multi-Database Support** | ✅ 4 databases | ❌ Limited |
| **Docker Integration** | ✅ Full support | ⚠️ Limited |
| **SSL/TLS by default** | ✅ Built-in | ⚠️ Manual setup |
| **Service Hardening** | ✅ SystemD isolation | ❌ Basic |
| **Open Source** | ✅ MIT License | ❌ Proprietary |
| **Cost** | ✅ Free | 💰 Expensive |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Phantom Spire CTI Platform** - Enterprise-grade cyber threat intelligence for the modern enterprise.