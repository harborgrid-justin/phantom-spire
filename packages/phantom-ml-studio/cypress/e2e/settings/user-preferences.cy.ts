describe('User Preferences and Settings', () => {
  beforeEach(() => {
    cy.visit('/settings')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display settings interface', () => {
    cy.get('[data-cy="settings-title"]').should('be.visible')
    cy.get('[data-cy="settings-navigation"]').should('be.visible')
    cy.get('[data-cy="user-preferences"]').should('be.visible')
    cy.get('[data-cy="system-settings"]').should('be.visible')
  })

  it('should update user profile', () => {
    cy.get('[data-cy="user-profile"]').click()
    cy.get('[data-cy="profile-form"]').should('be.visible')

    cy.get('[data-cy="display-name"]').clear().type('John Smith')
    cy.get('[data-cy="email"]').clear().type('john.smith@company.com')
    cy.get('[data-cy="timezone"]').select('America/New_York')
    cy.get('[data-cy="save-profile"]').click()

    cy.get('[data-cy="profile-updated"]').should('be.visible')
  })

  it('should configure dashboard preferences', () => {
    cy.get('[data-cy="dashboard-preferences"]').click()
    cy.get('[data-cy="default-view"]').select('detailed')
    cy.get('[data-cy="refresh-interval"]').select('30')
    cy.get('[data-cy="show-tooltips"]').check()
    cy.get('[data-cy="save-dashboard-prefs"]').click()
  })

  it('should set notification preferences', () => {
    cy.get('[data-cy="notification-preferences"]').click()
    cy.get('[data-cy="email-notifications"]').check()
    cy.get('[data-cy="browser-notifications"]').uncheck()
    cy.get('[data-cy="training-complete"]').check()
    cy.get('[data-cy="deployment-alerts"]').check()
    cy.get('[data-cy="save-notifications"]').click()
  })

  it('should change theme and appearance', () => {
    cy.get('[data-cy="appearance"]').click()
    cy.get('[data-cy="theme-selector"]').select('dark')
    cy.get('[data-cy="sidebar-collapsed"]').check()
    cy.get('[data-cy="save-appearance"]').click()

    cy.get('body').should('have.class', 'dark-theme')
  })

  it('should configure security settings', () => {
    cy.get('[data-cy="security-settings"]').click()
    cy.get('[data-cy="two-factor-auth"]').check()
    cy.get('[data-cy="session-timeout"]').select('60')
    cy.get('[data-cy="save-security"]').click()
  })

  it('should export user data', () => {
    cy.get('[data-cy="data-export"]').click()
    cy.get('[data-cy="export-preferences"]').check()
    cy.get('[data-cy="export-models"]').check()
    cy.get('[data-cy="request-export"]').click()

    cy.get('[data-cy="export-requested"]').should('be.visible')
  })

  it('should reset settings to default', () => {
    cy.get('[data-cy="reset-settings"]').click()
    cy.get('[data-cy="confirm-reset"]').click()
    cy.get('[data-cy="settings-reset"]').should('be.visible')
  })
})