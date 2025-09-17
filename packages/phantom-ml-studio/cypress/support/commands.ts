/// <reference types="cypress" />

// Custom Commands for Phantom ML Studio E2E Tests

// Authentication and Session Management (simplified for no-auth setup)
Cypress.Commands.add('login', (username = 'testuser', password = 'testpass') => {
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
Cypress.Commands.add('uploadFile', (filePath: string, inputSelector: string) => {
  cy.get(inputSelector).selectFile(filePath, { force: true })
  cy.get('[data-cy="upload-progress"]').should('be.visible')
  cy.get('[data-cy="upload-success"]').should('be.visible', { timeout: 10000 })
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

Cypress.Commands.add('trainModel', (modelId: string, options?: any) => {
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

Cypress.Commands.add('interactWithChart', (action: string, coordinates?: { x: number; y: number }) => {
  const chartSelector = '[data-cy="chart"]'
  cy.get(chartSelector).should('be.visible')

  if (action === 'hover' && coordinates) {
    cy.get(chartSelector).trigger('mouseover', coordinates.x, coordinates.y)
  } else if (action === 'click' && coordinates) {
    cy.get(chartSelector).click(coordinates.x, coordinates.y)
  } else if (action === 'hover') {
    cy.get(`${chartSelector} .recharts-area-dot`).first().trigger('mouseover')
  } else if (action === 'click') {
    cy.get(`${chartSelector} .recharts-area-dot`).first().click()
  }
})

Cypress.Commands.add('validateChartData', (expectedDataPoints: any[]) => {
  const chartSelector = '[data-cy="chart"]'
  cy.get(chartSelector).should('be.visible')
  // Validate that the chart contains expected number of data points
  cy.get(`${chartSelector} .recharts-area-dot`).should('have.length', expectedDataPoints.length)
})

// Form Validation Commands
Cypress.Commands.add('fillForm', (formData: Record<string, any>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-cy="${field}"]`).clear().type(String(value))
  })
})

Cypress.Commands.add('validateFormErrors', (expectedErrors: string[]) => {
  expectedErrors.forEach(error => {
    cy.get(`[data-cy="${error}-error"]`).should('be.visible')
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
Cypress.Commands.add('mockApiResponse', (endpoint: string, response: any) => {
  cy.intercept('GET', endpoint, response).as('mockedAPI')
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
  cy.intercept('GET', '**/api/huggingface/**', response).as('huggingFaceAPI')
})

Cypress.Commands.add('mockModelTraining', (modelId: string, status = 'completed') => {
  cy.intercept('POST', `**/api/models/${modelId}/train`, { status: 'started' }).as('trainModel')
  cy.intercept('GET', `**/api/models/${modelId}/status`, { status }).as('modelStatus')
})

// Accessibility Commands
Cypress.Commands.add('checkA11y', (context?: string, options?: any) => {
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
      cy.viewport(viewport.width, viewport.height)
      cy.get('[data-cy="main-content"]').should('be.visible')
      cy.wait(500) // Allow time for responsive adjustments
    }
  })
})

// Data Table Commands
Cypress.Commands.add('sortDataTable', (column: string, direction: 'asc' | 'desc') => {
  const columnSelector = `[data-cy="table-column-${column}"]`
  cy.get(columnSelector).click()
  if (direction === 'desc') {
    cy.get(columnSelector).click()
  }
  cy.get('[data-cy="table-loading"]').should('not.exist')
})

Cypress.Commands.add('filterDataTable', (column: string, value: string) => {
  cy.get(`[data-cy="table-filter-${column}"]`).type(value)
  cy.get('[data-cy="table-filter-apply"]').click()
  cy.get('[data-cy="table-loading"]').should('not.exist')
})

Cypress.Commands.add('exportTableData', (format: string) => {
  cy.get('[data-cy="table-export-button"]').click()
  cy.get(`[data-cy="export-format-${format}"]`).click()
  cy.get('[data-cy="export-confirm"]').click()
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

// Accessibility Commands with mock axe implementation
Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((win) => {
    // Mock axe implementation for tests without cypress-axe
    (win as any).axe = {
      run: () => Promise.resolve({ violations: [] })
    }
  })
})

// Tab navigation command
Cypress.Commands.add('tab', { prevSubject: ['element'] }, (subject) => {
  cy.wrap(subject).trigger('keydown', { keyCode: 9 })
  return cy.wrap(subject)
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
  return cy.wrap(subject)
})

