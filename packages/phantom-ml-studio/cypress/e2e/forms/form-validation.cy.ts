describe('Form Validation Across Application', () => {
  beforeEach(() => {
    cy.seedTestData('forms', 3)
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should test basic form functionality', () => {
    cy.visit('/settings')
    cy.url().should('include', '/settings')

    const formData = {
      'user-name': 'John Doe',
      'user-email': 'john@example.com',
      'user-role': 'admin'
    }

    cy.fillForm(formData)
  })

  it('should validate form errors', () => {
    cy.visit('/model-builder')
    cy.url().should('include', '/model-builder')

    const expectedErrors = ['required-name', 'invalid-type']
    cy.validateFormErrors(expectedErrors)
  })

  it('should submit form and verify result', () => {
    cy.visit('/experiments')
    cy.url().should('include', '/experiments')

    cy.submitFormAndVerify('success-notification')
  })

  it('should test form validation with mock data', () => {
    cy.mockApiResponse('**/api/forms/validate', {
      valid: true,
      errors: []
    })

    cy.visit('/data-explorer')
    cy.wait('@mockedAPI')
  })

  it('should handle navigation between pages', () => {
    cy.navigateToPage('/settings')
    cy.navigateToPage('/model-builder')
    cy.navigateToPage('/experiments')

    cy.go('back')
    cy.url().should('include', '/model-builder')
  })

  it('should test responsive form behavior', () => {
    cy.visit('/settings')
    cy.checkResponsiveDesign(['mobile', 'tablet', 'desktop'])
  })

  it('should measure page performance', () => {
    cy.visit('/model-builder')
    cy.measurePageLoad()
  })

  it('should test form with different input types', () => {
    cy.visit('/interactive-feature-engineering')

    const complexFormData = {
      'feature-name': 'test feature',
      'feature-type': 'numeric',
      'default-value': '42'
    }

    cy.fillForm(complexFormData)
  })

  it('should mock form submission responses', () => {
    cy.mockApiResponse('**/api/forms/submit', {
      success: true,
      message: 'Form submitted successfully'
    })

    cy.visit('/bias-detection-engine')
    cy.wait('@mockedAPI')
  })

  it('should test accessibility features', () => {
    cy.visit('/settings')
    cy.checkA11y()
  })

  it('should handle error scenarios gracefully', () => {
    cy.mockApiResponse('**/api/forms/submit', {
      statusCode: 400,
      body: { error: 'Validation failed' }
    })

    cy.visit('/deployments')
    cy.wait('@mockedAPI')
  })

  it('should test form workflows across multiple pages', () => {
    cy.visit('/dashboard')
    cy.navigateToPage('/experiments')
    cy.navigateToPage('/models')
    cy.navigateToPage('/deployments')

    // Verify final page
    cy.url().should('include', '/deployments')
  })
})