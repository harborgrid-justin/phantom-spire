#!/bin/bash

# 🤖 GitHub Automation Setup Script
# Phantom Core Threat Actor - Enterprise Automation

echo "🚀 Setting up GitHub Automation for Phantom Core Threat Actor"
echo "============================================================="

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! $(grep -q "@phantom-core/threat-actor" package.json) ]]; then
    echo "❌ Error: Please run this script from the phantom-core-threat-actor directory"
    exit 1
fi

echo "✅ Verified package directory"

# Create .github directory structure
echo "📁 Creating .github directory structure..."
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/badges

# Create issue templates
echo "📝 Creating issue templates..."

cat > .github/ISSUE_TEMPLATE/bug_report.yml << 'EOF'
name: 🐛 Bug Report
description: Report a bug or unexpected behavior
title: "[Bug]: "
labels: ["bug", "needs-investigation"]
body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please provide as much detail as possible.

  - type: input
    id: version
    attributes:
      label: Version
      description: What version of @phantom-core/threat-actor are you using?
      placeholder: "1.0.6"
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear description of what the bug is
      placeholder: "The threat actor analysis returns incorrect attribution..."
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Initialize PhantomThreatActorCore
        2. Call analyzeThreatActor()
        3. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: Your environment details
      placeholder: |
        - OS: Windows 11
        - Node.js: 18.17.0
        - npm: 9.6.7
    validations:
      required: true
EOF

cat > .github/ISSUE_TEMPLATE/feature_request.yml << 'EOF'
name: ✨ Feature Request
description: Suggest a new feature or enhancement
title: "[Feature]: "
labels: ["enhancement", "needs-discussion"]
body:
  - type: markdown
    attributes:
      value: |
        Thank you for suggesting a feature! Please provide detailed information.

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this feature solve?
      placeholder: "As a security analyst, I need..."
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe your ideal solution
      placeholder: "I would like the system to..."
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternative Solutions
      description: Any alternative solutions you've considered
    validations:
      required: false

  - type: checkboxes
    id: enterprise
    attributes:
      label: Enterprise Feature
      options:
        - label: This is an enterprise-specific feature
        - label: This feature requires commercial support
EOF

