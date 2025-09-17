describe('Deployment Scaling and Management', () => {
  beforeEach(() => {
    cy.visit('/deployments')
    cy.get('[data-cy="active-deployment"]').first().click()
  })

  it('should scale deployment manually', () => {
    cy.get('[data-cy="scaling-controls"]').should('be.visible')
    cy.get('[data-cy="current-instances"]').should('be.visible')

    cy.get('[data-cy="scale-up"]').click()
    cy.get('[data-cy="confirm-scaling"]').click()
    cy.get('[data-cy="scaling-in-progress"]').should('be.visible')
  })

  it('should configure auto-scaling', () => {
    cy.get('[data-cy="auto-scaling-config"]').click()
    cy.get('[data-cy="enable-auto-scaling"]').check()

    cy.get('[data-cy="min-instances"]').type('2')
    cy.get('[data-cy="max-instances"]').type('10')
    cy.get('[data-cy="scale-trigger"]').select('cpu_utilization')
    cy.get('[data-cy="scale-threshold"]').type('70')
    cy.get('[data-cy="save-auto-scaling"]').click()
  })

  it('should update deployment', () => {
    cy.get('[data-cy="update-deployment"]').click()
    cy.get('[data-cy="new-model-version"]').select('v2.1')
    cy.get('[data-cy="deployment-strategy"]').select('rolling')
    cy.get('[data-cy="confirm-update"]').click()

    cy.get('[data-cy="update-progress"]').should('be.visible')
  })

  it('should rollback deployment', () => {
    cy.get('[data-cy="deployment-history"]').click()
    cy.get('[data-cy="previous-version"]').first().find('[data-cy="rollback"]').click()
    cy.get('[data-cy="confirm-rollback"]').click()

    cy.get('[data-cy="rollback-in-progress"]').should('be.visible')
  })
})