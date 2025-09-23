describe('API Integration Tests', () => {
  beforeEach(() => {
    cy.mockHuggingFaceAPI({
      models: [
        { id: 'model-1', name: 'Test Model 1' },
        { id: 'model-2', name: 'Test Model 2' }
      ]
    })
  })

  it('should integrate with Hugging Face API', () => {
    cy.visit('/modelBuilder')
    cy.get('[data-cy="browse-huggingface-models"]').click()

    cy.get('[data-cy="huggingface-browser"]').should('be.visible')
    cy.wait('@huggingFaceAPI')
    cy.get('[data-cy="model-list"]').should('be.visible')
    cy.get('[data-cy="model-item"]').should('have.length.at.least', 1)
  })

  it('should handle API authentication', () => {
    cy.intercept('GET', '**/api/huggingface/**', { statusCode: 401 }).as('authError')

    cy.visit('/settings')
    cy.get('[data-cy="api-settings"]').click()
    cy.get('[data-cy="huggingface-token"]').type('invalid-token')
    cy.get('[data-cy="test-connection"]').click()

    cy.wait('@authError')
    cy.get('[data-cy="connection-error"]').should('be.visible')
    cy.get('[data-cy="auth-error-message"]').should('contain', 'authentication')
  })

  it('should handle API rate limiting', () => {
    cy.intercept('GET', '**/api/data/load', { statusCode: 429 }).as('rateLimited')

    cy.visit('/dataExplorer')
    cy.get('[data-cy="load-sample-data"]').click()

    cy.wait('@rateLimited')
    cy.get('[data-cy="rate-limit-error"]').should('be.visible')
    cy.get('[data-cy="retry-after"]').should('be.visible')
  })

  it('should handle API timeouts gracefully', () => {
    cy.intercept('POST', '**/api/models/train', { delay: 30000 }).as('timeout')

    cy.visit('/modelBuilder')
    cy.createModel('Test Model', 'random-forest')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="timeout-error"]').should('be.visible', { timeout: 35000 })
    cy.get('[data-cy="retry-request"]').should('be.visible')
  })

  it('should sync data with external services', () => {
    cy.intercept('POST', '**/api/sync/external', { statusCode: 200, body: { synced: true } }).as('syncAPI')

    cy.visit('/settings')
    cy.get('[data-cy="external-integrations"]').click()
    cy.get('[data-cy="sync-data"]').click()

    cy.wait('@syncAPI')
    cy.get('[data-cy="sync-success"]').should('be.visible')
  })

  it('should validate API responses', () => {
    cy.intercept('GET', '**/api/models', {
      statusCode: 200,
      body: { invalid: 'response' }
    }).as('invalidResponse')

    cy.visit('/models')
    cy.wait('@invalidResponse')

    cy.get('[data-cy="data-validation-error"]').should('be.visible')
    cy.get('[data-cy="fallback-view"]').should('be.visible')
  })
})