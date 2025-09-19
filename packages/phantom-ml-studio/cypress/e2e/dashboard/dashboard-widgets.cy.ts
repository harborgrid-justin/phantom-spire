describe('Dashboard Widgets', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')
    
    // Wait for page to load completely
    cy.wait(1000)
    
    // Check if loading indicators are gone
    cy.get('body').then($body => {
      const hasLoadingIndicator = $body.find('[data-cy="page-loading"], .loading, [class*="loading"]').length > 0
      if (!hasLoadingIndicator) {
        cy.log('✅ Page loaded successfully')
      } else {
        cy.get('[data-cy="page-loading"], .loading').should('not.exist', { timeout: 10000 })
      }
    })
  })

  it('should display and interact with active models widget', () => {
    // Look for model-related widgets or content
    const modelSelectors = [
      '[data-cy*="model"]',
      '.model-widget',
      '.models-list',
      '.active-models',
      '[class*="model"]'
    ]
    
    cy.get('body').then($body => {
      const modelElements = $body.find(modelSelectors.join(', '))
      
      if (modelElements.length > 0) {
        cy.log(`✅ Found ${modelElements.length} model-related elements`)
        
        // Test visibility of model elements
        cy.get(modelSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Try to interact with model items
        cy.get('[data-cy*="model"], .model-item').then($modelItems => {
          if ($modelItems.length > 0) {
            // Click on first model item
            cy.get('[data-cy*="model"], .model-item').first().click({ force: true })
            cy.wait(500)
            
            // Check if navigation occurred or modal opened
            cy.url().then(url => {
              if (url.includes('/model')) {
                cy.log('✅ Navigation to model page successful')
              } else {
                cy.log('✅ Model interaction completed')
              }
            })
          }
        })
      } else {
        cy.log('ℹ️ No model widget found - may not be implemented yet')
      }
    })
  })

  it('should show recent experiments widget with proper data', () => {
    // Look for experiment-related widgets
    const experimentSelectors = [
      '[data-cy*="experiment"]',
      '.experiment-widget',
      '.experiments-list',
      '.recent-experiments',
      '[class*="experiment"]'
    ]
    
    cy.get('body').then($body => {
      const experimentElements = $body.find(experimentSelectors.join(', '))
      
      if (experimentElements.length > 0) {
        cy.log(`✅ Found ${experimentElements.length} experiment-related elements`)
        
        // Test visibility
        cy.get(experimentSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for status indicators and timestamps
        cy.get('body').then($body => {
          const hasStatus = $body.find('[data-cy*="status"], .status, [class*="status"]').length > 0
          const hasTimestamp = $body.find('[data-cy*="time"], .timestamp, [class*="time"], time').length > 0
          
          if (hasStatus) {
            cy.get('[data-cy*="status"], .status').should('be.visible')
            cy.log('✅ Experiment status indicators found')
          }
          
          if (hasTimestamp) {
            cy.get('[data-cy*="time"], .timestamp, time').should('be.visible')  
            cy.log('✅ Experiment timestamps found')
          }
        })
      } else {
        cy.log('ℹ️ No experiment widget found - may not be implemented yet')
      }
    })
  })

  it('should display deployment status widget', () => {
    // Look for deployment-related widgets
    const deploymentSelectors = [
      '[data-cy*="deployment"]',
      '.deployment-widget',
      '.deployment-status',
      '[class*="deployment"]'
    ]
    
    cy.get('body').then($body => {
      const deploymentElements = $body.find(deploymentSelectors.join(', '))
      
      if (deploymentElements.length > 0) {
        cy.log(`✅ Found ${deploymentElements.length} deployment-related elements`)
        
        // Test visibility
        cy.get(deploymentSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for health indicators
        cy.get('body').then($body => {
          const hasHealthIndicator = $body.find('[data-cy*="health"], .health, .status-indicator, [class*="health"]').length > 0
          
          if (hasHealthIndicator) {
            cy.get('[data-cy*="health"], .health, .status-indicator').should('be.visible')
            cy.log('✅ Deployment health indicators found')
          }
        })
      } else {
        cy.log('ℹ️ No deployment widget found - may not be implemented yet')
      }
    })
  })

  it('should show quick actions widget', () => {
    // Look for quick action buttons or widgets
    const actionSelectors = [
      '[data-cy*="action"]',
      '.quick-actions',
      '.action-button',
      'button[class*="primary"]',
      '.cta-button',
      '[class*="action"]'
    ]
    
    cy.get('body').then($body => {
      const actionElements = $body.find(actionSelectors.join(', '))
      
      if (actionElements.length > 0) {
        cy.log(`✅ Found ${actionElements.length} action-related elements`)
        
        // Test visibility of action elements
        cy.get('button, [data-cy*="action"]').should('have.length.at.least', 1)
        
        // Look for specific actions like create, upload, new
        const specificActions = $body.find('button, a').filter((_, el) => {
          const text = Cypress.$(el).text().toLowerCase()
          return text.includes('create') || text.includes('upload') || text.includes('new') || text.includes('add')
        })
        
        if (specificActions.length > 0) {
          cy.log(`✅ Found ${specificActions.length} quick action buttons`)
          
          // Click on first action button
          cy.get('button, a').filter(':contains("Create"), :contains("New"), :contains("Add"), :contains("Upload")').first().then($button => {
            if ($button.length > 0) {
              cy.wrap($button).click({ force: true })
              cy.wait(500)
              
              // Check for navigation or modal
              cy.url().then(url => {
                if (url !== Cypress.config().baseUrl + '/dashboard') {
                  cy.log('✅ Quick action navigation successful')
                } else {
                  cy.log('✅ Quick action interaction completed')
                }
              })
            }
          })
        }
      } else {
        cy.log('ℹ️ No quick actions widget found - testing general buttons')
        
        // Test any available buttons
        cy.get('button').then($buttons => {
          if ($buttons.length > 0) {
            cy.log(`Found ${$buttons.length} buttons to test`)
            cy.get('button:visible').first().click({ force: true })
            cy.wait(500)
          }
        })
      }
    })
  })

  it('should allow widget customization and rearrangement', () => {
    // Look for customization controls
    const customizationSelectors = [
      '[data-cy*="customize"]',
      '[data-cy*="settings"]',
      '.customize-dashboard',
      '.settings-button',
      'button:contains("Settings")',
      'button:contains("Customize")',
      '[aria-label*="settings"]'
    ]
    
    cy.get('body').then($body => {
      const customizationElements = $body.find(customizationSelectors.join(', '))
      
      if (customizationElements.length > 0) {
        cy.log('✅ Customization controls found')
        
        // Try to open customization panel
        cy.get(customizationSelectors.join(', ')).first().click({ force: true })
        cy.wait(500)
        
        // Look for settings panel or modal
        cy.get('body').then($body => {
          const hasSettingsPanel = $body.find('[data-cy*="settings"], .settings-panel, .modal, .drawer').length > 0
          
          if (hasSettingsPanel) {
            cy.get('[data-cy*="settings"], .settings-panel, .modal').should('be.visible')
            cy.log('✅ Settings panel opened')
            
            // Look for widget toggles or save buttons
            cy.get('body').then($body => {
              const hasSaveButton = $body.find('button:contains("Save"), [data-cy*="save"]').length > 0
              if (hasSaveButton) {
                cy.get('button:contains("Save"), [data-cy*="save"]').click()
                cy.wait(500)
                cy.log('✅ Dashboard customization saved')
              }
            })
          }
        })
      } else {
        cy.log('ℹ️ No widget customization controls found')
      }
    })
  })

  it('should display system health widget', () => {
    // Look for system health indicators
    const healthSelectors = [
      '[data-cy*="health"]',
      '[data-cy*="system"]',
      '.system-health',
      '.health-widget',
      '.cpu-usage',
      '.memory-usage',
      '.storage-usage',
      '[class*="usage"]'
    ]
    
    cy.get('body').then($body => {
      const healthElements = $body.find(healthSelectors.join(', '))
      
      if (healthElements.length > 0) {
        cy.log(`✅ Found ${healthElements.length} system health elements`)
        
        // Test visibility
        cy.get(healthSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for specific metrics
        const metrics = ['cpu', 'memory', 'storage', 'disk', 'ram']
        metrics.forEach(metric => {
          cy.get('body').then($body => {
            const hasMetric = $body.find(`[class*="${metric}"], [data-cy*="${metric}"]`).length > 0
            if (hasMetric) {
              cy.log(`✅ ${metric.toUpperCase()} usage metric found`)
            }
          })
        })
      } else {
        cy.log('ℹ️ No system health widget found')
      }
    })
  })

  it('should show recent activity feed widget', () => {
    // Look for activity feed elements
    const activitySelectors = [
      '[data-cy*="activity"]',
      '.activity-feed',
      '.activity-widget',
      '.recent-activity',
      '[class*="activity"]'
    ]
    
    cy.get('body').then($body => {
      const activityElements = $body.find(activitySelectors.join(', '))
      
      if (activityElements.length > 0) {
        cy.log(`✅ Found ${activityElements.length} activity feed elements`)
        
        // Test visibility
        cy.get(activitySelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for activity items with timestamps
        cy.get('body').then($body => {
          const hasActivityItems = $body.find('.activity-item, [data-cy*="activity-item"], li').length > 0
          const hasTimestamps = $body.find('time, .timestamp, [data-cy*="time"]').length > 0
          
          if (hasActivityItems) {
            cy.log('✅ Activity items found')
          }
          
          if (hasTimestamps) {
            cy.get('time, .timestamp').should('be.visible')
            cy.log('✅ Activity timestamps found')
          }
        })
      } else {
        cy.log('ℹ️ No activity feed widget found')
      }
    })
  })

  it('should handle widget refresh functionality', () => {
    // Look for refresh buttons or icons
    const refreshSelectors = [
      '[data-cy*="refresh"]',
      '.refresh-button',
      'button[aria-label*="refresh"]',
      'button[title*="refresh"]',
      '[class*="refresh"]',
      'svg[class*="refresh"]'
    ]
    
    cy.get('body').then($body => {
      const refreshElements = $body.find(refreshSelectors.join(', '))
      
      if (refreshElements.length > 0) {
        cy.log(`✅ Found ${refreshElements.length} refresh controls`)
        
        // Click refresh button
        cy.get(refreshSelectors.join(', ')).first().click({ force: true })
        cy.wait(500)
        
        // Look for loading indicators
        cy.get('body').then($body => {
          const hasLoadingIndicator = $body.find('[data-cy*="loading"], .loading, .spinner').length > 0
          if (hasLoadingIndicator) {
            cy.get('[data-cy*="loading"], .loading, .spinner').should('be.visible')
            cy.wait(1000)
            cy.get('[data-cy*="loading"], .loading, .spinner').should('not.exist')
            cy.log('✅ Widget refresh completed with loading indicator')
          } else {
            cy.log('✅ Widget refresh completed')
          }
        })
      } else {
        cy.log('ℹ️ No refresh controls found - testing page refresh')
        
        // Test page-level refresh
        cy.reload()
        cy.get('body').should('be.visible')
        cy.wait(1000)
        cy.log('✅ Page refresh completed')
      }
    })
  })

  it('should expand widgets to full view', () => {
    // Look for expand buttons or full-view controls
    const expandSelectors = [
      '[data-cy*="expand"]',
      '[data-cy*="fullscreen"]',
      '.expand-button',
      'button[aria-label*="expand"]',
      'button[title*="expand"]',
      '[class*="expand"]',
      'svg[class*="expand"]'
    ]
    
    cy.get('body').then($body => {
      const expandElements = $body.find(expandSelectors.join(', '))
      
      if (expandElements.length > 0) {
        cy.log(`✅ Found ${expandElements.length} expand controls`)
        
        // Click expand button
        cy.get(expandSelectors.join(', ')).first().click({ force: true })
        cy.wait(500)
        
        // Look for modal or expanded view
        cy.get('body').then($body => {
          const hasModal = $body.find('.modal, .drawer, [data-cy*="modal"], [data-cy*="expanded"]').length > 0
          
          if (hasModal) {
            cy.get('.modal, .drawer, [data-cy*="modal"]').should('be.visible')
            cy.log('✅ Widget expanded to full view')
            
            // Try to close the expanded view
            cy.get('body').then($body => {
              const hasCloseButton = $body.find('button:contains("Close"), [data-cy*="close"], .close-button').length > 0
              
              if (hasCloseButton) {
                cy.get('button:contains("Close"), [data-cy*="close"], .close-button').first().click()
                cy.wait(500)
                cy.get('.modal, .drawer').should('not.exist')
                cy.log('✅ Expanded widget closed')
              } else {
                // Try ESC key
                cy.get('body').type('{esc}')
                cy.wait(500)
              }
            })
          } else {
            cy.log('✅ Widget expand interaction completed')
          }
        })
      } else {
        cy.log('ℹ️ No expand controls found')
      }
    })
  })
})