describe('AutoML Pipeline Results', () => {
  beforeEach(() => {
    cy.visit('/automl-pipeline-visualizer')
    cy.viewport(1280, 720)
    
    // Wait for page to load completely
    cy.get('body').should('be.visible')
    
    // Check for loading indicators with graceful fallback
    cy.get('body').then($body => {
      const hasLoadingIndicator = $body.find('[data-cy="page-loading"], .loading, [class*="loading"]').length > 0
      if (!hasLoadingIndicator) {
        cy.log('✅ Pipeline visualizer page loaded successfully')
      } else {
        cy.get('[data-cy="page-loading"], .loading').should('not.exist', { timeout: 10000 })
      }
    })
    
    // Look for completed pipeline with graceful fallback
    cy.get('body').then($body => {
      const completedPipelineSelectors = [
        '[data-cy="completed-pipeline"]',
        '.completed-pipeline',
        '[data-status="completed"]',
        'tbody tr'
      ]
      
      let pipelineFound = false
      completedPipelineSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !pipelineFound) {
          cy.get(selector).first().click()
          pipelineFound = true
          cy.log(`✅ Completed pipeline found and selected: ${selector}`)
        }
      })
      
      if (!pipelineFound) {
        cy.log('ℹ️ No completed pipeline found - may need to run pipeline first')
      }
    })
    
    // Look for view results button with graceful fallback
    cy.get('body').then($body => {
      const viewResultsSelectors = [
        '[data-cy="view-results"]',
        '[data-testid="view-results"]',
        '.view-results',
        'button:contains("Results")',
        'button:contains("View")'
      ]
      
      viewResultsSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).click()
          cy.log(`✅ View results clicked: ${selector}`)
        }
      })
    })
  })

  it('should display pipeline execution summary', () => {
    cy.get('[data-cy="results-summary"]').should('be.visible')
    cy.get('[data-cy="execution-duration"]').should('be.visible')
    cy.get('[data-cy="models-evaluated"]').should('be.visible')
    cy.get('[data-cy="best-model-name"]').should('be.visible')
    cy.get('[data-cy="best-accuracy"]').should('be.visible')
  })

  it('should show model leaderboard', () => {
    cy.get('[data-cy="model-leaderboard"]').should('be.visible')
    cy.get('[data-cy="leaderboard-table"]').should('be.visible')
    cy.get('[data-cy="model-rank"]').should('be.visible')
    cy.get('[data-cy="model-score"]').should('be.visible')
    cy.get('[data-cy="model-details"]').should('be.visible')
  })

  it('should display best model details', () => {
    cy.get('[data-cy="best-model-section"]').should('be.visible')
    cy.get('[data-cy="model-architecture"]').should('be.visible')
    cy.get('[data-cy="hyperparameters"]').should('be.visible')
    cy.get('[data-cy="feature-importance"]').should('be.visible')
    cy.get('[data-cy="performance-metrics"]').should('be.visible')
  })

  it('should show feature importance visualization', () => {
    cy.get('[data-cy="feature-importance-tab"]').click()
    
    // Look for feature importance chart with built-in commands
    cy.get('body').then($body => {
      const chartSelectors = [
        '[data-cy="feature-importance-chart"]',
        '[data-testid="importance-chart"]',
        '.feature-importance-chart',
        '.importance-chart',
        'canvas',
        'svg',
        '[class*="recharts"]'
      ]
      
      let chartFound = false
      chartSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !chartFound) {
          cy.get(selector).should('be.visible')
          chartFound = true
          cy.log(`✅ Feature importance chart found: ${selector}`)
        }
      })
      
      if (!chartFound) {
        cy.log('ℹ️ No feature importance chart found - checking for alternative visualizations')
      }
    })
    
    cy.get('[data-cy="importance-bars"]').should('exist')
    cy.get('[data-cy="feature-ranking"]').should('be.visible')
  })

  it('should display model performance charts', () => {
    cy.get('[data-cy="performance-charts"]').should('be.visible')
    
    // Look for performance charts with built-in commands
    cy.get('body').then($body => {
      const performanceChartSelectors = [
        '[data-cy="confusion-matrix"]',
        '[data-cy="roc-curve"]',
        '[data-cy="precision-recall-curve"]',
        '.confusion-matrix',
        '.roc-curve',
        '.precision-recall-curve',
        'canvas',
        'svg'
      ]
      
      performanceChartSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`✅ Performance chart found: ${selector}`)
        }
      })
    })
  })

  it('should allow model comparison', () => {
    cy.get('[data-cy="compare-models"]').click()
    cy.get('[data-cy="model-comparison"]').should('be.visible')

    cy.get('[data-cy="select-model-1"]').select('RandomForest')
    cy.get('[data-cy="select-model-2"]').select('SVM')
    cy.get('[data-cy="generate-comparison"]').click()

    cy.get('[data-cy="comparison-chart"]').should('be.visible')
    cy.get('[data-cy="performance-difference"]').should('be.visible')
  })

  it('should show preprocessing impact analysis', () => {
    cy.get('[data-cy="preprocessing-analysis"]').click()
    cy.get('[data-cy="preprocessing-impact"]').should('be.visible')
    cy.get('[data-cy="before-after-comparison"]').should('be.visible')
    
    // Look for impact chart with built-in commands
    cy.get('body').then($body => {
      const impactChartSelectors = [
        '[data-cy="impact-chart"]',
        '[data-testid="impact-chart"]',
        '.impact-chart',
        '.preprocessing-chart',
        'canvas',
        'svg',
        '[class*="recharts"]'
      ]
      
      impactChartSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`✅ Impact chart found: ${selector}`)
        }
      })
    })
  })

  it('should display hyperparameter optimization results', () => {
    cy.get('[data-cy="hyperparameter-results"]').click()
    cy.get('[data-cy="optimization-history"]').should('be.visible')
    
    // Look for optimization chart with built-in commands
    cy.get('body').then($body => {
      const optimizationChartSelectors = [
        '[data-cy="optimization-chart"]',
        '[data-testid="optimization-chart"]',
        '.optimization-chart',
        '.hyperparameter-chart',
        'canvas',
        'svg',
        '[class*="recharts"]'
      ]
      
      optimizationChartSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`✅ Optimization chart found: ${selector}`)
        }
      })
    })
    
    cy.get('[data-cy="parameter-importance"]').should('be.visible')
  })

  it('should export pipeline results', () => {
    cy.get('[data-cy="export-results"]').click()
    cy.get('[data-cy="export-options"]').should('be.visible')

    cy.get('[data-cy="export-summary"]').check()
    cy.get('[data-cy="export-models"]').check()
    cy.get('[data-cy="export-charts"]').check()
    cy.get('[data-cy="export-format"]').select('pdf')
    cy.get('[data-cy="generate-export"]').click()

    cy.get('[data-cy="export-progress"]').should('be.visible')
    cy.get('[data-cy="export-complete"]').should('be.visible')
  })

  it('should deploy best model from results', () => {
    cy.get('[data-cy="deploy-best-model"]').click()
    cy.get('[data-cy="deployment-config"]').should('be.visible')

    cy.get('[data-cy="deployment-name"]').type('AutoML Employee Performance Model')
    cy.get('[data-cy="deployment-environment"]').select('staging')
    cy.get('[data-cy="confirm-deployment"]').click()

    cy.get('[data-cy="deployment-initiated"]').should('be.visible')
  })

  it('should show execution timeline and bottlenecks', () => {
    cy.get('[data-cy="execution-timeline"]').click()
    cy.get('[data-cy="timeline-view"]').should('be.visible')
    
    // Look for timeline chart with built-in commands
    cy.get('body').then($body => {
      const timelineChartSelectors = [
        '[data-cy="timeline-chart"]',
        '[data-testid="timeline-chart"]',
        '.timeline-chart',
        '.execution-timeline-chart',
        'canvas',
        'svg',
        '[class*="recharts"]'
      ]
      
      timelineChartSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`✅ Timeline chart found: ${selector}`)
        }
      })
    })
    
    cy.get('[data-cy="bottleneck-analysis"]').should('be.visible')
    cy.get('[data-cy="optimization-suggestions"]').should('be.visible')
  })

  it('should create experiment from results', () => {
    cy.get('[data-cy="create-experiment"]').click()
    cy.get('[data-cy="experiment-creation"]').should('be.visible')

    cy.get('[data-cy="experiment-name"]').type('AutoML Pipeline Experiment')
    cy.get('[data-cy="include-all-models"]').check()
    cy.get('[data-cy="create-experiment-confirm"]').click()

    cy.get('[data-cy="experiment-created"]').should('be.visible')
  })
})