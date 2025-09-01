# Contributing to Phantom Spire

We welcome contributions to Phantom Spire! This guide will help you get started with contributing to our enterprise cyber threat intelligence platform.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to foster an open and welcoming environment.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB 5.0 or higher
- Redis 6.2 or higher
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/phantom-spire.git
   cd phantom-spire
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your development configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

## 📝 Contributing Guidelines

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages
Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Testing
- `chore` - Maintenance

Examples:
- `feat(auth): add multi-factor authentication`
- `fix(api): resolve IOC validation error`
- `docs(readme): update installation instructions`

### Code Standards

#### TypeScript
- Use strict TypeScript settings
- Provide type definitions for all functions
- Use interfaces for complex objects
- Follow existing naming conventions

#### Testing
- Write unit tests for new functionality
- Maintain 80%+ code coverage
- Use descriptive test names
- Test both success and failure cases

#### Documentation
- Add JSDoc comments for public APIs
- Update README.md for new features
- Include examples in documentation
- Keep documentation up-to-date

## 🏗️ Architecture Guidelines

### Project Structure
```
src/
├── config/           # Configuration management
├── controllers/      # API request handlers
├── middleware/       # Express middleware
├── models/          # Database models
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── __tests__/       # Test files
```

### Design Principles
- **Separation of Concerns**: Keep business logic separate from API logic
- **Single Responsibility**: Each module should have one reason to change
- **Dependency Injection**: Use dependency injection for testability
- **Error Handling**: Consistent error handling across the application
- **Security First**: Security considerations in all code changes

## 🔒 Security Guidelines

### Security Requirements
- Never commit secrets or credentials
- Validate all inputs thoroughly
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Follow OWASP security guidelines

### Security Review Process
All security-related changes must:
1. Be reviewed by a security-conscious maintainer
2. Include security test cases
3. Be tested with security scanning tools
4. Follow principle of least privilege

## 🧪 Testing Guidelines

### Testing Strategy
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints and database interactions
- **Security Tests**: Test authentication and authorization
- **Performance Tests**: Test under load conditions

### Test Requirements
- All new features must include tests
- Bug fixes must include regression tests
- Tests must be deterministic and independent
- Use meaningful test descriptions

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

## 📚 Documentation Guidelines

### Documentation Requirements
- Update README.md for user-facing changes
- Add JSDoc comments for all public APIs
- Include code examples for complex features
- Update API documentation for endpoint changes

### Documentation Standards
- Use clear, concise language
- Include practical examples
- Keep documentation current with code changes
- Use proper markdown formatting

## 🚀 Pull Request Process

### Before Submitting
1. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

2. **Update Documentation**
   - Update relevant documentation
   - Add JSDoc comments
   - Update API documentation if needed

3. **Check Your Code**
   - Follow coding standards
   - Remove debug code and comments
   - Ensure no security issues

### Pull Request Template
When creating a pull request, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## Security
- [ ] No sensitive data exposed
- [ ] Input validation added
- [ ] Authentication/authorization considered

## Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Code comments added
```

### Review Process
1. Automated checks must pass
2. Code review by maintainer
3. Security review for security-related changes
4. Manual testing if required
5. Approval by maintainer

## 🏷️ Release Process

### Version Numbering
We use Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

### Release Workflow
1. Create release branch from develop
2. Update version numbers
3. Update CHANGELOG.md
4. Create release PR
5. Merge to main after approval
6. Tag release
7. Deploy to production

## 🆘 Getting Help

### Resources
- **Documentation**: `.development/docs/`
- **API Reference**: `/api-docs` endpoint
- **Architecture Docs**: `.development/docs/`

### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community support
- **Security Issues**: See SECURITY.md

### Maintainer Contact
For urgent issues or security concerns, contact the maintainers directly.

## 🎯 Development Roadmap

### Current Priorities
- Performance optimization
- Security enhancements
- API improvements
- Documentation updates

### Future Features
- Advanced analytics dashboard
- Machine learning integration
- Mobile application
- Third-party integrations

## 🙏 Recognition

We recognize all contributors in:
- GitHub contributors list
- CHANGELOG.md for releases
- Special recognition for significant contributions

Thank you for contributing to Phantom Spire and helping secure the digital frontier!

---

**Questions?** Open a discussion or contact the maintainers.