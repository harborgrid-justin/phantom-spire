#!/bin/bash

# Phantom Spire Enterprise CTI Platform - Installation Script
# Version: 1.0.0
# Description: One-click installation script for production deployment

set -e

# Configuration
SCRIPT_VERSION="1.0.0"
PHANTOM_SPIRE_VERSION="1.0.0"
INSTALL_DIR="/opt/phantom-spire"
SERVICE_USER="phantom-spire"
MONGODB_VERSION="5.0"
REDIS_VERSION="6.2"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Display banner
display_banner() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗ ██╗  ██╗ █████╗ ███╗   ██╗████████╗ ██████╗ ███╗  ║
║   ██╔══██╗██║  ██║██╔══██╗████╗  ██║╚══██╔══╝██╔═══██╗████╗ ║
║   ██████╔╝███████║███████║██╔██╗ ██║   ██║   ██║   ██║██╔██╗║
║   ██╔═══╝ ██╔══██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██║
║   ██║     ██║  ██║██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚█║
║   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝  ╚╝
║                                                              ║
║               SPIRE ENTERPRISE CTI PLATFORM                 ║
║                                                              ║
║           Enterprise Cyber Threat Intelligence               ║
║               Production Installation Script                 ║
║                      Version 1.0.0                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons."
        log_info "Please run as a regular user with sudo privileges."
        exit 1
    fi

    # Check if user has sudo privileges
    if ! sudo -n true 2>/dev/null; then
        log_error "This script requires sudo privileges."
        log_info "Please ensure your user is in the sudo group."
        exit 1
    fi
}

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            OS="ubuntu"
            PACKAGE_MANAGER="apt-get"
        elif command -v yum &> /dev/null; then
            OS="centos"
            PACKAGE_MANAGER="yum"
        elif command -v dnf &> /dev/null; then
            OS="fedora"
            PACKAGE_MANAGER="dnf"
        else
            log_error "Unsupported Linux distribution"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi

    log_info "Detected OS: $OS"
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."

    # Check memory
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}' 2>/dev/null || echo "0")
    MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    
    if [[ $MEMORY_GB -lt 8 ]]; then
        log_warning "System has ${MEMORY_GB}GB RAM. Minimum 8GB recommended for production."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "Memory check passed: ${MEMORY_GB}GB RAM"
    fi

    # Check disk space
    DISK_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $DISK_SPACE -lt 50 ]]; then
        log_warning "Available disk space: ${DISK_SPACE}GB. Minimum 50GB recommended."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "Disk space check passed: ${DISK_SPACE}GB available"
    fi
}

# Install system dependencies
install_system_deps() {
    log_info "Installing system dependencies..."

    case $OS in
        ubuntu)
            sudo apt-get update
            sudo apt-get install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
            ;;
        centos|fedora)
            sudo $PACKAGE_MANAGER update -y
            sudo $PACKAGE_MANAGER install -y curl wget gnupg2 ca-certificates
            ;;
        macos)
            if ! command -v brew &> /dev/null; then
                log_info "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            ;;
    esac

    log_success "System dependencies installed"
}

# Install Node.js
install_nodejs() {
    log_info "Installing Node.js ${NODE_VERSION}..."

    if command -v node &> /dev/null; then
        NODE_CURRENT_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
        if [[ $NODE_CURRENT_VERSION -ge $NODE_VERSION ]]; then
            log_success "Node.js $(node -v) already installed"
            return
        fi
    fi

    case $OS in
        ubuntu)
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        centos)
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        fedora)
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
            sudo dnf install -y nodejs
            ;;
        macos)
            brew install node@${NODE_VERSION}
            ;;
    esac

    # Verify installation
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        log_success "Node.js $(node -v) and npm $(npm -v) installed successfully"
    else
        log_error "Failed to install Node.js"
        exit 1
    fi
}

