#!/bin/bash

# Phantom Spire CTI Platform - Enhanced Setup Script
# This script provides complete data layer setup with PostgreSQL, MySQL, MongoDB, and Redis

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/setup.log"
SETUP_VERSION="2.0.0"

# Default values
INSTALL_DIR="/opt/phantom-spire"
SERVICE_USER="phantom-spire"
NODEJS_VERSION="18"
MONGODB_VERSION="5.0"
POSTGRES_VERSION="14"
MYSQL_VERSION="8.0"
REDIS_VERSION="6.2"

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
        VER=$(lsb_release -sr)
    elif [[ -f /etc/redhat-release ]]; then
        OS="centos"
        VER=$(cat /etc/redhat-release | sed 's/.*release //' | sed 's/ .*//')
    else
        OS=$(uname -s | tr '[:upper:]' '[:lower:]')
        VER=$(uname -r)
    fi
    
    case $OS in
        ubuntu|debian) PACKAGE_MANAGER="apt-get" ;;
        centos|rhel|fedora) PACKAGE_MANAGER="yum" ;;
        *) OS="unknown" ;;
    esac
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_header() {
    echo -e "\n${WHITE}===================================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${WHITE} $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${WHITE}===================================================${NC}\n" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log_error "Error in $1. Check $LOG_FILE for details."
    log_error "To retry: $0"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check system requirements
check_system_requirements() {
    log_header "CHECKING SYSTEM REQUIREMENTS"
    
    # Check available memory (minimum 2GB recommended)
    local mem_gb=$(free -g | awk 'NR==2{printf "%d", $7}')
    if [[ $mem_gb -lt 2 ]]; then
        log_warning "Available memory: ${mem_gb}GB (2GB+ recommended)"
    else
        log_success "Available memory: ${mem_gb}GB"
    fi
    
    # Check disk space (minimum 20GB recommended)
    local disk_gb=$(df / | awk 'NR==2{printf "%d", $4/1024/1024}')
    if [[ $disk_gb -lt 20 ]]; then
        log_warning "Available disk space: ${disk_gb}GB (20GB+ recommended)"
    else
        log_success "Available disk space: ${disk_gb}GB"
    fi
    
    # Check if ports are available
    local ports=(3000 5432 3306 27017 6379 8080 8081 8082)
    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep ":${port} " >/dev/null; then
            log_warning "Port $port is already in use"
        else
            log_success "Port $port is available"
        fi
    done
}

# Install system dependencies
install_system_deps() {
    log_header "INSTALLING SYSTEM DEPENDENCIES"
    
    case $OS in
        ubuntu|debian)
            apt-get update
            apt-get install -y curl wget gnupg2 software-properties-common \
                apt-transport-https ca-certificates lsb-release \
                build-essential git unzip netstat-plex
            ;;
        centos|fedora)
            yum update -y
            yum groupinstall -y "Development Tools"
            yum install -y curl wget gnupg2 git unzip net-tools
            ;;
        *)
            log_error "Unsupported operating system: $OS"
            exit 1
            ;;
    esac
    
    log_success "System dependencies installed"
}

# Install Docker and Docker Compose
install_docker() {
    log_header "INSTALLING DOCKER & DOCKER COMPOSE"
    
    if command -v docker &> /dev/null; then
        log_success "Docker already installed: $(docker --version)"
    else
        log_info "Installing Docker..."
        
        case $OS in
            ubuntu|debian)
                # Add Docker's official GPG key
                curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                
                # Add Docker repository
                echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
                
                apt-get update
                apt-get install -y docker-ce docker-ce-cli containerd.io
                ;;
            centos|fedora)
                yum install -y yum-utils
                yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                yum install -y docker-ce docker-ce-cli containerd.io
                ;;
        esac
        
        # Start and enable Docker
        systemctl start docker
        systemctl enable docker
        
        log_success "Docker installed and started"
    fi
    
    # Install Docker Compose
    if command -v docker-compose &> /dev/null; then
        log_success "Docker Compose already installed: $(docker-compose --version)"
    else
        log_info "Installing Docker Compose..."
        
        # Install Docker Compose v2
        local compose_version=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
        curl -L "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        log_success "Docker Compose installed: $(docker-compose --version)"
    fi
    
    # Add current user to docker group if not root
    if [[ -n "${SUDO_USER:-}" ]]; then
        usermod -aG docker "$SUDO_USER"
        log_info "Added $SUDO_USER to docker group. Please log out and back in."
    fi
}

