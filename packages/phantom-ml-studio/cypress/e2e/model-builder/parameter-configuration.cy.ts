describe('Parameter Configuration', () => {
  beforeEach(() => {
    cy.visit('/model-builder')
    cy.createModel('Test Model', 'random-forest')
    cy.get('[data-cy="configure-parameters"]').click()
  })

  it('should display parameter configuration interface', () => {
    cy.get('[data-cy="parameter-configuration"]').should('be.visible')
    cy.get('[data-cy="parameter-tabs"]').should('be.visible')
    cy.get('[data-cy="basic-parameters"]').should('be.visible')
    cy.get('[data-cy="advanced-parameters"]').should('be.visible')
  })

  it('should show basic parameters for Random Forest', () => {
    cy.get('[data-cy="basic-parameters"]').click()

    cy.get('[data-cy="param-n_estimators"]').should('be.visible')
    cy.get('[data-cy="param-max_depth"]').should('be.visible')
    cy.get('[data-cy="param-min_samples_split"]').should('be.visible')
    cy.get('[data-cy="param-random_state"]').should('be.visible')
  })

  it('should validate parameter values', () => {
    cy.get('[data-cy="param-n_estimators"] input').clear().type('-10')
    cy.get('[data-cy="validate-parameters"]').click()

    cy.get('[data-cy="validation-error"]').should('be.visible')
    cy.get('[data-cy="error-n_estimators"]').should('contain', 'must be positive')
  })

  it('should provide parameter descriptions and tooltips', () => {
    cy.get('[data-cy="param-n_estimators"] [data-cy="info-icon"]').trigger('mouseover')
    cy.get('[data-cy="tooltip"]').should('be.visible')
    cy.get('[data-cy="tooltip"]').should('contain', 'Number of trees in the forest')
  })

  it('should use parameter presets', () => {
    cy.get('[data-cy="parameter-presets"]').should('be.visible')
    cy.get('[data-cy="preset-high-performance"]').click()

    cy.get('[data-cy="param-n_estimators"] input').should('have.value', '200')
    cy.get('[data-cy="param-max_depth"] input').should('have.value', '10')
  })

  it('should enable hyperparameter tuning', () => {
    cy.get('[data-cy="enable-hyperparameter-tuning"]').check()
    cy.get('[data-cy="tuning-options"]').should('be.visible')

    cy.get('[data-cy="tuning-method"]').select('grid-search')
    cy.get('[data-cy="cross-validation-folds"]').type('5')
    cy.get('[data-cy="scoring-metric"]').select('accuracy')
  })

  it('should configure parameter ranges for tuning', () => {
    cy.get('[data-cy="enable-hyperparameter-tuning"]').check()
    cy.get('[data-cy="configure-ranges"]').click()

    cy.get('[data-cy="param-range-n_estimators"]').should('be.visible')
    cy.get('[data-cy="range-min-n_estimators"]').type('10')
    cy.get('[data-cy="range-max-n_estimators"]').type('100')
    cy.get('[data-cy="range-step-n_estimators"]').type('10')
  })

  it('should show advanced parameters', () => {
    cy.get('[data-cy="advanced-parameters"]').click()

    cy.get('[data-cy="param-criterion"]').should('be.visible')
    cy.get('[data-cy="param-min_samples_leaf"]').should('be.visible')
    cy.get('[data-cy="param-max_features"]').should('be.visible')
    cy.get('[data-cy="param-bootstrap"]').should('be.visible')
  })

  it('should save parameter configuration', () => {
    cy.get('[data-cy="param-n_estimators"] input').clear().type('150')
    cy.get('[data-cy="param-max_depth"] input').clear().type('8')

    cy.get('[data-cy="save-parameters"]').click()
    cy.get('[data-cy="parameters-saved"]').should('be.visible')
  })

  it('should load parameter configuration from file', () => {
    cy.get('[data-cy="load-parameters"]').click()
    cy.get('[data-cy="parameter-file-input"]').selectFile('cypress/fixtures/model-configs.json', { force: true })

    cy.get('[data-cy="parameters-loaded"]').should('be.visible')
    cy.get('[data-cy="param-n_estimators"] input').should('not.be.empty')
  })

  it('should export parameter configuration', () => {
    cy.get('[data-cy="export-parameters"]').click()
    cy.get('[data-cy="export-format"]').select('json')
    cy.get('[data-cy="export-confirm"]').click()

    cy.get('[data-cy="export-success"]').should('be.visible')
  })

  it('should show parameter impact on model performance', () => {
    cy.get('[data-cy="show-parameter-impact"]').click()
    cy.get('[data-cy="impact-analysis"]').should('be.visible')

    cy.waitForChart('[data-cy="parameter-impact-chart"]')
    cy.get('[data-cy="impact-score"]').should('be.visible')
  })

  it('should reset parameters to default values', () => {
    cy.get('[data-cy="param-n_estimators"] input').clear().type('500')
    cy.get('[data-cy="reset-to-defaults"]').click()

    cy.get('[data-cy="confirm-reset"]').click()
    cy.get('[data-cy="param-n_estimators"] input').should('have.value', '100')
  })
})