# Install MongoDB
install_mongodb() {
    log_info "Installing MongoDB ${MONGODB_VERSION}..."

    if command -v mongod &> /dev/null; then
        log_success "MongoDB already installed"
        return
    fi

    case $OS in
        ubuntu)
            wget -qO - https://www.mongodb.org/static/pgp/server-${MONGODB_VERSION}.asc | sudo apt-key add -
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/${MONGODB_VERSION} multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-${MONGODB_VERSION}.list
            sudo apt-get update
            sudo apt-get install -y mongodb-org
            ;;
        centos)
            sudo tee /etc/yum.repos.d/mongodb-org-${MONGODB_VERSION}.repo << EOF
[mongodb-org-${MONGODB_VERSION}]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/${MONGODB_VERSION}/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-${MONGODB_VERSION}.asc
EOF
            sudo yum install -y mongodb-org
            ;;
        fedora)
            sudo tee /etc/yum.repos.d/mongodb-org-${MONGODB_VERSION}.repo << EOF
[mongodb-org-${MONGODB_VERSION}]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/${MONGODB_VERSION}/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-${MONGODB_VERSION}.asc
EOF
            sudo dnf install -y mongodb-org
            ;;
        macos)
            brew tap mongodb/brew
            brew install mongodb-community@${MONGODB_VERSION}
            ;;
    esac

    # Start and enable MongoDB service
    if [[ "$OS" != "macos" ]]; then
        sudo systemctl start mongod
        sudo systemctl enable mongod
    else
        brew services start mongodb/brew/mongodb-community
    fi

    log_success "MongoDB installed and started"
}

# Install Redis
install_redis() {
    log_info "Installing Redis ${REDIS_VERSION}..."

    if command -v redis-server &> /dev/null; then
        log_success "Redis already installed"
        return
    fi

    case $OS in
        ubuntu)
            sudo apt-get install -y redis-server
            ;;
        centos|fedora)
            sudo $PACKAGE_MANAGER install -y redis
            ;;
        macos)
            brew install redis
            ;;
    esac

    # Start and enable Redis service
    if [[ "$OS" != "macos" ]]; then
        sudo systemctl start redis
        sudo systemctl enable redis
    else
        brew services start redis
    fi

    log_success "Redis installed and started"
}

# Create service user
create_service_user() {
    log_info "Creating service user: $SERVICE_USER..."

    if id "$SERVICE_USER" &>/dev/null; then
        log_success "User $SERVICE_USER already exists"
        return
    fi

    case $OS in
        ubuntu|centos|fedora)
            sudo useradd --system --home-dir "$INSTALL_DIR" --shell /bin/bash "$SERVICE_USER"
            ;;
        macos)
            sudo dscl . -create "/Users/$SERVICE_USER"
            sudo dscl . -create "/Users/$SERVICE_USER" UserShell /bin/bash
            sudo dscl . -create "/Users/$SERVICE_USER" RealName "Phantom Spire Service"
            sudo dscl . -create "/Users/$SERVICE_USER" UniqueID 499
            sudo dscl . -create "/Users/$SERVICE_USER" PrimaryGroupID 499
            sudo dscl . -create "/Users/$SERVICE_USER" NFSHomeDirectory "$INSTALL_DIR"
            ;;
    esac

    log_success "Service user $SERVICE_USER created"
}

# Download and install Phantom Spire
install_phantom_spire() {
    log_info "Installing Phantom Spire ${PHANTOM_SPIRE_VERSION}..."

    # Create installation directory
    sudo mkdir -p "$INSTALL_DIR"
    
    # Check if git is available
    if command -v git &> /dev/null; then
        log_info "Cloning Phantom Spire repository..."
        sudo git clone https://github.com/harborgrid-justin/phantom-spire.git "$INSTALL_DIR/app"
    else
        log_info "Downloading Phantom Spire release..."
        cd /tmp
        wget "https://github.com/harborgrid-justin/phantom-spire/archive/refs/heads/main.zip" -O phantom-spire.zip
        unzip phantom-spire.zip
        sudo mv phantom-spire-main "$INSTALL_DIR/app"
    fi

    # Change ownership
    sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"

    # Install dependencies
    cd "$INSTALL_DIR/app"
    sudo -u "$SERVICE_USER" npm install --production

    # Build the application
    sudo -u "$SERVICE_USER" npm run build

    log_success "Phantom Spire installed successfully"
}

