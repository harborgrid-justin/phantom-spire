describe('System Configuration', () => {
  beforeEach(() => {
    cy.visit('/settings')
    cy.get('[data-cy="system-settings"]').click()
  })

  it('should configure system resources', () => {
    cy.get('[data-cy="resource-settings"]').click()
    cy.get('[data-cy="max-memory"]').clear().type('8')
    cy.get('[data-cy="max-cpu-cores"]').clear().type('4')
    cy.get('[data-cy="gpu-allocation"]').select('auto')
    cy.get('[data-cy="save-resources"]').click()

    cy.get('[data-cy="resources-updated"]').should('be.visible')
  })

  it('should configure database settings', () => {
    cy.get('[data-cy="database-settings"]').click()
    cy.get('[data-cy="connection-pool-size"]').clear().type('20')
    cy.get('[data-cy="query-timeout"]').clear().type('30')
    cy.get('[data-cy="backup-frequency"]').select('daily')
    cy.get('[data-cy="save-database-config"]').click()
  })

  it('should manage API configurations', () => {
    cy.get('[data-cy="api-configuration"]').click()
    cy.get('[data-cy="rate-limit"]').clear().type('1000')
    cy.get('[data-cy="timeout-duration"]').clear().type('30')
    cy.get('[data-cy="enable-cors"]').check()
    cy.get('[data-cy="save-api-config"]').click()
  })

  it('should configure security policies', () => {
    cy.get('[data-cy="security-policies"]').click()
    cy.get('[data-cy="password-policy"]').click()

    cy.get('[data-cy="min-password-length"]').clear().type('8')
    cy.get('[data-cy="require-special-chars"]').check()
    cy.get('[data-cy="session-timeout"]').clear().type('60')
    cy.get('[data-cy="save-security-policy"]').click()
  })

  it('should manage backup and recovery', () => {
    cy.get('[data-cy="backup-recovery"]').click()
    cy.get('[data-cy="auto-backup"]').check()
    cy.get('[data-cy="backup-retention"]').select('30-days')
    cy.get('[data-cy="backup-location"]').type('/backups/ml-studio')
    cy.get('[data-cy="save-backup-config"]').click()
  })

  it('should configure logging levels', () => {
    cy.get('[data-cy="logging-configuration"]').click()
    cy.get('[data-cy="log-level"]').select('info')
    cy.get('[data-cy="enable-audit-logs"]').check()
    cy.get('[data-cy="log-retention"]').clear().type('90')
    cy.get('[data-cy="save-logging-config"]').click()
  })

  it('should test system health', () => {
    cy.get('[data-cy="system-health-check"]').click()
    cy.get('[data-cy="run-diagnostics"]').click()

    cy.get('[data-cy="diagnostic-progress"]').should('be.visible')
    cy.get('[data-cy="health-results"]').should('be.visible')
    cy.get('[data-cy="system-status"]').should('be.visible')
  })
})