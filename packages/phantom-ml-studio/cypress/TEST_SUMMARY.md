# Phantom ML Studio - Cypress E2E Test Suite

## Overview

This comprehensive test suite contains **150+ E2E tests** covering all major features of the Phantom ML Studio application. The tests are organized into logical groups and follow enterprise-grade testing practices.

## Test Coverage

### 1. Navigation Tests (15 tests)
- **Location**: `cypress/e2e/navigation/`
- **Coverage**: Header navigation, sidebar navigation, breadcrumbs, routing, accessibility
- **Files**:
  - `header-navigation.cy.ts` (5 tests)
  - `sidebar-navigation.cy.ts` (7 tests)
  - `breadcrumb-navigation.cy.ts` (5 tests)
  - `routing-and-deep-links.cy.ts` (7 tests)
  - `accessibility-navigation.cy.ts` (5 tests)

### 2. Dashboard Tests (15 tests)
- **Location**: `cypress/e2e/dashboard/`
- **Coverage**: Dashboard loading, metrics visualization, filters, real-time updates, performance
- **Files**:
  - `dashboard-loading-and-components.cy.ts` (6 tests)
  - `metrics-visualization.cy.ts` (9 tests)
  - `dashboard-filters-and-controls.cy.ts` (8 tests)
  - `real-time-updates.cy.ts` (8 tests)
  - `dashboard-widgets.cy.ts` (9 tests)
  - `dashboard-performance.cy.ts` (5 tests)

### 3. Data Explorer Tests (15 tests)
- **Location**: `cypress/e2e/data-explorer/`
- **Coverage**: Data upload, parsing, filtering, visualization, preprocessing, export
- **Files**:
  - `data-upload-functionality.cy.ts` (10 tests)
  - `data-parsing-and-display.cy.ts` (10 tests)
  - `data-filtering-and-sorting.cy.ts` (10 tests)
  - `data-visualization.cy.ts` (10 tests)
  - `data-export-functionality.cy.ts` (10 tests)
  - `data-preprocessing.cy.ts` (5 tests)

### 4. Model Builder Tests (15 tests)
- **Location**: `cypress/e2e/model-builder/`
- **Coverage**: Model creation, algorithm selection, parameter configuration, training, validation
- **Files**:
  - `model-creation-workflow.cy.ts` (10 tests)
  - `algorithm-selection.cy.ts` (12 tests)
  - `parameter-configuration.cy.ts` (12 tests)
  - `model-training.cy.ts` (12 tests)
  - `model-validation.cy.ts` (13 tests)
  - `model-comparison.cy.ts` (5 tests)

### 5. AutoML Pipeline Tests (12 tests)
- **Location**: `cypress/e2e/automl-pipeline/`
- **Coverage**: Pipeline creation, visualization, execution, results analysis
- **Files**:
  - `pipeline-creation.cy.ts` (12 tests)
  - `pipeline-visualization.cy.ts` (12 tests)
  - `pipeline-execution.cy.ts` (12 tests)
  - `pipeline-results.cy.ts` (12 tests)

### 6. Experiments Tests (12 tests)
- **Location**: `cypress/e2e/experiments/`
- **Coverage**: Experiment creation, tracking, comparison, metrics logging
- **Files**:
  - `experiment-creation.cy.ts` (5 tests)
  - `experiment-tracking.cy.ts` (6 tests)
  - `experiment-comparison.cy.ts` (6 tests)
  - `experiment-metrics.cy.ts` (5 tests)

### 7. Deployments Tests (12 tests)
- **Location**: `cypress/e2e/deployments/`
- **Coverage**: Deployment workflow, monitoring, scaling, endpoint testing
- **Files**:
  - `deployment-workflow.cy.ts` (5 tests)
  - `deployment-monitoring.cy.ts` (6 tests)
  - `deployment-scaling.cy.ts` (4 tests)
  - `endpoint-testing.cy.ts` (5 tests)

### 8. Bias Detection Tests (10 tests)
- **Location**: `cypress/e2e/bias-detection/`
- **Coverage**: Bias analysis, fairness metrics, mitigation strategies
- **Files**:
  - `bias-analysis.cy.ts` (5 tests)
  - `fairness-metrics.cy.ts` (5 tests)
  - `mitigation-strategies.cy.ts` (5 tests)

### 9. A/B Testing Tests (10 tests)
- **Location**: `cypress/e2e/ab-testing/`
- **Coverage**: Test creation, statistical analysis, multi-variant testing
- **Files**:
  - `test-creation.cy.ts` (6 tests)
  - `statistical-analysis.cy.ts` (5 tests)
  - `multi-variant-testing.cy.ts` (5 tests)

### 10. Real-time Monitoring Tests (10 tests)
- **Location**: `cypress/e2e/monitoring/`
- **Coverage**: Real-time dashboard, alerts, anomaly detection
- **Files**:
  - `real-time-dashboard.cy.ts` (8 tests)
  - `alerts-and-notifications.cy.ts` (5 tests)
  - `anomaly-detection.cy.ts` (7 tests)