# Generate configuration
generate_config() {
    log_info "Generating configuration files..."

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)

    # Create .env file
    sudo -u "$SERVICE_USER" cat > "$INSTALL_DIR/app/.env" << EOF
# Phantom Spire Production Configuration
# Generated on $(date)

# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Security
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
BCRYPT_ROUNDS=12

# Database
MONGODB_URI=mongodb://localhost:27017/phantom-spire
REDIS_URL=redis://localhost:6379

# CORS (Update with your domain)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Features
ENABLE_SWAGGER_DOCS=false
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
EOF

    # Create logs directory
    sudo mkdir -p /var/log/phantom-spire
    sudo chown "$SERVICE_USER:$SERVICE_USER" /var/log/phantom-spire

    log_success "Configuration files generated"
}

# Create systemd service
create_service() {
    if [[ "$OS" == "macos" ]]; then
        create_launchd_service
        return
    fi

    log_info "Creating systemd service..."

    sudo tee /etc/systemd/system/phantom-spire.service > /dev/null << EOF
[Unit]
Description=Phantom Spire Enterprise CTI Platform
After=network.target mongod.service redis.service
Wants=mongod.service redis.service

[Service]
Type=simple
User=${SERVICE_USER}
WorkingDirectory=${INSTALL_DIR}/app
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=phantom-spire
Environment=NODE_ENV=production

# Security
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=${INSTALL_DIR} /var/log/phantom-spire
ProtectHome=yes

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable phantom-spire

    log_success "Systemd service created"
}

# Create launchd service for macOS
create_launchd_service() {
    log_info "Creating launchd service for macOS..."

    sudo tee /Library/LaunchDaemons/com.phantom-spire.plist > /dev/null << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.phantom-spire</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>dist/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${INSTALL_DIR}/app</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>UserName</key>
    <string>${SERVICE_USER}</string>
    <key>StandardOutPath</key>
    <string>/var/log/phantom-spire/phantom-spire.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/phantom-spire/phantom-spire-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
</dict>
</plist>
EOF

    sudo launchctl load /Library/LaunchDaemons/com.phantom-spire.plist

    log_success "Launchd service created"
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."

    case $OS in
        ubuntu)
            if command -v ufw &> /dev/null; then
                sudo ufw allow 3000/tcp comment "Phantom Spire"
                log_success "UFW firewall configured"
            fi
            ;;
        centos|fedora)
            if command -v firewall-cmd &> /dev/null; then
                sudo firewall-cmd --permanent --add-port=3000/tcp
                sudo firewall-cmd --reload
                log_success "Firewalld configured"
            fi
            ;;
        macos)
            log_info "Firewall configuration on macOS should be done manually"
            ;;
    esac
}

# Start services
start_services() {
    log_info "Starting Phantom Spire service..."

    case $OS in
        ubuntu|centos|fedora)
            sudo systemctl start phantom-spire
            sleep 5
            if sudo systemctl is-active --quiet phantom-spire; then
                log_success "Phantom Spire service started successfully"
            else
                log_error "Failed to start Phantom Spire service"
                sudo systemctl status phantom-spire
                exit 1
            fi
            ;;
        macos)
            log_success "Phantom Spire service started via launchd"
            ;;
    esac
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."

    # Wait for service to start
    sleep 10

    # Check health endpoint
    if curl -f -s http://localhost:3000/health > /dev/null; then
        log_success "Health check passed"
    else
        log_warning "Health check failed - service may still be starting"
    fi

    # Check service status
    case $OS in
        ubuntu|centos|fedora)
            if sudo systemctl is-active --quiet phantom-spire; then
                log_success "Service is running"
            else
                log_error "Service is not running"
                sudo systemctl status phantom-spire
            fi
            ;;
        macos)
            if sudo launchctl list | grep com.phantom-spire > /dev/null; then
                log_success "Service is running"
            else
                log_error "Service is not running"
            fi
            ;;
    esac
}

