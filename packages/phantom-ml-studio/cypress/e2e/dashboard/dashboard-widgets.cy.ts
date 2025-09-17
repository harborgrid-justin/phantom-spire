describe('Dashboard Widgets', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display and interact with active models widget', () => {
    cy.get('[data-cy="active-models-widget"]').should('be.visible')
    cy.get('[data-cy="models-list"]').should('be.visible')
    cy.get('[data-cy="model-item"]').should('have.length.at.least', 1)

    cy.get('[data-cy="model-item"]').first().click()
    cy.url().should('include', '/models/')
  })

  it('should show recent experiments widget with proper data', () => {
    cy.get('[data-cy="recent-experiments-widget"]').should('be.visible')
    cy.get('[data-cy="experiment-list"]').should('be.visible')
    cy.get('[data-cy="experiment-item"]').should('have.length.at.least', 1)

    cy.get('[data-cy="experiment-status"]').should('be.visible')
    cy.get('[data-cy="experiment-timestamp"]').should('be.visible')
  })

  it('should display deployment status widget', () => {
    cy.get('[data-cy="deployment-status-widget"]').should('be.visible')
    cy.get('[data-cy="deployment-list"]').should('be.visible')
    cy.get('[data-cy="deployment-health-indicator"]').should('be.visible')
  })

  it('should show quick actions widget', () => {
    cy.get('[data-cy="quick-actions-widget"]').should('be.visible')
    cy.get('[data-cy="quick-action-create-model"]').should('be.visible')
    cy.get('[data-cy="quick-action-upload-data"]').should('be.visible')
    cy.get('[data-cy="quick-action-new-experiment"]').should('be.visible')

    cy.get('[data-cy="quick-action-create-model"]').click()
    cy.url().should('include', '/model-builder')
  })

  it('should allow widget customization and rearrangement', () => {
    cy.get('[data-cy="customize-dashboard"]').click()
    cy.get('[data-cy="widget-settings-panel"]').should('be.visible')

    cy.get('[data-cy="toggle-widget-active-models"]').click()
    cy.get('[data-cy="save-dashboard-layout"]').click()

    cy.get('[data-cy="active-models-widget"]').should('not.exist')
  })

  it('should display system health widget', () => {
    cy.get('[data-cy="system-health-widget"]').should('be.visible')
    cy.get('[data-cy="cpu-usage"]').should('be.visible')
    cy.get('[data-cy="memory-usage"]').should('be.visible')
    cy.get('[data-cy="storage-usage"]').should('be.visible')
  })

  it('should show recent activity feed widget', () => {
    cy.get('[data-cy="activity-feed-widget"]').should('be.visible')
    cy.get('[data-cy="activity-list"]').should('be.visible')
    cy.get('[data-cy="activity-item"]').should('have.length.at.least', 1)

    cy.get('[data-cy="activity-timestamp"]').should('be.visible')
    cy.get('[data-cy="activity-description"]').should('be.visible')
  })

  it('should handle widget refresh functionality', () => {
    cy.get('[data-cy="active-models-widget"] [data-cy="refresh-widget"]').click()
    cy.get('[data-cy="widget-loading"]').should('be.visible')
    cy.get('[data-cy="widget-loading"]').should('not.exist')
  })

  it('should expand widgets to full view', () => {
    cy.get('[data-cy="recent-experiments-widget"] [data-cy="expand-widget"]').click()
    cy.get('[data-cy="expanded-widget-modal"]').should('be.visible')
    cy.get('[data-cy="widget-full-content"]').should('be.visible')

    cy.get('[data-cy="close-expanded-widget"]').click()
    cy.get('[data-cy="expanded-widget-modal"]').should('not.exist')
  })
})