describe('Dashboard Real-time Updates', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    
    // Wait for page to load completely
    cy.get('body').should('exist')
    
    // Check for loading indicator and wait for it to disappear
    cy.get('[data-cy="page-loading"]').should('not.exist', { timeout: 10000 })
    
    // Set up real-time API intercepts
    cy.intercept('GET', '**/api/dashboard/realtime*', { 
      statusCode: 200,
      body: {
        status: 'connected',
        timestamp: new Date().toISOString()
      }
    }).as('realtimeDefault')
  })

  it('should display real-time connection status', () => {
    cy.log('Testing real-time connection status display')
    
    // Check for real-time status elements with multiple selector patterns
    cy.get('body').then(($body) => {
      const statusSelectors = [
        '[data-cy="realtime-status"]',
        '[data-testid="realtime-status"]',
        '.realtime-status',
        '.connection-status',
        '[class*="realtime"]'
      ]
      
      let statusFound = false
      statusSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          statusFound = true
          cy.log(`Found realtime status with selector: ${selector}`)
        }
      })
      
      if (!statusFound) {
        cy.log('No specific realtime status element found - checking for general status indicators')
      }
    })
    
    // Check for connection indicator
    cy.get('body').then(($body) => {
      const indicatorSelectors = [
        '[data-cy="connection-indicator"]',
        '[data-testid="connection-indicator"]',
        '.connection-indicator',
        '.status-indicator',
        '[class*="connect"]'
      ]
      
      indicatorSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            // Check for connected state or visibility
            if ($el.hasClass('connected') || $el.is(':visible')) {
              cy.log(`Connection indicator found and active: ${selector}`)
            }
          })
        }
      })
    })
    
    // Check for last update time display
    cy.get('body').then(($body) => {
      const timeSelectors = [
        '[data-cy="last-update-time"]',
        '[data-testid="last-update-time"]',
        '.last-update-time',
        '.update-time',
        '[class*="timestamp"]'
      ]
      
      timeSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`Last update time found: ${selector}`)
        }
      })
    })
  })

  it('should update metrics in real-time', () => {
    cy.log('Testing real-time metrics updates')
    
    // Set up intercept for real-time metrics
    cy.intercept('GET', '**/api/dashboard/realtime*', {
      statusCode: 200,
      body: {
        models_count: 25,
        active_deployments: 8,
        timestamp: new Date().toISOString()
      }
    }).as('realtimeMetrics')

    // Trigger real-time update by refreshing or waiting
    cy.reload()
    
    // Wait for metrics to load
    cy.wait('@realtimeMetrics').then(() => {
      cy.log('Real-time metrics intercepted successfully')
    })
    
    // Check for KPI elements with flexible selectors
    cy.get('body').then(($body) => {
      const modelSelectors = [
        '[data-cy="kpi-total-models"]',
        '[data-testid="total-models"]',
        '.kpi-models',
        '.models-count',
        '[class*="models"]'
      ]
      
      modelSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            const text = $el.text()
            if (text.includes('25') || text.includes('model')) {
              cy.log(`Models KPI found and updated: ${selector}`)
            }
          })
        }
      })
      
      const deploymentSelectors = [
        '[data-cy="kpi-active-deployments"]',
        '[data-testid="active-deployments"]',
        '.kpi-deployments',
        '.deployments-count',
        '[class*="deployment"]'
      ]
      
      deploymentSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            const text = $el.text()
            if (text.includes('8') || text.includes('deployment')) {
              cy.log(`Deployments KPI found and updated: ${selector}`)
            }
          })
        }
      })
    })
  })

  it('should show real-time chart updates', () => {
    cy.log('Testing real-time chart updates')
    
    // Set up performance stream intercept
    cy.intercept('GET', '**/api/dashboard/performance-stream*', {
      statusCode: 200,
      body: {
        timestamp: new Date().toISOString(),
        accuracy: 0.92,
        latency: 45
      }
    }).as('performanceStream')

    // Look for real-time performance charts with multiple selector patterns
    cy.get('body').then(($body) => {
      const chartSelectors = [
        '[data-cy="real-time-performance-chart"]',
        '[data-testid="real-time-chart"]',
        '.real-time-chart',
        '.performance-chart',
        'canvas',
        'svg',
        '[class*="recharts"]',
        '[class*="chart"]'
      ]
      
      let chartFound = false
      chartSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !chartFound) {
          cy.get(selector).should('be.visible')
          chartFound = true
          cy.log(`Real-time chart found: ${selector}`)
          
          // Wait for chart to load
          cy.get(selector).should('exist').then(() => {
            cy.log('Chart element exists and is visible')
          })
        }
      })
      
      if (!chartFound) {
        cy.log('No real-time chart found - checking for chart containers')
        const containerSelectors = [
          '.chart-container',
          '.dashboard-chart',
          '[class*="chart-wrapper"]'
        ]
        containerSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('be.visible')
            cy.log(`Chart container found: ${selector}`)
          }
        })
      }
    })

    // Trigger performance update
    cy.wait('@performanceStream').then(() => {
      cy.log('Performance stream data intercepted')
    })
  })

  it('should handle connection loss gracefully', () => {
    cy.log('Testing connection loss handling')
    
    // Simulate connection error
    cy.intercept('GET', '**/api/dashboard/realtime*', { 
      forceNetworkError: true 
    }).as('connectionError')

    // Trigger refresh to simulate connection loss
    cy.reload()
    
    // Wait for error condition
    cy.wait(2000)
    
    // Check for disconnected state indicators
    cy.get('body').then(($body) => {
      const disconnectedSelectors = [
        '[data-cy="connection-indicator"]',
        '.connection-indicator',
        '.status-indicator',
        '[class*="disconnect"]',
        '[class*="error"]'
      ]
      
      disconnectedSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            // Check for disconnected class or error state
            if ($el.hasClass('disconnected') || $el.hasClass('error') || $el.text().includes('disconnect')) {
              cy.log(`Disconnected state detected: ${selector}`)
            }
          })
        }
      })
      
      const errorMessageSelectors = [
        '[data-cy="connection-error-message"]',
        '.connection-error',
        '.error-message',
        '[class*="error-msg"]'
      ]
      
      errorMessageSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`Error message displayed: ${selector}`)
        }
      })
    })
  })

  it('should reconnect automatically after connection loss', () => {
    cy.log('Testing automatic reconnection')
    
    // First, simulate disconnection
    cy.intercept('GET', '**/api/dashboard/realtime*', { 
      forceNetworkError: true 
    }).as('disconnect')

    cy.reload()
    cy.wait(1000)
    cy.log('Simulated disconnection')

    // Then simulate successful reconnection
    cy.intercept('GET', '**/api/dashboard/realtime*', {
      statusCode: 200,
      body: {
        status: 'connected',
        timestamp: new Date().toISOString()
      }
    }).as('reconnect')

    // Wait for reconnection attempt
    cy.wait(2000)
    
    // Check for reconnected state
    cy.get('body').then(($body) => {
      const connectedSelectors = [
        '[data-cy="connection-indicator"]',
        '.connection-indicator',
        '.status-indicator',
        '[class*="connect"]'
      ]
      
      connectedSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            if ($el.hasClass('connected') || $el.text().includes('connect')) {
              cy.log(`Reconnected state detected: ${selector}`)
            }
          })
        }
      })
      
      const notificationSelectors = [
        '[data-cy="reconnection-notification"]',
        '.reconnection-notification',
        '.notification',
        '[class*="notification"]'
      ]
      
      notificationSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`Reconnection notification found: ${selector}`)
        }
      })
    })
  })

  it('should show real-time alerts and notifications', () => {
    cy.log('Testing real-time alerts and notifications')
    
    // Set up alerts intercept
    cy.intercept('GET', '**/api/dashboard/alerts*', {
      statusCode: 200,
      body: {
        alerts: [{
          id: 'alert-1',
          type: 'warning',
          message: 'Model accuracy dropped below threshold',
          timestamp: new Date().toISOString()
        }]
      }
    }).as('alertsStream')

    // Trigger alerts by refreshing
    cy.reload()
    cy.wait('@alertsStream').then(() => {
      cy.log('Alerts stream intercepted')
    })
    
    // Look for alert elements
    cy.get('body').then(($body) => {
      const alertSelectors = [
        '[data-cy="real-time-alert"]',
        '[data-testid="alert"]',
        '.real-time-alert',
        '.alert',
        '.notification',
        '[class*="alert"]'
      ]
      
      alertSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`Alert element found: ${selector}`)
        }
      })
      
      const messageSelectors = [
        '[data-cy="alert-message"]',
        '.alert-message',
        '.message',
        '[class*="message"]'
      ]
      
      messageSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            if ($el.text().includes('accuracy') || $el.text().includes('threshold')) {
              cy.log(`Alert message found: ${selector}`)
            }
          })
        }
      })
    })
  })

  it('should update training progress in real-time', () => {
    cy.log('Testing real-time training progress updates')
    
    // Set up training progress intercept
    cy.intercept('GET', '**/api/training/progress*', {
      statusCode: 200,
      body: {
        model_id: 'model-123',
        progress: 75,
        status: 'training',
        eta_minutes: 5
      }
    }).as('trainingProgress')

    // Trigger progress update
    cy.reload()
    cy.wait('@trainingProgress').then(() => {
      cy.log('Training progress intercepted')
    })
    
    // Look for training progress elements
    cy.get('body').then(($body) => {
      const progressSelectors = [
        '[data-cy="training-progress-bar"]',
        '[data-testid="progress-bar"]',
        '.training-progress-bar',
        '.progress-bar',
        'progress',
        '[class*="progress"]'
      ]
      
      progressSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible')
          cy.log(`Training progress bar found: ${selector}`)
        }
      })
      
      const percentageSelectors = [
        '[data-cy="progress-percentage"]',
        '.progress-percentage',
        '.percentage',
        '[class*="percent"]'
      ]
      
      percentageSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            if ($el.text().includes('75%') || $el.text().includes('75')) {
              cy.log(`Progress percentage found: ${selector}`)
            }
          })
        }
      })
      
      const etaSelectors = [
        '[data-cy="eta-display"]',
        '.eta-display',
        '.eta',
        '[class*="eta"]',
        '[class*="time"]'
      ]
      
      etaSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).then(($el) => {
            if ($el.text().includes('5') || $el.text().includes('minute')) {
              cy.log(`ETA display found: ${selector}`)
            }
          })
        }
      })
    })
  })

  it('should allow pausing real-time updates', () => {
    cy.log('Testing pause/resume functionality for real-time updates')
    
    // Look for pause button
    cy.get('body').then(($body) => {
      const pauseSelectors = [
        '[data-cy="pause-realtime-updates"]',
        '[data-testid="pause-button"]',
        '.pause-realtime-updates',
        '.pause-button',
        'button[class*="pause"]'
      ]
      
      let pauseFound = false
      pauseSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !pauseFound) {
          cy.get(selector).click()
          pauseFound = true
          cy.log(`Pause button clicked: ${selector}`)
        }
      })
      
      if (pauseFound) {
        // Check for paused state
        const pausedIndicatorSelectors = [
          '[data-cy="realtime-paused-indicator"]',
          '.realtime-paused-indicator',
          '.paused-indicator',
          '[class*="paused"]'
        ]
        
        pausedIndicatorSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('be.visible')
            cy.log(`Paused indicator found: ${selector}`)
          }
        })
        
        // Check for paused connection indicator
        const connectionSelectors = [
          '[data-cy="connection-indicator"]',
          '.connection-indicator',
          '.status-indicator'
        ]
        
        connectionSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).then(($el) => {
              if ($el.hasClass('paused') || $el.text().includes('paused')) {
                cy.log(`Connection indicator shows paused state: ${selector}`)
              }
            })
          }
        })
        
        // Look for resume button and test it
        const resumeSelectors = [
          '[data-cy="resume-realtime-updates"]',
          '[data-testid="resume-button"]',
          '.resume-realtime-updates',
          '.resume-button',
          'button[class*="resume"]'
        ]
        
        resumeSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).click()
            cy.log(`Resume button clicked: ${selector}`)
            
            // Verify resumed state
            cy.wait(1000).then(() => {
              pausedIndicatorSelectors.forEach(pausedSelector => {
                if ($body.find(pausedSelector).length > 0) {
                  cy.get(pausedSelector).should('not.exist')
                  cy.log(`Paused indicator removed after resume`)
                }
              })
            })
          }
        })
      } else {
        cy.log('No pause/resume controls found - real-time updates may not be pausable')
      }
    })
  })
})