# Display post-installation information
display_post_install() {
    log_success "Installation completed successfully!"
    
    cat << EOF

╔══════════════════════════════════════════════════════════════╗
║                    INSTALLATION COMPLETE                    ║
╚══════════════════════════════════════════════════════════════╝

🎉 Phantom Spire Enterprise CTI Platform is now installed!

📍 Installation Directory: ${INSTALL_DIR}
👤 Service User: ${SERVICE_USER}
🌐 Application URL: http://localhost:3000
📋 Health Check: http://localhost:3000/health

📋 IMPORTANT POST-INSTALLATION STEPS:

1. 🔐 SECURITY CONFIGURATION:
   • Edit ${INSTALL_DIR}/app/.env to configure:
     - CORS_ORIGINS with your actual domain(s)
     - MONGODB_URI with authentication if needed
     - REDIS_URL with password if needed
   • Set up SSL/TLS certificates for HTTPS
   • Configure reverse proxy (nginx/Apache) if needed

2. 🗄️ DATABASE SETUP:
   • MongoDB is installed and running on localhost:27017
   • Create database user with authentication:
     mongo phantom-spire --eval "db.createUser({user: 'phantom-spire', pwd: 'secure-password', roles: ['dbOwner']})"
   • Update MONGODB_URI in .env with credentials

3. 📊 MONITORING:
   • Service logs: sudo journalctl -u phantom-spire -f
   • Application logs: tail -f /var/log/phantom-spire/phantom-spire.log
   • Health check: curl http://localhost:3000/health

4. 🔧 SERVICE MANAGEMENT:
   • Start:   sudo systemctl start phantom-spire
   • Stop:    sudo systemctl stop phantom-spire
   • Restart: sudo systemctl restart phantom-spire
   • Status:  sudo systemctl status phantom-spire

5. 📚 DOCUMENTATION:
   • Production Guide: ${INSTALL_DIR}/app/README.md
   • Development Docs: ${INSTALL_DIR}/app/.development/docs/
   • API Documentation: http://localhost:3000/api-docs (dev only)

🔒 DEFAULT CREDENTIALS:
   Create your first admin user by making a POST request to:
   http://localhost:3000/api/v1/auth/register

🆘 SUPPORT:
   • GitHub: https://github.com/harborgrid-justin/phantom-spire
   • Issues: https://github.com/harborgrid-justin/phantom-spire/issues

Thank you for choosing Phantom Spire Enterprise CTI Platform!

EOF
}

# Error handling
handle_error() {
    log_error "Installation failed at step: $1"
    log_error "Check the logs above for more details"
    log_info "You can run this script again to retry the installation"
    exit 1
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -rf /tmp/phantom-spire*
}

# Main installation function
main() {
    display_banner
    
    log_info "Starting Phantom Spire Enterprise CTI Platform installation..."
    log_info "Installation script version: $SCRIPT_VERSION"
    log_info "Target Phantom Spire version: $PHANTOM_SPIRE_VERSION"
    
    # Trap errors
    trap 'handle_error "Unknown step"' ERR
    
    # Installation steps
    check_root || handle_error "Root check"
    detect_os || handle_error "OS detection"
    check_requirements || handle_error "Requirements check"
    install_system_deps || handle_error "System dependencies"
    install_nodejs || handle_error "Node.js installation"
    install_mongodb || handle_error "MongoDB installation"
    install_redis || handle_error "Redis installation"
    create_service_user || handle_error "Service user creation"
    install_phantom_spire || handle_error "Phantom Spire installation"
    generate_config || handle_error "Configuration generation"
    create_service || handle_error "Service creation"
    configure_firewall || handle_error "Firewall configuration"
    start_services || handle_error "Service startup"
    verify_installation || handle_error "Installation verification"
    
    # Cleanup
    cleanup
    
    # Display post-installation info
    display_post_install
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi