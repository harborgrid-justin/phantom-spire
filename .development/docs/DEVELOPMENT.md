# Development Guide - Phantom Spire CTI Platform

## Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB 5.0+
- Redis 6.2+ (optional, for future caching features)
- Docker and Docker Compose (optional)

### Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd phantom-spire
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Database Setup**
   - Ensure MongoDB is running
   - Database will be created automatically on first connection

### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Build production code
npm run build

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format
```

### Docker Development

```bash
# Start all services (app, MongoDB, Redis)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## API Usage Examples

### Authentication

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@company.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "analyst"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@company.com",
    "password": "securepassword123"
  }'
```

### IOC Management

```bash
# Create an IOC (requires authentication token)
curl -X POST http://localhost:3000/api/v1/iocs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "value": "192.168.1.100",
    "type": "ip",
    "confidence": 85,
    "severity": "high",
    "source": "Internal Security Team",
    "tags": ["malware", "botnet"],
    "description": "Known botnet C2 server"
  }'

# Get all IOCs with filtering
curl "http://localhost:3000/api/v1/iocs?type=ip&severity=high&page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Architecture

### Directory Structure
```
src/
├── config/           # Application configuration
│   ├── config.ts     # Environment configuration
│   ├── database.ts   # Database connection
│   └── swagger.ts    # API documentation
├── controllers/      # Request handlers
│   ├── authController.ts
│   └── iocController.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   ├── errorHandler.ts
│   └── validation.ts
├── models/           # Database models
│   ├── User.ts
│   ├── IOC.ts
│   ├── Alert.ts
│   └── ThreatFeed.ts
├── routes/           # API routes
│   ├── auth.ts
│   ├── iocs.ts
│   └── index.ts
├── types/            # TypeScript definitions
│   └── api.ts
├── utils/            # Utility functions
│   └── logger.ts
└── __tests__/        # Test files
```

### Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Validation**: express-validator + Joi
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Documentation**: Swagger/OpenAPI

## Testing Strategy

### Unit Tests
- Model validation and methods
- Utility function testing
- Middleware testing

### Integration Tests
- API endpoint testing
- Database integration
- Authentication flows

### Test Coverage
```bash
npm run test:coverage
```
- Target: 80%+ code coverage
- Focus on critical business logic

## Security Considerations

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Secure password requirements

### API Security
- Rate limiting per IP
- Input validation and sanitization
- CORS configuration
- Security headers (Helmet.js)
- MongoDB injection prevention

### Data Protection
- Environment-based secrets
- Audit logging
- Secure database connections
- Input sanitization

## Performance Optimization

### Database
- Proper indexing on frequently queried fields
- Compound indexes for complex queries
- Connection pooling
- Query optimization

### API
- Response compression
- Request size limits
- Efficient pagination
- Caching strategies (Redis ready)

## Deployment

### Environment Configuration
```env
# Production settings
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URI=mongodb://prod-mongo:27017/phantom-spire
REDIS_URL=redis://prod-redis:6379
```

### Docker Production
```bash
# Build image
docker build -t phantom-spire:v1.0.0 .

# Run container
docker run -d \
  --name phantom-spire \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongo:27017/phantom-spire \
  phantom-spire:v1.0.0
```

### Health Checks
- `/health` endpoint for load balancer health checks
- Database connectivity validation
- Application status monitoring

## Adding New Features

### 1. Create Database Model
```typescript
// src/models/NewFeature.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INewFeature extends Document {
  name: string;
  // ... other fields
}

const schema = new Schema<INewFeature>({
  name: { type: String, required: true },
  // ... other fields
}, { timestamps: true });

export const NewFeature = mongoose.model<INewFeature>('NewFeature', schema);
```

### 2. Create Controller
```typescript
// src/controllers/newFeatureController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const getNewFeatures = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  // Implementation
});
```

### 3. Add Routes
```typescript
// src/routes/newFeature.ts
import { Router } from 'express';
import { getNewFeatures } from '../controllers/newFeatureController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.get('/', authMiddleware, getNewFeatures);
export default router;
```

### 4. Add Tests
```typescript
// src/__tests__/newFeature.test.ts
describe('NewFeature API', () => {
  it('should get new features', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check MongoDB status
   mongosh --eval "db.adminCommand('ismaster')"
   ```

2. **JWT Token Issues**
   - Check JWT_SECRET in environment
   - Verify token expiration
   - Confirm Authorization header format

3. **Build Errors**
   ```bash
   # Clear build cache
   rm -rf dist/
   npm run build
   ```

4. **Test Failures**
   ```bash
   # Run specific test
   npm test -- --testNamePattern="test-name"
   
   # Debug test
   npm test -- --verbose
   ```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

### Performance Monitoring
- Monitor response times
- Track database query performance
- Use APM tools in production

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Run linter (`npm run lint`)
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Create Pull Request

### Code Style
- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Follow existing patterns and conventions
- Ensure 100% test coverage for new features