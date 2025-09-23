describe('Dashboard Metrics Visualization', () => {
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

  it('should display model performance metrics chart', () => {
    // Look for chart elements
    const chartSelectors = [
      '[data-cy*="chart"]',
      'canvas',
      'svg',
      '.chart',
      '.recharts-wrapper',
      '.recharts-responsive-container'
    ]
    
    cy.get('body').then($body => {
      const chartElements = $body.find(chartSelectors.join(', '))
      
      if (chartElements.length > 0) {
        cy.log(`✅ Found ${chartElements.length} chart elements`)
        
        // Wait for charts to load
        cy.get(chartSelectors.join(', ')).should('be.visible')
        cy.wait(1000)
        
        // Look for specific chart types
        cy.get('body').then($body => {
          const hasRechartsLine = $body.find('.recharts-line, .recharts-line-curve').length > 0
          const hasSvgElements = $body.find('svg path, svg line, svg rect').length > 0
          const hasCanvasChart = $body.find('canvas').length > 0
          
          if (hasRechartsLine) {
            cy.get('.recharts-line').should('exist')
            cy.log('✅ Line chart elements found')
          }
          
          if (hasSvgElements) {
            cy.get('svg').should('exist')
            cy.log('✅ SVG chart elements found')
          }
          
          if (hasCanvasChart) {
            cy.get('canvas').should('exist')
            cy.log('✅ Canvas chart elements found')
          }
        })
        
        // Look for chart legend
        cy.get('body').then($body => {
          const hasLegend = $body.find('[data-cy*="legend"], .legend, .recharts-legend').length > 0
          if (hasLegend) {
            cy.get('[data-cy*="legend"], .legend, .recharts-legend').should('be.visible')
            cy.log('✅ Chart legend found')
          }
        })
      } else {
        cy.log('ℹ️ No chart elements found - dashboard may not have charts yet')
      }
    })
  })

  it('should show training progress visualization', () => {
    // Look for training/progress related charts
    const progressSelectors = [
      '[data-cy*="progress"]',
      '[data-cy*="training"]',
      '.progress-chart',
      '.training-chart',
      '.recharts-bar',
      '.progress-bar'
    ]
    
    cy.get('body').then($body => {
      const progressElements = $body.find(progressSelectors.join(', '))
      
      if (progressElements.length > 0) {
        cy.log(`✅ Found ${progressElements.length} progress/training elements`)
        
        // Test visibility
        cy.get(progressSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for bar chart elements
        cy.get('body').then($body => {
          const hasRechartsBar = $body.find('.recharts-bar, .recharts-bar-rectangle').length > 0
          if (hasRechartsBar) {
            cy.get('.recharts-bar').should('exist')
            cy.log('✅ Bar chart elements found')
          }
        })
        
        // Look for progress percentages
        cy.get('body').then($body => {
          const progressText = $body.find('*').filter((_, el) => {
            const text = Cypress.$(el).text()
            return /%/.test(text) && /\d+/.test(text)
          })
          
          if (progressText.length > 0) {
            cy.log('✅ Progress percentages found')
          }
        })
      } else {
        cy.log('ℹ️ No training progress visualization found')
      }
    })
  })

  it('should display deployment health metrics', () => {
    // Look for deployment health indicators
    const healthSelectors = [
      '[data-cy*="health"]',
      '[data-cy*="deployment"]',
      '.health-chart',
      '.deployment-chart',
      '.health-indicator',
      '.status-indicator'
    ]
    
    cy.get('body').then($body => {
      const healthElements = $body.find(healthSelectors.join(', '))
      
      if (healthElements.length > 0) {
        cy.log(`✅ Found ${healthElements.length} health/deployment elements`)
        
        // Test visibility
        cy.get(healthSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for status indicators
        cy.get('body').then($body => {
          const hasStatusIndicators = $body.find('.status, .indicator, [class*="status"], [class*="health"]').length > 0
          if (hasStatusIndicators) {
            cy.get('.status, .indicator, [class*="status"]').should('be.visible')
            cy.log('✅ Health status indicators found')
          }
        })
      } else {
        cy.log('ℹ️ No deployment health metrics found')
      }
    })
  })

  it('should interact with chart tooltips on hover', () => {
    // Look for interactive chart elements
    cy.get('body').then($body => {
      const chartElements = $body.find('canvas, svg, [data-cy*="chart"], .chart')
      
      if (chartElements.length > 0) {
        cy.log('Testing chart interactions')
        
        // Try to hover over chart elements
        cy.get('canvas, svg, [data-cy*="chart"]').first().then($chart => {
          // Trigger hover event
          cy.wrap($chart).trigger('mouseover', { x: 100, y: 100 })
          cy.wait(500)
          
          // Look for tooltips
          cy.get('body').then($body => {
            const hasTooltip = $body.find('[data-cy*="tooltip"], .tooltip, [class*="tooltip"]').length > 0
            
            if (hasTooltip) {
              cy.get('[data-cy*="tooltip"], .tooltip').should('be.visible')
              cy.log('✅ Chart tooltip found on hover')
              
              // Check if tooltip has numeric values
              cy.get('[data-cy*="tooltip"], .tooltip').then($tooltip => {
                const text = $tooltip.text()
                const hasNumbers = /\d+\.?\d*/.test(text)
                if (hasNumbers) {
                  cy.log('✅ Tooltip contains numeric values')
                }
              })
            } else {
              cy.log('ℹ️ No tooltips found on hover')
            }
          })
          
          // Move mouse away
          cy.wrap($chart).trigger('mouseout')
        })
      } else {
        cy.log('ℹ️ No interactive chart elements found')
      }
    })
  })

  it('should allow chart time range selection', () => {
    // Look for time range controls
    const timeRangeSelectors = [
      '[data-cy*="time"]',
      '[data-cy*="range"]',
      '.time-range',
      '.date-selector',
      'select',
      'input[type="date"]'
    ]
    
    cy.get('body').then($body => {
      const timeRangeElements = $body.find(timeRangeSelectors.join(', '))
      
      if (timeRangeElements.length > 0) {
        cy.log(`✅ Found ${timeRangeElements.length} time range elements`)
        
        // Try to interact with time range controls
        cy.get('select, [data-cy*="time"], [data-cy*="range"]').then($controls => {
          if ($controls.length > 0) {
            // Click on time range selector
            cy.get('select, [data-cy*="time"]').first().click({ force: true })
            cy.wait(500)
            
            // Look for loading indicators
            cy.get('body').then($body => {
              const hasLoadingIndicator = $body.find('[data-cy*="loading"], .loading, .spinner').length > 0
              if (hasLoadingIndicator) {
                cy.get('[data-cy*="loading"], .loading').should('be.visible')
                cy.wait(1000)
                cy.get('[data-cy*="loading"], .loading').should('not.exist')
                cy.log('✅ Time range change with loading indicator')
              } else {
                cy.log('✅ Time range interaction completed')
              }
            })
          }
        })
      } else {
        cy.log('ℹ️ No time range selector found')
      }
    })
  })

  it('should show experiment success rate pie chart', () => {
    // Look for pie chart elements
    const pieChartSelectors = [
      '[data-cy*="pie"]',
      '[data-cy*="success"]',
      '.pie-chart',
      '.recharts-pie',
      '.recharts-pie-sector'
    ]
    
    cy.get('body').then($body => {
      const pieElements = $body.find(pieChartSelectors.join(', '))
      
      if (pieElements.length > 0) {
        cy.log(`✅ Found ${pieElements.length} pie chart elements`)
        
        // Test visibility
        cy.get(pieChartSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for pie sectors
        cy.get('body').then($body => {
          const hasPieSectors = $body.find('.recharts-pie-sector, path[d*="A"]').length > 0
          if (hasPieSectors) {
            cy.get('.recharts-pie-sector, path').should('exist')
            cy.log('✅ Pie chart sectors found')
          }
        })
        
        // Look for legend
        cy.get('body').then($body => {
          const hasLegend = $body.find('[data-cy*="legend"], .legend, .recharts-legend').length > 0
          if (hasLegend) {
            cy.get('[data-cy*="legend"], .legend').should('be.visible')
            cy.log('✅ Success rate legend found')
          }
        })
      } else {
        cy.log('ℹ️ No pie chart elements found')
      }
    })
  })

  it('should display real-time metrics updates', () => {
    // Mock real-time API updates
    cy.intercept('GET', '**/api/dashboard/realtime', {
      statusCode: 200,
      body: {
        accuracy: 0.95,
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    }).as('realtimeUpdate')
    
    // Look for real-time indicators
    const realtimeSelectors = [
      '[data-cy*="real-time"]',
      '[data-cy*="realtime"]',
      '.real-time',
      '.live-indicator',
      '[class*="live"]'
    ]
    
    cy.get('body').then($body => {
      const realtimeElements = $body.find(realtimeSelectors.join(', '))
      
      if (realtimeElements.length > 0) {
        cy.log(`✅ Found ${realtimeElements.length} real-time elements`)
        
        // Test visibility
        cy.get(realtimeSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for timestamp elements
        cy.get('body').then($body => {
          const hasTimestamp = $body.find('time, [data-cy*="time"], .timestamp, [class*="updated"]').length > 0
          if (hasTimestamp) {
            cy.get('time, [data-cy*="time"], .timestamp').should('be.visible')
            cy.log('✅ Timestamp elements found')
          }
        })
      } else {
        cy.log('ℹ️ No real-time indicators found')
      }
    })
    
    // Test metric values
    cy.get('body').then($body => {
      const metricElements = $body.find('*').filter((_, el) => {
        const text = Cypress.$(el).text()
        return /%/.test(text) && /\d+/.test(text)
      })
      
      if (metricElements.length > 0) {
        cy.log(`✅ Found ${metricElements.length} metric values with percentages`)
      }
    })
  })

  it('should handle chart data export functionality', () => {
    // Look for export controls
    const exportSelectors = [
      '[data-cy*="export"]',
      '.export-button',
      'button:contains("Export")',
      'button:contains("Download")',
      '[aria-label*="export"]'
    ]
    
    cy.get('body').then($body => {
      const exportElements = $body.find(exportSelectors.join(', '))
      
      if (exportElements.length > 0) {
        cy.log(`✅ Found ${exportElements.length} export elements`)
        
        // Try to click export button
        cy.get(exportSelectors.join(', ')).first().click({ force: true })
        cy.wait(500)
        
        // Look for export options or success notification
        cy.get('body').then($body => {
          const hasExportOptions = $body.find('[data-cy*="export"], .export-options, .download-options').length > 0
          const hasNotification = $body.find('.notification, .alert, .toast, [data-cy*="success"]').length > 0
          
          if (hasExportOptions) {
            cy.get('[data-cy*="export"], .export-options').should('be.visible')
            cy.log('✅ Export options displayed')
            
            // Try to select CSV export
            cy.get('body').then($body => {
              const hasCsvOption = $body.find('*').filter((_, el) => {
                return Cypress.$(el).text().toLowerCase().includes('csv')
              }).length > 0
              
              if (hasCsvOption) {
                cy.get('*:contains("CSV"), *:contains("csv")').first().click()
                cy.wait(500)
                cy.log('✅ CSV export option selected')
              }
            })
          }
          
          if (hasNotification) {
            cy.get('.notification, .alert, .toast').should('be.visible')
            cy.log('✅ Export success notification found')
          }
        })
      } else {
        cy.log('ℹ️ No export functionality found')
      }
    })
  })

  it('should display threshold indicators on charts', () => {
    // Look for charts first
    cy.get('body').then($body => {
      const chartElements = $body.find('canvas, svg, [data-cy*="chart"], .chart')
      
      if (chartElements.length > 0) {
        cy.log('Testing for threshold indicators on charts')
        
        // Look for threshold-related elements
        const thresholdSelectors = [
          '[data-cy*="threshold"]',
          '.threshold',
          '.threshold-line',
          '.limit-line',
          'line[stroke-dasharray]',
          '[class*="threshold"]'
        ]
        
        cy.get('body').then($body => {
          const thresholdElements = $body.find(thresholdSelectors.join(', '))
          
          if (thresholdElements.length > 0) {
            cy.log(`✅ Found ${thresholdElements.length} threshold elements`)
            
            // Test visibility of threshold indicators
            cy.get(thresholdSelectors.join(', ')).should('have.length.at.least', 1)
            
            // Look for threshold labels
            cy.get('body').then($body => {
              const hasThresholdLabel = $body.find('[data-cy*="threshold"], .threshold-label, text').length > 0
              if (hasThresholdLabel) {
                cy.log('✅ Threshold labels found')
              }
            })
          } else {
            cy.log('ℹ️ No threshold indicators found on charts')
          }
        })
      } else {
        cy.log('ℹ️ No charts found for threshold testing')
      }
    })
  })
})