# Install Node.js
install_nodejs() {
    log_header "INSTALLING NODE.JS"
    
    if command -v node &> /dev/null; then
        local current_version=$(node --version | sed 's/v//')
        local major_version=$(echo "$current_version" | cut -d. -f1)
        
        if [[ $major_version -ge $NODEJS_VERSION ]]; then
            log_success "Node.js already installed: v$current_version"
            return
        fi
    fi
    
    log_info "Installing Node.js $NODEJS_VERSION..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODEJS_VERSION}.x | bash -
    
    case $OS in
        ubuntu|debian)
            apt-get install -y nodejs
            ;;
        centos|fedora)
            yum install -y nodejs npm
            ;;
    esac
    
    log_success "Node.js installed: $(node --version)"
    log_success "npm installed: $(npm --version)"
}

# Setup Phantom Spire application
setup_phantom_spire() {
    log_header "SETTING UP PHANTOM SPIRE APPLICATION"
    
    # Create application directory
    if [[ ! -d "$INSTALL_DIR" ]]; then
        log_info "Creating application directory: $INSTALL_DIR"
        mkdir -p "$INSTALL_DIR"
    fi
    
    # Copy application files
    log_info "Copying application files..."
    cp -r "$PROJECT_ROOT"/* "$INSTALL_DIR/"
    
    # Create necessary directories
    local dirs=("logs" "uploads" "backups" "setup")
    for dir in "${dirs[@]}"; do
        mkdir -p "$INSTALL_DIR/$dir"
        log_info "Created directory: $INSTALL_DIR/$dir"
    done
    
    # Set up environment file
    if [[ ! -f "$INSTALL_DIR/.env" ]]; then
        log_info "Creating environment configuration..."
        cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
        
        # Generate secure secrets
        local jwt_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        local session_secret=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        
        # Update environment file with secure values
        sed -i "s/your-super-secret-jwt-key.*/$jwt_secret/" "$INSTALL_DIR/.env"
        sed -i "s/your-session-secret.*/$session_secret/" "$INSTALL_DIR/.env"
        
        log_success "Environment configuration created with secure secrets"
    fi
    
    # Install npm dependencies
    log_info "Installing Node.js dependencies..."
    cd "$INSTALL_DIR"
    npm install --production
    
    log_success "Phantom Spire application setup completed"
}

# Setup databases with Docker
setup_databases() {
    log_header "SETTING UP MULTI-DATABASE ENVIRONMENT"
    
    cd "$INSTALL_DIR"
    
    log_info "Starting database containers..."
    docker-compose up -d postgres mysql mongo redis adminer mongo-express redis-commander
    
    # Wait for databases to be ready
    log_info "Waiting for databases to initialize..."
    local max_attempts=60
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        attempt=$((attempt + 1))
        log_info "Database initialization check $attempt/$max_attempts"
        
        # Check if all databases are responding
        local ready_count=0
        
        # Check PostgreSQL
        if docker-compose exec -T postgres pg_isready -U postgres &>/dev/null; then
            ready_count=$((ready_count + 1))
        fi
        
        # Check MySQL
        if docker-compose exec -T mysql mysqladmin ping -h localhost --silent &>/dev/null; then
            ready_count=$((ready_count + 1))
        fi
        
        # Check MongoDB
        if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ismaster')" &>/dev/null; then
            ready_count=$((ready_count + 1))
        fi
        
        # Check Redis
        if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
            ready_count=$((ready_count + 1))
        fi
        
        if [[ $ready_count -eq 4 ]]; then
            log_success "All databases are ready!"
            break
        fi
        
        sleep 5
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        log_error "Databases did not initialize within expected time"
        return 1
    fi
    
    # Display database access information
    log_info "Database containers are running:"
    echo -e "${CYAN}  PostgreSQL:${NC} localhost:5432 (user: postgres, db: phantom_spire)"
    echo -e "${CYAN}  MySQL:${NC}      localhost:3306 (user: phantom_user, db: phantom_spire)"
    echo -e "${CYAN}  MongoDB:${NC}    localhost:27017 (db: phantom-spire)"
    echo -e "${CYAN}  Redis:${NC}      localhost:6379"
    echo -e "${CYAN}  Adminer:${NC}    http://localhost:8080 (database admin)"
    echo -e "${CYAN}  Mongo Express:${NC} http://localhost:8081 (MongoDB admin)"
    echo -e "${CYAN}  Redis Commander:${NC} http://localhost:8082 (Redis admin)"
}