### 11. Settings Tests (8 tests)
- **Location**: `cypress/e2e/settings/`
- **Coverage**: User preferences, system configuration
- **Files**:
  - `user-preferences.cy.ts` (8 tests)
  - `system-configuration.cy.ts` (7 tests)

### 12. Form Validation Tests (10 tests)
- **Location**: `cypress/e2e/forms/`
- **Coverage**: Input validation, error handling, advanced form features
- **Files**:
  - `form-validation.cy.ts` (10 tests)
  - `advanced-form-features.cy.ts` (7 tests)

### 13. API Integration Tests (6 tests)
- **Location**: `cypress/e2e/integration/`
- **Coverage**: Hugging Face integration, data sources, workflow automation
- **Files**:
  - `api-integration.cy.ts` (6 tests)
  - `data-integration.cy.ts` (5 tests)
  - `workflow-automation.cy.ts` (5 tests)

## Test Infrastructure

### Custom Commands
The test suite includes comprehensive custom commands in `cypress/support/commands.ts`:
- Authentication and session management
- Navigation helpers
- Data management commands
- Model management commands
- Chart and visualization helpers
- Form validation utilities
- API mocking commands
- Accessibility testing
- Performance testing
- Data table operations
- Notification handling
- Modal and dialog operations

### Test Data and Fixtures
- **CSV Test Data**: `cypress/fixtures/test-data.csv`
- **Model Configurations**: `cypress/fixtures/model-configs.json`
- **API Responses**: `cypress/fixtures/api-responses.json`

### Configuration Features
- Retry logic for flaky tests
- Video recording and screenshots
- Custom timeouts for different operations
- Code coverage integration
- Accessibility testing with axe-core
- Database seeding and cleanup tasks

## Running the Tests

### Prerequisites
```bash
npm install cypress --save-dev
npm install @cypress/code-coverage --save-dev
npm install cypress-axe --save-dev
```

### Commands
```bash
# Open Cypress Test Runner
npx cypress open

# Run all tests headlessly
npx cypress run

# Run specific test suite
npx cypress run --spec "cypress/e2e/dashboard/**"

# Run tests with specific browser
npx cypress run --browser chrome

# Run tests in parallel (Cypress Dashboard)
npx cypress run --record --parallel
```

### Environment Variables
```bash
CYPRESS_baseUrl=http://localhost:3000
CYPRESS_defaultCommandTimeout=10000
CYPRESS_coverage=true
```

## Best Practices Implemented

### Test Organization
- Page Object Model pattern with custom commands
- Logical grouping by feature area
- Descriptive test names and clear assertions
- Independent tests that don't rely on each other

### Data Management
- Test data isolation using fixtures
- Dynamic test data generation
- Database seeding and cleanup between tests
- API mocking for reliable testing

### Error Handling
- Comprehensive error scenarios coverage
- Graceful handling of network issues
- Timeout and retry configurations
- Detailed error messages and debugging

### Performance
- Optimized selectors using data-cy attributes
- Efficient wait strategies
- Lazy loading considerations
- Performance benchmarking

### Accessibility
- Screen reader compatibility testing
- Keyboard navigation validation
- ARIA label verification
- Color contrast testing (where applicable)

### Enterprise Features
- Multi-environment support
- CI/CD integration ready
- Parallel execution support
- Detailed reporting and artifacts
- Security testing considerations

## Maintenance Guidelines

### Adding New Tests
1. Follow the existing file structure and naming conventions
2. Use descriptive test names that explain the expected behavior
3. Leverage existing custom commands for common operations
4. Include both happy path and error scenarios
5. Add appropriate data-cy attributes to new UI elements

### Test Data Management
1. Use fixtures for static test data
2. Generate dynamic data using custom tasks
3. Clean up test data after each test run
4. Avoid hardcoded values in test assertions

### Performance Optimization
1. Use efficient selectors (data-cy attributes preferred)
2. Minimize wait times with smart wait strategies
3. Group related tests to reduce setup/teardown overhead
4. Use API calls for test setup when possible

## Troubleshooting

### Common Issues
1. **Flaky Tests**: Increase timeouts or improve wait strategies
2. **Element Not Found**: Verify data-cy attributes exist
3. **Slow Performance**: Check for unnecessary waits or long-running operations
4. **Memory Issues**: Ensure proper cleanup between tests

### Debugging Tips
1. Use `cy.debug()` to pause test execution
2. Enable video recording for failed tests
3. Check browser developer tools during test runs
4. Review Cypress dashboard for detailed failure analysis

## Future Enhancements

### Planned Additions
- Visual regression testing with Percy or Applitools
- Cross-browser testing automation
- Mobile responsive testing
- API contract testing
- Load testing integration
- Security vulnerability scanning

### Metrics and Reporting
- Test execution time tracking
- Flaky test identification
- Coverage reporting integration
- Performance regression detection
- Accessibility score tracking

This comprehensive test suite ensures the Phantom ML Studio application maintains high quality and reliability across all major features and user workflows.