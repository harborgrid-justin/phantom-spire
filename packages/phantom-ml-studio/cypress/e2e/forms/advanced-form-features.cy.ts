describe('Advanced Form Features', () => {
  beforeEach(() => {
    cy.visit('/modelBuilder')
  })

  it('should support conditional form fields', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="model-type"]').select('classification')

    cy.get('[data-cy="classification-options"]').should('be.visible')
    cy.get('[data-cy="regression-options"]').should('not.exist')

    cy.get('[data-cy="model-type"]').select('regression')
    cy.get('[data-cy="regression-options"]').should('be.visible')
    cy.get('[data-cy="classification-options"]').should('not.exist')
  })

  it('should auto-save form progress', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="model-name-input"]').type('Auto-saved Model')

    cy.wait(3000) // Wait for auto-save
    cy.get('[data-cy="auto-save-indicator"]').should('be.visible')

    cy.reload()
    cy.get('[data-cy="restore-draft"]').click()
    cy.get('[data-cy="model-name-input"]').should('have.value', 'Auto-saved Model')
  })

  it('should validate form dependencies', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="advanced-options"]').check()

    cy.get('[data-cy="custom-validation"]').should('be.visible')
    cy.get('[data-cy="validation-rule"]').type('accuracy > 0.8')
    cy.get('[data-cy="add-validation"]').click()

    cy.get('[data-cy="validation-added"]').should('be.visible')
  })

  it('should support bulk form operations', () => {
    cy.visit('/experiments')
    cy.get('[data-cy="bulk-operations"]').click()

    cy.get('[data-cy="select-all-experiments"]').check()
    cy.get('[data-cy="bulk-action"]').select('update-status')
    cy.get('[data-cy="new-status"]').select('archived')
    cy.get('[data-cy="apply-bulk-action"]').click()

    cy.get('[data-cy="bulk-update-complete"]').should('be.visible')
  })

  it('should handle form internationalization', () => {
    cy.visit('/settings')
    cy.get('[data-cy="language-settings"]').click()
    cy.get('[data-cy="language"]').select('es')
    cy.get('[data-cy="save-language"]').click()

    cy.visit('/modelBuilder')
    cy.get('[data-cy="create-new-model"]').should('contain', 'Crear Nuevo Modelo')
  })

  it('should support form templates', () => {
    cy.get('[data-cy="form-templates"]').click()
    cy.get('[data-cy="template-classification"]').click()

    cy.get('[data-cy="template-applied"]').should('be.visible')
    cy.get('[data-cy="model-type"]').should('have.value', 'classification')
    cy.get('[data-cy="pre-filled-parameters"]').should('be.visible')
  })

  it('should export form data', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="complete-model-form"]').click()

    cy.get('[data-cy="export-form-data"]').click()
    cy.get('[data-cy="export-format"]').select('json')
    cy.get('[data-cy="export-form"]').click()

    cy.get('[data-cy="form-exported"]').should('be.visible')
  })
})