# Contributing to Phantom Spire

Thank you for your interest in contributing to Phantom Spire! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Package Structure](#package-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18.20.4 or higher
- npm 8.0.0 or higher
- Rust (stable toolchain)
- Git

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/harborgrid-justin/phantom-spire.git
   cd phantom-spire
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build all packages:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm run test:all
   ```

## Development Workflow

### Branch Strategy

- `master` - Main production branch
- `develop` - Development integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes
- `release/*` - Release preparation branches

### Development Commands

```bash
# Start development with file watching
npm run dev:watch

# Build specific package
npm run build --workspace=packages/phantom-cve-core

# Test specific package
npm run test --workspace=packages/phantom-cve-core

# Lint and format code
npm run lint:fix
npm run format

# Type checking
npm run typecheck
```

## Architecture Overview

Phantom Spire is a monorepo containing:

- **Core Packages**: Threat intelligence processing modules
- **ML Packages**: Machine learning and AI components
- **Test Applications**: Example implementations
- **Frontend**: React-based user interfaces

### Package Categories

- `phantom-*-core`: Core threat intelligence modules
- `phantom-ml-*`: Machine learning components
- `test-*`: Example applications and demos

## Package Structure

Each package follows this structure:

```
packages/package-name/
├── src/           # TypeScript source code
├── src-ts/        # Additional TypeScript files (for hybrid packages)
├── dist/          # Compiled output
├── tests/         # Package-specific tests
├── package.json   # Package configuration
├── tsconfig.json  # TypeScript configuration
├── README.md      # Package documentation
└── CHANGELOG.md   # Package changelog
```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use consistent type imports
- Document complex types and interfaces
- Follow naming conventions:
  - `PascalCase` for types, interfaces, classes
  - `camelCase` for variables, functions
  - `UPPER_SNAKE_CASE` for constants

### Code Style

- 100 character line limit
- Use single quotes for strings
- Trailing commas in multi-line structures
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Error Handling

- Use specific error types
- Handle errors at appropriate levels
- Log errors with context
- Provide meaningful error messages

## Testing Guidelines

### Test Structure

- Unit tests: Test individual functions/classes
- Integration tests: Test package interactions
- E2E tests: Test complete workflows

### Test Conventions

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Maintain 70% minimum coverage
- Test both success and error paths

### Running Tests

```bash
# Run all tests
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific package tests
npm run test --workspace=packages/phantom-cve-core
```

## Commit Convention

We use conventional commits for consistent commit messages:

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### Examples

```bash
feat(cve-core): add vulnerability severity scoring
fix(attribution): resolve memory leak in threat correlation
docs(readme): update installation instructions
```

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use the PR template
   - Link related issues
   - Provide clear description
   - Ensure CI passes

6. **Code Review**
   - Address feedback
   - Update code as needed
   - Maintain clean commit history

## Release Process

We use Changesets for version management:

1. **Create Changeset**
   ```bash
   npm run changeset
   ```

2. **Version Packages**
   ```bash
   npm run version-packages
   ```

3. **Release**
   ```bash
   npm run release
   ```

### Versioning Strategy

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

## Getting Help

- Check existing documentation
- Search existing issues
- Create new issue with detailed information
- Join our development discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.