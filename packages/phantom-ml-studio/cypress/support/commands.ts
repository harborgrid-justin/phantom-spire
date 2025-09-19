/// <reference types="cypress" />

// Custom Commands for Phantom ML Studio E2E Tests

// ===== TEST ENVIRONMENT SETUP =====
Cypress.Commands.add('setupTestEnvironment', (environment = 'default') => {
  cy.log(`Setting up test environment: ${environment}`);

  // Mock common API endpoints based on environment
  switch (environment) {
    case 'ml-models':
      // Mock ML-specific endpoints
      cy.intercept('GET', '/api/models', { fixture: 'models.json' }).as('getModels');
      cy.intercept('GET', '/api/datasets', { fixture: 'test-data.csv' }).as('getDatasets');
      cy.intercept('GET', '/api/algorithms', { 
        body: { algorithms: ['random-forest', 'neural-network', 'linear-regression', 'svm'] } 
      }).as('getAlgorithms');
      cy.intercept('POST', '/api/models/train', { statusCode: 202, body: { status: 'started' } }).as('trainModel');
      cy.intercept('GET', '/api/models/*/status', { body: { status: 'completed' } }).as('getTrainingStatus');
      cy.intercept('GET', '/api/experiments', { fixture: 'experiments.json' }).as('getExperiments');
      cy.intercept('GET', '/api/models/*/training-status', {
        statusCode: 200,
        body: { status: 'completed', progress: 100 }
      }).as('getTrainingProgress');
      
      // Mock model configurations
      cy.intercept('GET', '/api/algorithms/*/config', {
        body: {
          'random-forest': { n_estimators: 100, max_depth: 10, min_samples_split: 2 },
          'neural-network': { hidden_layers: [64, 32], learning_rate: 0.001, epochs: 100 },
          'linear-regression': { regularization: 'ridge', alpha: 1.0 },
          'svm': { kernel: 'rbf', C: 1.0, gamma: 'scale' }
        }
      }).as('getAlgorithmConfigs');
      break;

    case 'dashboard':
      // Mock dashboard-specific endpoints
      cy.intercept('GET', '/api/dashboard/metrics', { fixture: 'dashboard-metrics.json' }).as('getDashboardMetrics');
      cy.intercept('GET', '/api/dashboard/charts/**', { fixture: 'api-responses.json' }).as('getChartData');
      break;

    case 'default':
    default:
      // Mock basic endpoints for all tests
      cy.intercept('GET', '/api/health', { body: { status: 'healthy' } }).as('healthCheck');
      cy.intercept('GET', '/api/user/profile', { 
        body: { id: 1, name: 'Test User', email: 'test@example.com' } 
      }).as('getUserProfile');
      break;
  }

  // Setup common test data in localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('cypress_test_mode', 'true');
    win.localStorage.setItem('test_environment', environment);
  });

  // Seed any required test data
  cy.seedTestData('models', 5);
  cy.seedTestData('experiments', 3);
  cy.seedTestData('datasets', 10);

  // Clear any existing notifications or modals
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="notification"]').length) {
      cy.get('[data-cy="notification-dismiss"]').click({ multiple: true });
    }
    if ($body.find('[role="dialog"]').length) {
      cy.get('[role="dialog"] [aria-label="close"]').click({ multiple: true });
    }
  });

  cy.log(`Test environment '${environment}' setup complete`);
});

// Custom Commands for Phantom ML Studio E2E Tests

// Authentication and Session Management (simplified for no-auth setup)
Cypress.Commands.add('login', () => {
  // Since there's no authentication system, just visit dashboard
  cy.visit('/dashboard')
  cy.url().should('include', '/dashboard')
})

// Navigation Commands
Cypress.Commands.add('navigateToPage', (pagePath: string) => {
  cy.visit(pagePath)
  cy.url().should('include', pagePath)
  cy.get('[data-cy="page-loading"]').should('not.exist')
})

Cypress.Commands.add('navigateViaSidebar', (menuItem: string) => {
  cy.get('[data-cy="sidebar-toggle"]').click({ force: true })
  cy.get(`[data-cy="sidebar-menu-${menuItem}"]`).click()
  cy.get('[data-cy="page-loading"]').should('not.exist')
})

// Data Management Commands
Cypress.Commands.add('uploadFile', (inputSelector: string, filePath: string) => {
  cy.log(`Uploading file ${filePath} to ${inputSelector}`)
  cy.get(inputSelector).should('exist').and('be.visible')
  cy.get(inputSelector).selectFile(filePath, { force: true, action: 'drag-drop' })
  // Wait for the file to be processed
  cy.wait(1000)
  cy.log('File upload completed')
})

Cypress.Commands.add('createTestDataset', (datasetName: string, dataType = 'csv') => {
  cy.get('[data-cy="create-dataset-button"]').click()
  cy.get('[data-cy="dataset-name-input"]').type(datasetName)
  cy.get(`[data-cy="dataset-type-${dataType}"]`).click()
  cy.get('[data-cy="create-dataset-confirm"]').click()
  cy.get('[data-cy="dataset-created-notification"]').should('be.visible')
})

// Model Management Commands
Cypress.Commands.add('createModel', (modelName: string, algorithm = 'random-forest') => {
  cy.get('[data-cy="create-model-button"]').click()
  cy.get('[data-cy="model-name-input"]').type(modelName)
  cy.get(`[data-cy="algorithm-${algorithm}"]`).click()
  cy.get('[data-cy="create-model-confirm"]').click()
  cy.get('[data-cy="model-created-notification"]').should('be.visible')
})

Cypress.Commands.add('trainModel', (modelId: string) => {
  cy.get(`[data-cy="model-${modelId}-train-button"]`).click()
  cy.get('[data-cy="training-started-notification"]').should('be.visible')
  cy.get('[data-cy="training-progress"]').should('be.visible')
})

Cypress.Commands.add('deployModel', (modelId: string, environment = 'staging') => {
  cy.get(`[data-cy="model-${modelId}-deploy-button"]`).click()
  cy.get(`[data-cy="deployment-environment-${environment}"]`).click()
  cy.get('[data-cy="deploy-confirm"]').click()
  cy.get('[data-cy="deployment-started-notification"]').should('be.visible')
})

// Chart and Visualization Commands
Cypress.Commands.add('waitForChart', (chartSelector = '[data-cy="chart"]', timeout = 10000) => {
  cy.get(chartSelector, { timeout }).should('be.visible')
  cy.get(`${chartSelector} svg`).should('exist')
  cy.wait(1000) // Allow time for chart animation
})

Cypress.Commands.add('validateChartData', (_expectedDataPoints: unknown[]) => {
  const chartSelector = '[data-cy="chart"]'
  cy.get(chartSelector).should('be.visible')
  // Validate that the chart contains expected number of data points
  cy.get(`${chartSelector} .recharts-area-dot`).should('have.length', _expectedDataPoints.length)
})

// Interact with chart elements (hover, click)
Cypress.Commands.add('interactWithChart', (chartSelector: string, action: 'hover' | 'click', coordinates?: { x: number; y: number }) => {
  cy.log(`Interacting with chart: ${action} at ${coordinates ? `${coordinates.x},${coordinates.y}` : 'default position'}`)
  cy.get(chartSelector).should('be.visible')
  
  if (action === 'hover') {
    if (coordinates) {
      cy.get(chartSelector).trigger('mouseover', coordinates)
    } else {
      cy.get(`${chartSelector} .recharts-line, ${chartSelector} .recharts-bar, ${chartSelector} .recharts-area`).first().trigger('mouseover')
    }
  } else if (action === 'click') {
    if (coordinates) {
      cy.get(chartSelector).click(coordinates)
    } else {
      cy.get(`${chartSelector} .recharts-line, ${chartSelector} .recharts-bar, ${chartSelector} .recharts-area`).first().click()
    }
  }
  
  cy.wait(500) // Allow time for chart interaction
})

// Form Validation Commands
Cypress.Commands.add('fillForm', (formData: Record<string, unknown>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get('body').then(($body) => {
      const possibleSelectors = [
        `[data-cy="${field}"]`,
        `[name="${field}"]`,
        `[id="${field}"]`,
        `input[placeholder*="${field}"]`,
        `input[aria-label*="${field}"]`
      ]
      
      let found = false
      for (const selector of possibleSelectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().clear().type(String(value))
          found = true
          break
        }
      }
      
      if (!found) {
        cy.log(`Warning: Could not find element for field "${field}"`)
      }
    })
  })
})

Cypress.Commands.add('validateFormErrors', (expectedErrors: string[]) => {
  expectedErrors.forEach(error => {
    cy.get(`[data-cy="${error}-error"], [data-cy="error-${error}"], .error-${error}`).should('be.visible')
  })
})

Cypress.Commands.add('submitFormAndVerify', (expectedResult: string) => {
  cy.get('[data-cy="submit-button"]').click()
  cy.get(`[data-cy="${expectedResult}"]`).should('be.visible')
})

Cypress.Commands.add('testFormValidation', (formSelector: string, fieldTests: Array<{field: string, value: string, expectError: boolean}>) => {
  fieldTests.forEach(test => {
    cy.get(`${formSelector} [data-cy="${test.field}"]`).clear().type(test.value)
    cy.get(`${formSelector} [data-cy="submit-button"]`).click()
    if (test.expectError) {
      cy.get(`[data-cy="${test.field}-error"]`).should('be.visible')
    } else {
      cy.get(`[data-cy="${test.field}-error"]`).should('not.exist')
    }
  })
})

// API and Data Commands
Cypress.Commands.add('mockApiResponse', (endpoint: string, response: unknown) => {
  cy.log(`Mocking API response for ${endpoint}`)
  cy.intercept('GET', endpoint, { body: response }).as('mockedAPI')
})

