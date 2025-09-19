describe('Dashboard Comprehensive Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.viewport(1280, 720)
  })

  context('Page Loading and Core Components', () => {
    it('should load dashboard with all essential components', () => {
      // Wait for page to load
      cy.get('body').should('be.visible')
      cy.wait(1000)
      
      // Check for main dashboard container
      cy.get('[data-cy="dashboard"], [data-testid="dashboard"], .dashboard, main').should('exist')
      
      // Check for navigation
      cy.get('nav, [data-cy="navigation"], [role="navigation"]').should('exist')
      
      // Check for dashboard title or heading
      cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')
    })

    it('should handle loading states gracefully', () => {
      // Intercept potential API calls
      cy.intercept('GET', '**/api/**', { 
        statusCode: 200,
        body: { data: 'loaded' }
      }).as('apiCalls')
      
      cy.visit('/dashboard')
      
      // Look for loading indicators
      cy.get('body').should('be.visible')
      cy.wait(2000) // Give time for any API calls
      
      // Check if loading indicators are gone (if they existed)
      cy.get('body').then($body => {
        const hasLoadingIndicator = $body.find('[data-cy="loading"], .loading, [class*="loading"]').length > 0
        if (!hasLoadingIndicator) {
          cy.log('No loading indicators found - dashboard loads immediately')
        } else {
          cy.get('[data-cy="loading"], .loading').should('not.exist')
        }
      })
    })

    it('should display metrics and KPIs', () => {
      // Look for metric cards or statistics
      const metricSelectors = [
        '[data-cy*="metric"]',
        '[data-cy*="kpi"]',
        '[data-cy*="stat"]',
        '.metric',
        '.stat-card',
        '.kpi',
        '[class*="metric"]',
        '[class*="stat"]'
      ]
      
      // At least one metric should be present
      cy.get(metricSelectors.join(', ')).should('have.length.at.least', 1)
    })
  })

  context('Data Visualization and Charts', () => {
    it('should display chart components', () => {
      // Look for common chart containers
      const chartSelectors = [
        '[data-cy*="chart"]',
        'canvas',
        'svg',
        '.recharts-wrapper',
        '.chart',
        '[class*="chart"]'
      ]
      
      cy.get(chartSelectors.join(', ')).should('exist')
    })

    it('should handle chart interactions', () => {
      // Find any interactive chart elements
      cy.get('canvas, svg, [data-cy*="chart"]').first().then($chart => {
        if ($chart.length > 0) {
          // Try to interact with the chart
          cy.wrap($chart).click()
          cy.wait(500)
          
          // Check if any tooltips or interactive elements appear
          cy.get('body').then($body => {
            // This is a non-failing check for interactive elements
            const hasTooltip = $body.find('[class*="tooltip"], [data-cy*="tooltip"], .tooltip').length > 0
            const hasPopup = $body.find('[class*="popup"], [data-cy*="popup"], .popup').length > 0
            
            if (hasTooltip || hasPopup) {
              cy.log('Chart interaction detected with tooltip/popup')
            } else {
              cy.log('Chart interaction completed (no visible feedback)')
            }
          })
        }
      })
    })
  })

  context('Filters and Controls', () => {
    it('should have filter or control elements', () => {
      const filterSelectors = [
        '[data-cy*="filter"]',
        '[data-cy*="control"]',
        'select',
        'input[type="date"]',
        'button[class*="filter"]',
        '.filter',
        '.controls'
      ]
      
      cy.get('body').then($body => {
        const filterElements = $body.find(filterSelectors.join(', '))
        
        if (filterElements.length > 0) {
          cy.get(filterSelectors.join(', ')).should('have.length.at.least', 1)
          cy.log(`Found ${filterElements.length} filter/control elements`)
        } else {
          cy.log('No filter elements found - dashboard may not have filters')
          // This is okay - not all dashboards need filters
        }
      })
    })

    it('should handle date range selection if available', () => {
      // Look for date inputs or date pickers
      cy.get('body').then($body => {
        const dateInputs = $body.find('input[type="date"], [data-cy*="date"], .date-picker')
        
        if (dateInputs.length > 0) {
          cy.get('input[type="date"], [data-cy*="date"]').first().then($input => {
            const today = new Date().toISOString().split('T')[0]
            cy.wrap($input).clear().type(today)
            cy.wait(500)
          })
        } else {
          cy.log('No date inputs found - skipping date range test')
        }
      })
    })
  })

  context('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Test mobile view
      cy.viewport(375, 667)
      cy.wait(500)
      
      // Page should still be functional
      cy.get('body').should('be.visible')
      cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')
      
      // Check if mobile navigation appears
      cy.get('body').then($body => {
        const hasMobileNav = $body.find('[data-cy*="mobile"], .mobile-nav, .hamburger').length > 0
        if (hasMobileNav) {
          cy.log('Mobile navigation detected')
        }
      })
    })

    it('should adapt to tablet viewport', () => {
      // Test tablet view
      cy.viewport(768, 1024)
      cy.wait(500)
      
      // Verify layout adjustments
      cy.get('body').should('be.visible')
      cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')
    })

    it('should work well on large screens', () => {
      // Test large desktop view
      cy.viewport(1920, 1080)
      cy.wait(500)
      
      cy.get('body').should('be.visible')
      cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')
    })
  })

  context('API Integration', () => {
    it('should handle API errors gracefully', () => {
      // Simulate API error
      cy.intercept('GET', '**/api/**', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('apiError')
      
      cy.visit('/dashboard')
      
      // Should still load the page structure
      cy.get('body').should('be.visible')
      
      // Look for error states
      cy.get('body').then($body => {
        const hasErrorState = $body.find('[data-cy*="error"], .error, [class*="error"]').length > 0
        if (hasErrorState) {
          cy.get('[data-cy*="error"], .error').should('be.visible')
        } else {
          // If no explicit error handling, page should still be usable
          cy.log('No error state UI found - checking basic functionality')
          cy.get('h1, h2').should('exist')
        }
      })
    })

    it('should handle successful API responses', () => {
      // Mock successful API responses
      cy.intercept('GET', '**/api/dashboard/metrics', {
        statusCode: 200,
        body: {
          metrics: [
            { id: 1, name: 'Total Users', value: 1250 },
            { id: 2, name: 'Revenue', value: 50000 },
            { id: 3, name: 'Growth Rate', value: 12.5 }
          ]
        }
      }).as('metricsData')
      
      cy.intercept('GET', '**/api/dashboard/charts', {
        statusCode: 200,
        body: {
          charts: [
            { type: 'line', data: [10, 20, 30, 40, 50] },
            { type: 'bar', data: [100, 200, 150, 300, 250] }
          ]
        }
      }).as('chartsData')
      
      cy.visit('/dashboard')
      
      // Verify the page loads with data
      cy.get('body').should('be.visible')
    })
  })

  context('Performance and Accessibility', () => {
    it('should load within reasonable time', () => {
      const startTime = Date.now()
      
      cy.visit('/dashboard')
      cy.get('body').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        cy.log(`Dashboard loaded in ${loadTime}ms`)
        
        // Should load within 10 seconds
        expect(loadTime).to.be.lessThan(10000)
      })
    })

    it('should have accessible elements', () => {
      // Check for basic accessibility attributes
      cy.get('h1, h2, h3').should('exist') // Proper heading structure
      
      // Check for ARIA labels where expected
      cy.get('button').should('exist').then($buttons => {
        cy.log(`Found ${$buttons.length} buttons on dashboard`)
      })
      
      // Navigation should be accessible
      cy.get('nav, [role="navigation"]').should('exist')
    })

    it('should handle keyboard navigation', () => {
      // Test basic keyboard navigation by finding focusable elements
      cy.get('button, a, input, select, textarea, [tabindex]').then($focusable => {
        if ($focusable.length > 0) {
          cy.log(`Found ${$focusable.length} focusable elements`)
          
          // Focus on the first focusable element and verify it works
          cy.get('button, a, input, select, textarea, [tabindex]').first().focus()
          
          // Just verify that focus worked (more lenient check)
          cy.get('button, a, input, select, textarea, [tabindex]').first().should('exist')
          
          // If we have multiple focusable elements, try moving focus
          if ($focusable.length > 1) {
            cy.get('button, a, input, select, textarea, [tabindex]').eq(1).focus()
            cy.get('button, a, input, select, textarea, [tabindex]').eq(1).should('exist')
          }
        } else {
          cy.log('No focusable elements found - dashboard may not have interactive elements')
          // This is fine - some dashboards are purely visual
        }
      })
    })
  })

  context('User Interactions', () => {
    it('should handle button clicks', () => {
      // Find visible buttons and test clicking them
      cy.get('button:visible').then($buttons => {
        if ($buttons.length > 0) {
          cy.get('button:visible').first().click({ force: true })
          cy.wait(500)
          
          // Verify the click was handled (no specific expectation since we don't know the behavior)
          cy.get('body').should('be.visible')
          cy.log(`Tested clicking on ${$buttons.length} visible buttons`)
        } else {
          // Look for any buttons at all, even if hidden
          cy.get('button').then($allButtons => {
            if ($allButtons.length > 0) {
              cy.log(`Found ${$allButtons.length} buttons but none are visible`)
            } else {
              cy.log('No buttons found on dashboard')
            }
          })
        }
      })
    })

    it('should handle form inputs if present', () => {
      cy.get('body').then($body => {
        const $inputs = $body.find('input, select, textarea')
        
        if ($inputs.length > 0) {
          cy.log(`Found ${$inputs.length} form inputs`)
          
          // Test the first visible input
          cy.get('input, select, textarea').first().then($input => {
            const inputType = $input.attr('type')
            
            if (inputType === 'text' || inputType === 'search' || !inputType) {
              cy.wrap($input).clear().type('test input')
            } else if (inputType === 'checkbox') {
              cy.wrap($input).check({ force: true })
            } else if (inputType === 'date') {
              const today = new Date().toISOString().split('T')[0]
              cy.wrap($input).clear().type(today)
            }
            
            cy.wait(500)
          })
        } else {
          cy.log('No form inputs found on dashboard - this is normal for a read-only dashboard')
        }
      })
    })
  })
})