cat > .github/ISSUE_TEMPLATE/security.yml << 'EOF'
name: 🔒 Security Issue
description: Report a security vulnerability (use private security advisories for sensitive issues)
title: "[Security]: "
labels: ["security", "priority: high"]
body:
  - type: markdown
    attributes:
      value: |
        ⚠️ **For sensitive security issues, please use [Private Security Advisories](https://github.com/defendr-ai/phantom.core-threat-actor/security/advisories/new) instead.**

  - type: textarea
    id: description
    attributes:
      label: Security Issue Description
      description: Describe the security concern
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: Severity Level
      options:
        - Low
        - Medium  
        - High
        - Critical
    validations:
      required: true

  - type: textarea
    id: impact
    attributes:
      label: Potential Impact
      description: What could an attacker achieve?
    validations:
      required: true
EOF

# Create pull request template
echo "📝 Creating pull request template..."
cat > .github/pull_request_template.md << 'EOF'
## 🎯 Purpose

Brief description of what this PR accomplishes.

## 📝 Changes

- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation update
- [ ] Security fix
- [ ] Other: _______________

## 🧪 Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Manual testing completed

## 📚 Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] CHANGELOG.md updated
- [ ] Comments added for complex code

## 🔒 Security

- [ ] No sensitive data exposed
- [ ] Dependencies reviewed
- [ ] Security implications considered

## 📸 Screenshots (if applicable)

## ⚠️ Breaking Changes

List any breaking changes and migration steps.

## 📋 Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Linked to relevant issues
- [ ] Ready for review

## 🏷️ Issue References

Closes #___
Related to #___
EOF

# Create contributing guide
echo "📝 Creating contributing guidelines..."
cat > CONTRIBUTING.md << 'EOF'
# Contributing to Phantom Core Threat Actor

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm 8+
- Rust and Cargo (latest stable)
- Git

### Development Setup
```bash
# Clone the repository
git clone https://github.com/defendr-ai/phantom.core-threat-actor.git
cd phantom.core-threat-actor

# Install dependencies
npm install

# Build the native module
npm run build

# Run tests
npm test
```

## 🎯 How to Contribute

### Reporting Issues
- Use the appropriate issue template
- Provide detailed information and reproduction steps
- Check for existing issues first

### Submitting Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit with conventional commit format
7. Push to your fork
8. Create a pull request

### Commit Convention
```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: test additions/modifications
chore: maintenance tasks
security: security improvements
```

## 🔒 Security

Report security vulnerabilities through [GitHub Security Advisories](https://github.com/defendr-ai/phantom.core-threat-actor/security/advisories).

## 📞 Support

- 📧 Enterprise: enterprise@defendr.ai
- 💬 Discussions: GitHub Discussions
- 🐛 Issues: GitHub Issues

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).
EOF

echo "✅ GitHub templates and guidelines created"

# Create GitHub repository labels (if gh CLI is available)
if command -v gh &> /dev/null; then
    echo "🏷️ Creating repository labels..."
    
    # Bug and issue labels
    gh label create "bug" --color "d73a4a" --description "Something isn't working" --force
    gh label create "security" --color "b60205" --description "Security-related issue" --force
    gh label create "performance" --color "ff9500" --description "Performance-related issue" --force
    gh label create "documentation" --color "0075ca" --description "Improvements or additions to documentation" --force
    
    # Priority labels  
    gh label create "priority: high" --color "b60205" --description "High priority issue" --force
    gh label create "priority: medium" --color "ff9500" --description "Medium priority issue" --force
    gh label create "priority: low" --color "0e8a16" --description "Low priority issue" --force
    
    # Type labels
    gh label create "enhancement" --color "a2eeef" --description "New feature or request" --force
    gh label create "maintenance" --color "d4c5f9" --description "Maintenance and chores" --force
    gh label create "enterprise" --color "5319e7" --description "Enterprise-specific feature" --force
    
    # Status labels
    gh label create "needs-investigation" --color "fbca04" --description "Requires investigation" --force
    gh label create "needs-discussion" --color "d876e3" --description "Needs team discussion" --force
    gh label create "good first issue" --color "7057ff" --description "Good for newcomers" --force
    gh label create "keep-open" --color "0e8a16" --description "Exempt from stale bot" --force
    
    # Size labels
    gh label create "size/small" --color "c2e0c6" --description "Small change" --force
    gh label create "size/medium" --color "fef2c0" --description "Medium change" --force  
    gh label create "size/large" --color "f9c2c2" --description "Large change" --force
    
    echo "✅ Repository labels created"
else
    echo "ℹ️ GitHub CLI not found. You can manually create labels in your repository settings."
fi

echo ""
echo "🎉 GitHub Automation Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. 🔑 Add required secrets in GitHub repository settings:"
echo "   - NPM_TOKEN: Your npm publishing token"
echo "   - SNYK_TOKEN: Optional security scanning token"
echo "   - SLACK_WEBHOOK_URL: Optional Slack notifications"
echo ""
echo "2. ⚙️ Configure repository settings:"
echo "   - Enable GitHub Pages for analytics dashboard"
echo "   - Set up branch protection rules for main branch"
echo "   - Enable Discussions (optional)"
echo ""
echo "3. 🚀 Commit and push the automation workflows:"
echo "   git add ."
echo "   git commit -m \"feat: add comprehensive GitHub automation workflows\""
echo "   git push origin main"
echo ""
echo "4. 📊 Your analytics dashboard will be available at:"
echo "   https://defendr-ai.github.io/phantom.core-threat-actor/"
echo ""
echo "🔗 Documentation:"
echo "   - Read AUTOMATION_GUIDE.md for detailed information"
echo "   - Check .github/workflows/ for automation details"
echo "   - Review CONTRIBUTING.md for contribution guidelines"
echo ""
echo "Happy automating! 🤖✨"
EOF