# Create systemd service
create_systemd_service() {
    log_header "CREATING SYSTEMD SERVICE"
    
    local service_file="/etc/systemd/system/phantom-spire.service"
    
    cat > "$service_file" << EOF
[Unit]
Description=Phantom Spire CTI Platform
Documentation=https://github.com/harborgrid-justin/phantom-spire
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStartPre=/usr/local/bin/docker-compose -f $INSTALL_DIR/docker-compose.yml up -d
ExecStart=/usr/bin/npm start
ExecReload=/bin/kill -HUP \$MAINPID
ExecStop=/usr/local/bin/docker-compose -f $INSTALL_DIR/docker-compose.yml down
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=phantom-spire

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable phantom-spire
    
    log_success "Systemd service created and enabled"
}

# Configure firewall
configure_firewall() {
    log_header "CONFIGURING FIREWALL"
    
    # Check if UFW is available
    if command -v ufw &> /dev/null; then
        log_info "Configuring UFW firewall..."
        
        # Allow SSH (if not already configured)
        ufw allow ssh
        
        # Allow application ports
        ufw allow 3000/tcp comment 'Phantom Spire Web Interface'
        ufw allow 8080/tcp comment 'Database Admin (Adminer)'
        ufw allow 8081/tcp comment 'MongoDB Admin'
        ufw allow 8082/tcp comment 'Redis Admin'
        
        # Enable firewall if not already enabled
        echo "y" | ufw enable 2>/dev/null || true
        
        log_success "UFW firewall configured"
        
    elif command -v firewall-cmd &> /dev/null; then
        log_info "Configuring firewalld..."
        
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --permanent --add-port=8080/tcp
        firewall-cmd --permanent --add-port=8081/tcp
        firewall-cmd --permanent --add-port=8082/tcp
        firewall-cmd --reload
        
        log_success "Firewalld configured"
        
    else
        log_warning "No supported firewall found. Manual configuration may be required."
    fi
}

# Setup service user
setup_service_user() {
    log_header "SETTING UP SERVICE USER"
    
    if id "$SERVICE_USER" &>/dev/null; then
        log_success "User $SERVICE_USER already exists"
    else
        log_info "Creating service user: $SERVICE_USER"
        
        case $OS in
            ubuntu|debian)
                adduser --system --group --home "$INSTALL_DIR" --shell /bin/bash "$SERVICE_USER"
                ;;
            centos|fedora)
                useradd --system --home-dir "$INSTALL_DIR" --shell /bin/bash "$SERVICE_USER"
                ;;
        esac
        
        log_success "Service user created: $SERVICE_USER"
    fi
    
    # Set ownership
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    chmod -R 755 "$INSTALL_DIR"
    
    # Add service user to docker group
    usermod -aG docker "$SERVICE_USER"
    
    log_success "File permissions configured"
}

# Build application
build_application() {
    log_header "BUILDING APPLICATION"
    
    cd "$INSTALL_DIR"
    
    # Install all dependencies (including dev dependencies for build)
    log_info "Installing all dependencies..."
    sudo -u "$SERVICE_USER" npm install
    
    # Build the application
    log_info "Building TypeScript application..."
    sudo -u "$SERVICE_USER" npm run build
    
    # Remove dev dependencies
    log_info "Removing development dependencies..."
    sudo -u "$SERVICE_USER" npm prune --production
    
    log_success "Application built successfully"
}

# Start services
start_services() {
    log_header "STARTING SERVICES"
    
    # Start and test databases
    log_info "Starting database containers..."
    cd "$INSTALL_DIR"
    sudo -u "$SERVICE_USER" docker-compose up -d
    
    # Wait a moment for services to start
    sleep 10
    
    # Start Phantom Spire service
    log_info "Starting Phantom Spire service..."
    systemctl start phantom-spire
    
    # Check service status
    if systemctl is-active --quiet phantom-spire; then
        log_success "Phantom Spire service started successfully"
    else
        log_error "Failed to start Phantom Spire service"
        return 1
    fi
}

# Verify installation
verify_installation() {
    log_header "VERIFYING INSTALLATION"
    
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        attempt=$((attempt + 1))
        log_info "Health check attempt $attempt/$max_attempts"
        
        if curl -f http://localhost:3000/health &>/dev/null; then
            log_success "✅ Phantom Spire is responding on http://localhost:3000"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "❌ Phantom Spire is not responding. Check logs: journalctl -u phantom-spire -f"
            return 1
        fi
        
        sleep 5
    done
    
    # Verify database connections
    log_info "Verifying database connections..."
    
    # Test databases individually
    local db_status=0
    
    if docker-compose exec -T postgres pg_isready -U postgres &>/dev/null; then
        log_success "✅ PostgreSQL is ready"
    else
        log_error "❌ PostgreSQL connection failed"
        db_status=1
    fi
    
    if docker-compose exec -T mysql mysqladmin ping -h localhost --silent &>/dev/null; then
        log_success "✅ MySQL is ready"
    else
        log_error "❌ MySQL connection failed"
        db_status=1
    fi
    
    if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ismaster')" &>/dev/null; then
        log_success "✅ MongoDB is ready"
    else
        log_error "❌ MongoDB connection failed"
        db_status=1
    fi
    
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        log_success "✅ Redis is ready"
    else
        log_error "❌ Redis connection failed"
        db_status=1
    fi
    
    return $db_status
}