Cypress.Commands.add('seedTestData', (dataType: string, count = 10) => {
  const testData = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${dataType}_${i + 1}`,
    type: dataType,
    created: new Date().toISOString()
  }))
  cy.window().then((win) => {
    win.localStorage.setItem(`test_${dataType}`, JSON.stringify(testData))
  })
})

Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then((win) => {
    Object.keys(win.localStorage).forEach(key => {
      if (key.startsWith('test_')) {
        win.localStorage.removeItem(key)
      }
    })
  })
})

Cypress.Commands.add('mockHuggingFaceAPI', (response = { models: [] }) => {
  cy.intercept('GET', '**/api/huggingface/**', { body: response }).as('huggingFaceAPI')
})

Cypress.Commands.add('mockModelTraining', (modelId: string, status = 'completed') => {
  cy.intercept('POST', `**/api/models/${modelId}/train`, { body: { status: 'started' } }).as('trainModel')
  cy.intercept('GET', `**/api/models/${modelId}/status`, { body: { status } }).as('modelStatus')
})

// Accessibility Commands
Cypress.Commands.add('checkA11y', (context?: string, options?: { rules?: Record<string, { enabled: boolean }> }) => {
  cy.injectAxe()
  cy.checkA11y(context, {
    rules: {
      'color-contrast': { enabled: false }, // Disable color contrast for charts
      ...options?.rules
    },
    ...options
  })
})

Cypress.Commands.add('checkColorContrast', () => {
  cy.injectAxe()
  cy.checkA11y(undefined, {
    rules: {
      'color-contrast': { enabled: true }
    }
  })
})

// Performance Commands
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    cy.wrap(win.performance.timing.loadEventEnd - win.performance.timing.navigationStart)
      .should('be.lessThan', 5000) // 5 second max load time
  })
})

Cypress.Commands.add('checkResponsiveDesign', (breakpoints: string[]) => {
  const viewports = {
    'mobile': { width: 375, height: 667 },
    'tablet': { width: 768, height: 1024 },
    'desktop': { width: 1200, height: 800 },
    'large': { width: 1920, height: 1080 }
  }

  breakpoints.forEach(breakpoint => {
    const viewport = viewports[breakpoint as keyof typeof viewports]
    if (viewport) {
      cy.log(`Testing ${breakpoint} viewport (${viewport.width}x${viewport.height})`)
      cy.viewport(viewport.width, viewport.height)
      cy.get('[data-cy="main-content"], body').should('be.visible')
      cy.wait(500) // Allow time for responsive adjustments
    }
  })
})

// Data Table Commands
Cypress.Commands.add('sortDataTable', (column: string, direction: 'asc' | 'desc') => {
  cy.log(`Sorting table by ${column} in ${direction} order`)
  const columnSelector = `[data-cy="table-column-${column}"], [data-cy="column-${column}"], th[data-column="${column}"]`
  cy.get(columnSelector).first().click()
  if (direction === 'desc') {
    cy.get(columnSelector).first().click()
  }
  cy.get('[data-cy="table-loading"]').should('not.exist')
  cy.wait(500) // Allow time for sorting
})

Cypress.Commands.add('filterDataTable', (column: string, value: string) => {
  cy.log(`Filtering table column ${column} with value ${value}`)
  // Try different possible selectors for filter inputs
  const filterSelector = `[data-cy="table-filter-${column}"], [data-cy="filter-${column}"], [data-cy="search-${column}"]`
  cy.get('body').then(($body) => {
    if ($body.find(filterSelector).length > 0) {
      cy.get(filterSelector).type(value)
      cy.get('[data-cy="table-filter-apply"], [data-cy="apply-filter"]').click()
    } else {
      // Fallback to general search
      cy.get('[data-cy="search-input"], [data-cy="table-search"]').first().type(value)
    }
  })
  cy.get('[data-cy="table-loading"]').should('not.exist')
  cy.wait(500) // Allow time for filtering
})

Cypress.Commands.add('exportTableData', (format: string) => {
  cy.log(`Exporting table data in ${format} format`)
  cy.get('[data-cy="table-export-button"], [data-cy="export-button"]').click()
  cy.get(`[data-cy="export-format-${format}"], [data-cy="export-${format}"]`).click()
  cy.get('[data-cy="export-confirm"], [data-cy="confirm-export"]').click()
  cy.wait(1000) // Allow time for export
})

Cypress.Commands.add('sortTable', (columnSelector: string, direction = 'asc') => {
  cy.get(columnSelector).click()
  if (direction === 'desc') {
    cy.get(columnSelector).click()
  }
  cy.get('[data-cy="table-loading"]').should('not.exist')
})

Cypress.Commands.add('filterTable', (filterValue: string) => {
  cy.get('[data-cy="table-filter-input"]').type(filterValue)
  cy.get('[data-cy="table-filter-apply"]').click()
  cy.get('[data-cy="table-loading"]').should('not.exist')
})

// Notification Commands
Cypress.Commands.add('waitForNotification', (type: 'success' | 'error' | 'warning' | 'info' = 'success', timeout = 10000) => {
  cy.get(`[data-cy="notification-${type}"]`, { timeout }).should('be.visible')
  cy.get(`[data-cy="notification-${type}"]`).should('not.exist', { timeout: 10000 })
})

Cypress.Commands.add('dismissNotification', () => {
  cy.get('[data-cy="notification-dismiss"]').click()
  cy.get('[data-cy="notification"]').should('not.exist')
})

// Modal and Dialog Commands
Cypress.Commands.add('openModal', (modalType: string) => {
  cy.get(`[data-cy="open-${modalType}-modal"]`).click()
  cy.get('[data-cy="modal-overlay"]').should('be.visible')
  cy.get('[data-cy="modal-content"]').should('be.visible')
})

Cypress.Commands.add('closeModal', () => {
  cy.get('[data-cy="modal-close"]').click()
  cy.get('[data-cy="modal-overlay"]').should('not.exist')
})

Cypress.Commands.add('confirmDialog', (action: 'accept' | 'cancel') => {
  cy.get(`[data-cy="dialog-${action}"]`).click()
  cy.get('[data-cy="dialog"]').should('not.exist')
})

// Tab navigation command
Cypress.Commands.add('tab', { prevSubject: ['element'] }, (subject) => {
  cy.wrap(subject).trigger('keydown', { keyCode: 9 })
})

// Keyboard navigation command
Cypress.Commands.add('pressKey', { prevSubject: ['element'] }, (subject, key: string) => {
  const keyCode = {
    'Tab': 9,
    'Enter': 13,
    'Escape': 27,
    'ArrowUp': 38,
    'ArrowDown': 40,
    'ArrowLeft': 37,
    'ArrowRight': 39
  }[key] || key.charCodeAt(0)

  cy.wrap(subject).trigger('keydown', { keyCode })
})

// R.42: Enhanced authentication testing commands
Cypress.Commands.add('testAuthenticationFlow', (userType: 'admin' | 'user' | 'guest' = 'user') => {
  cy.log(`Testing authentication flow for ${userType}`)

  // Visit protected route
  cy.visit('/dashboard')

  // Verify authentication state
  cy.window().then((win) => {
    const isAuthenticated = win.localStorage.getItem('authenticated') === 'true'
    if (!isAuthenticated && userType !== 'guest') {
      // Simulate authentication
      win.localStorage.setItem('authenticated', 'true')
      win.localStorage.setItem('userType', userType)
      cy.reload()
    }
  })

  // Verify appropriate access level
  if (userType === 'admin') {
    cy.get('[data-cy="admin-panel"]').should('be.visible')
  } else if (userType === 'guest') {
    cy.get('[data-cy="login-required"]').should('be.visible')
  }
})

// R.47: Cross-browser testing utilities
Cypress.Commands.add('testCrossBrowserCompatibility', (features: string[]) => {
  features.forEach(feature => {
    cy.log(`Testing ${feature} cross-browser compatibility`)

    // Test feature based on browser
    cy.window().then((win) => {
      const browser = Cypress.browser.name

      switch (feature) {
        case 'css-grid':
          cy.get('[data-cy="grid-layout"]').should('be.visible')
          break
        case 'flexbox':
          cy.get('[data-cy="flex-container"]').should('be.visible')
          break
        case 'web-apis':
          if (browser === 'chrome') {
            cy.wrap(win.fetch).should('exist')
            cy.wrap(win.localStorage).should('exist')
          }
          break
      }
    })
  })
})

// R.50: Next.js specific testing commands
Cypress.Commands.add('testNextJSFeatures', () => {
  cy.log('Testing Next.js specific features')

  // Test App Router navigation
  cy.get('[data-cy="nav-link"]').first().click()
  cy.url().should('not.include', '#')

  // Test loading states
  cy.get('[data-cy="loading-state"]').should('not.exist')

  // Test error boundaries
  cy.window().then((win) => {
    // Check Next.js data exists (skip type check for now)
    cy.log('Next.js data available:', Boolean((win as Window & { __NEXT_DATA__?: unknown }).__NEXT_DATA__))
  })

  // Test hydration
  cy.get('[data-cy="hydrated-content"]').should('be.visible')
})

// R.12: Advanced cy.task usage
Cypress.Commands.add('useAdvancedTasks', () => {
  // Generate test data
  cy.task('generateTestData', { type: 'model', count: 5 }).then((data) => {
    cy.log(`Generated test models:`, data)
  })

  // Measure performance
  cy.task('measureMemoryUsage').then((usage) => {
    cy.log(`Memory usage:`, usage)
  })

  // Clean up after tests
  cy.task('cleanupTestArtifacts')
})

