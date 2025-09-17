describe('Accessibility Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.injectAxe()
  })

  it('should be keyboard navigable', () => {
    cy.get('body').tab()
    // Use pressKey instead for tab navigation
    cy.get('body').pressKey('Tab')
    cy.get('body').pressKey('Tab')

    // Or use trigger for keyboard events
    cy.get('body').trigger('keydown', { keyCode: 9 })
  })

  it('should have proper ARIA labels', () => {
    cy.get('[data-cy="sidebar"]').should('have.attr', 'aria-label', 'Main navigation')
    cy.get('[data-cy="user-menu"]').should('have.attr', 'aria-label', 'User menu')
    cy.get('[data-cy="notifications-icon"]').should('have.attr', 'aria-label', 'Notifications')
  })

  it('should support screen reader navigation', () => {
    cy.get('[data-cy="sidebar-menu-dashboard"]').should('have.attr', 'role', 'menuitem')
    cy.get('[data-cy="breadcrumbs"]').should('have.attr', 'aria-label', 'Breadcrumb navigation')
  })

  it('should pass accessibility audit', () => {
    cy.checkA11y()
  })

  it('should handle focus management', () => {
    cy.get('[data-cy="sidebar-menu-experiments"]').click()
    cy.focused().should('have.attr', 'data-cy', 'experiments-title')

    cy.get('[data-cy="create-experiment"]').click()
    cy.focused().should('have.attr', 'data-cy', 'experiment-name')
  })
})