# Display post-installation information
display_post_install() {
    log_header "INSTALLATION COMPLETED SUCCESSFULLY!"
    
    echo -e "${GREEN}🎉 Phantom Spire CTI Platform has been installed successfully!${NC}\n"
    
    echo -e "${WHITE}📍 ACCESS INFORMATION:${NC}"
    echo -e "${CYAN}   Web Interface:${NC}     http://localhost:3000"
    echo -e "${CYAN}   Setup Wizard:${NC}      http://localhost:3000/setup"
    echo -e "${CYAN}   API Documentation:${NC} http://localhost:3000/api/docs"
    echo -e "${CYAN}   Health Check:${NC}      http://localhost:3000/health"
    echo ""
    
    echo -e "${WHITE}🗄️  DATABASE ADMINISTRATION:${NC}"
    echo -e "${CYAN}   Adminer (All DBs):${NC}   http://localhost:8080"
    echo -e "${CYAN}   MongoDB Admin:${NC}       http://localhost:8081"
    echo -e "${CYAN}   Redis Commander:${NC}     http://localhost:8082"
    echo ""
    
    echo -e "${WHITE}🔧 SYSTEM MANAGEMENT:${NC}"
    echo -e "${CYAN}   Start Service:${NC}       sudo systemctl start phantom-spire"
    echo -e "${CYAN}   Stop Service:${NC}        sudo systemctl stop phantom-spire"
    echo -e "${CYAN}   Restart Service:${NC}     sudo systemctl restart phantom-spire"
    echo -e "${CYAN}   View Logs:${NC}           sudo journalctl -u phantom-spire -f"
    echo -e "${CYAN}   Database Logs:${NC}       cd $INSTALL_DIR && docker-compose logs -f"
    echo ""
    
    echo -e "${WHITE}🚀 NEXT STEPS:${NC}"
    echo -e "${YELLOW}   1.${NC} Complete setup: http://localhost:3000/setup"
    echo -e "${YELLOW}   2.${NC} Create administrator account"
    echo -e "${YELLOW}   3.${NC} Configure external integrations (MISP, OTX, VirusTotal)"
    echo -e "${YELLOW}   4.${NC} Import threat intelligence feeds"
    echo -e "${YELLOW}   5.${NC} Set up automated workflows"
    echo ""
    
    echo -e "${WHITE}📚 DOCUMENTATION:${NC}"
    echo -e "${CYAN}   Installation Dir:${NC}   $INSTALL_DIR"
    echo -e "${CYAN}   Log File:${NC}           $LOG_FILE"
    echo -e "${CYAN}   Configuration:${NC}      $INSTALL_DIR/.env"
    echo ""
    
    echo -e "${GREEN}Setup completed at $(date)${NC}"
    echo -e "${WHITE}Support: https://github.com/harborgrid-justin/phantom-spire${NC}"
}

# Cleanup function
cleanup() {
    log_info "Performing cleanup..."
    cd "$PROJECT_ROOT"
}

# Main installation function
main() {
    log_header "PHANTOM SPIRE CTI PLATFORM INSTALLATION"
    echo -e "${PURPLE}Version: $SETUP_VERSION${NC}"
    echo -e "${PURPLE}Enhanced Multi-Database Setup${NC}\n"
    
    # Initialize log file
    echo "Phantom Spire Installation Log - $(date)" > "$LOG_FILE"
    
    detect_os
    log_info "Detected OS: $OS $VER"
    
    # Check if running as root
    check_root
    
    # Installation steps
    check_system_requirements || handle_error "System requirements check"
    install_system_deps || handle_error "System dependencies installation"
    install_docker || handle_error "Docker installation"
    install_nodejs || handle_error "Node.js installation"
    setup_service_user || handle_error "Service user creation"
    setup_phantom_spire || handle_error "Phantom Spire setup"
    setup_databases || handle_error "Database setup"
    build_application || handle_error "Application build"
    create_systemd_service || handle_error "Service creation"
    configure_firewall || handle_error "Firewall configuration"
    start_services || handle_error "Service startup"
    verify_installation || handle_error "Installation verification"
    
    # Cleanup
    cleanup
    
    # Display post-installation info
    display_post_install
}

# Handle script interruption
trap cleanup EXIT

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi