# Phantom Spire - Enterprise Cyber Threat Intelligence Platform

🚀 **Enterprise-grade Node.js/TypeScript Cyber Threat Intelligence Platform**

Phantom Spire is a comprehensive CTI (Cyber Threat Intelligence) platform designed for enterprise security operations. It provides robust IOC management, threat feed integration, alert management, and advanced analytics capabilities.

## Features

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-Based Access Control (RBAC)**: Admin, Analyst, and Viewer roles
- **API Rate Limiting**: Protection against abuse and DoS attacks
- **Security Headers**: Helmet.js integration for security hardening

### 📊 Threat Intelligence
- **IOC Management**: Complete CRUD operations for Indicators of Compromise
- **Multi-type IOC Support**: IP addresses, domains, URLs, file hashes, emails
- **Confidence & Severity Scoring**: Risk assessment and prioritization
- **Tag-based Organization**: Flexible categorization and search
- **Advanced Filtering**: Search and filter IOCs by multiple criteria

### 🔍 Alert Management
- **Comprehensive Alert System**: Create, update, and track security alerts
- **Alert Categories**: Malware, phishing, APT, botnet, vulnerability, and more
- **Status Tracking**: Open, investigating, resolved, false positive states
- **Assignment System**: Assign alerts to team members

### 📡 Threat Feed Integration (Planned)
- **Multiple Feed Formats**: RSS, JSON, CSV, STIX, MISP support
- **Automated Processing**: Scheduled feed ingestion and processing
- **Custom Parsers**: Flexible parsing for various data formats

### 🏗️ Enterprise Architecture
- **RESTful API**: Comprehensive REST API with OpenAPI documentation
- **MongoDB Integration**: Scalable NoSQL database with indexing
- **Redis Support**: Caching and session management
- **Docker Support**: Complete containerization setup
- **Health Checks**: Application monitoring and status endpoints

## Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB 5.0+
- Redis 6.2+ (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harborgrid-justin/phantom-spire.git
   cd phantom-spire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   # For development with hot reload:
   npm run dev
   ```

### Using Docker

1. **Run with Docker Compose** (includes MongoDB and Redis)
   ```bash
   docker-compose up -d
   ```

2. **Or build and run manually**
   ```bash
   docker build -t phantom-spire .
   docker run -p 3000:3000 phantom-spire
   ```

## API Documentation

Once the server is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api/v1

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

#### IOCs (Indicators of Compromise)
- `GET /api/v1/iocs` - List all IOCs (with filtering)
- `POST /api/v1/iocs` - Create new IOC
- `GET /api/v1/iocs/:id` - Get specific IOC
- `PUT /api/v1/iocs/:id` - Update IOC
- `DELETE /api/v1/iocs/:id` - Delete IOC

## Development

### Scripts
```bash
npm run dev         # Start development server with hot reload
npm run build       # Build TypeScript to JavaScript
npm run start       # Start production server
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier
```

### Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── __tests__/      # Test files
```

### Database Models

#### User
- Authentication and authorization
- Role-based permissions (admin/analyst/viewer)
- Profile management

#### IOC (Indicator of Compromise)
- Multi-type IOC storage (IP, domain, URL, hash, email)
- Confidence scoring (0-100)
- Severity levels (low/medium/high/critical)
- Tagging and metadata support

#### Alert
- Security alert management
- Category classification
- Status tracking and assignment
- IOC associations

#### ThreatFeed (Planned)
- External threat feed integration
- Automated processing configuration
- Statistics and error tracking

## Security Considerations

### Authentication & Authorization
- JWT tokens with configurable expiration
- Password hashing with bcrypt (12 rounds)
- Role-based access control for all endpoints
- Secure password requirements

### API Security
- Rate limiting (100 requests per 15 minutes by default)
- CORS configuration
- Security headers via Helmet.js
- Input validation and sanitization
- MongoDB injection prevention

### Data Protection
- Sensitive data encryption in transit
- Secure environment variable management
- Audit logging for all operations
- Database connection security

## Configuration

Key environment variables in `.env`:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/phantom-spire

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Production Checklist
- [ ] Update JWT_SECRET with a strong, random key
- [ ] Configure MongoDB with authentication
- [ ] Set up Redis for production caching
- [ ] Configure proper CORS origins
- [ ] Set up log aggregation
- [ ] Configure health check monitoring
- [ ] Set up SSL/TLS termination
- [ ] Configure backup strategies

### Docker Production
```bash
# Build production image
docker build -t phantom-spire:latest .

# Run with production environment
docker run -d \
  --name phantom-spire \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/phantom-spire \
  phantom-spire:latest
```

## Monitoring & Observability

### Health Checks
- Application health endpoint: `/health`
- Database connectivity checks
- Memory and performance metrics

### Logging
- Structured JSON logging in production
- Configurable log levels
- Request/response logging
- Error tracking and alerting

### Metrics (Planned)
- API endpoint performance
- Database query performance
- User activity analytics
- Threat intelligence metrics

## Roadmap

### Phase 1: Core Platform ✅
- [x] Authentication & Authorization
- [x] IOC Management
- [x] Basic Alert System
- [x] API Documentation
- [x] Docker Support

### Phase 2: Enhanced Features 🚧
- [ ] Advanced Alert Management
- [ ] Threat Feed Integration
- [ ] Real-time Notifications
- [ ] Dashboard Interface
- [ ] Bulk Operations

### Phase 3: Analytics & Intelligence 📋
- [ ] Threat Analytics Dashboard
- [ ] IOC Enrichment Services
- [ ] Machine Learning Integration
- [ ] Custom Report Generation
- [ ] API Rate Analytics

### Phase 4: Enterprise Features 📋
- [ ] Multi-tenancy Support
- [ ] LDAP/SSO Integration
- [ ] Advanced RBAC
- [ ] Audit Trail Enhancement
- [ ] High Availability Setup

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Follow the existing code style (ESLint + Prettier)
- Update documentation for new features
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@phantom-spire.com
- 📖 Documentation: [GitHub Wiki](https://github.com/harborgrid-justin/phantom-spire/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/harborgrid-justin/phantom-spire/issues)

---

**Built with ❤️ for the cybersecurity community**
