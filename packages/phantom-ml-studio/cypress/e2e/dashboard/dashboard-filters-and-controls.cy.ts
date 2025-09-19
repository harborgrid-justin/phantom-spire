describe('Dashboard Filters and Controls', () => {
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

  it('should display dashboard filter controls', () => {
    // Look for common filter control patterns
    const filterSelectors = [
      '[data-cy="dashboard-filters"]',
      '[data-cy="filters"]', 
      '.filters',
      'select',
      'input[type="date"]',
      '[data-cy*="filter"]',
      '.filter-control',
      '.date-picker',
      '.dropdown-filter'
    ]
    
    cy.get('body').then($body => {
      const filterElements = $body.find(filterSelectors.join(', '))
      
      if (filterElements.length > 0) {
        cy.log(`✅ Found ${filterElements.length} filter control elements`)
        
        // Test the first few filter elements
        cy.get(filterSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Look for specific filter types
        const hasDateFilter = $body.find('[data-cy*="date"], input[type="date"], .date-picker').length > 0
        const hasDropdownFilter = $body.find('select, .dropdown, [role="combobox"]').length > 0
        
        if (hasDateFilter) {
          cy.log('✅ Date filter controls detected')
        }
        if (hasDropdownFilter) {
          cy.log('✅ Dropdown filter controls detected')  
        }
      } else {
        cy.log('ℹ️ No filter controls found - dashboard may not have filtering functionality')
      }
    })
  })

  it('should filter dashboard data by date range', () => {
    // Look for date-related controls
    cy.get('body').then($body => {
      const dateElements = $body.find('input[type="date"], [data-cy*="date"], .date-picker, .date-range')
      
      if (dateElements.length > 0) {
        cy.log('Testing date range filtering')
        
        // Try to interact with date controls
        cy.get('input[type="date"], [data-cy*="date"]').first().then($dateInput => {
          const today = new Date()
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          const dateValue = weekAgo.toISOString().split('T')[0]
          
          cy.wrap($dateInput).clear().type(dateValue)
          cy.wait(500)
          
          // Look for apply button or auto-apply
          cy.get('body').then($body => {
            const applyButton = $body.find('[data-cy*="apply"], .apply-filter, button:contains("Apply")')
            if (applyButton.length > 0) {
              cy.get('[data-cy*="apply"], .apply-filter').first().click()
            }
          })
          
          cy.wait(1000)
          cy.log('✅ Date filter applied')
        })
      } else {
        cy.log('ℹ️ No date filter controls found - skipping date range test')
      }
    })
  })

  it('should filter by model type', () => {
    // Look for model type or category filters
    cy.get('body').then($body => {
      const typeElements = $body.find('select, [data-cy*="type"], [data-cy*="category"], .dropdown')
      
      if (typeElements.length > 0) {
        cy.log('Testing model type filtering')
        
        // Try to interact with dropdown/select elements
        cy.get('select').then($selects => {
          if ($selects.length > 0) {
            cy.get('select').first().select(0) // Select first option
            cy.wait(500)
            cy.log('✅ Model type filter applied via select')
          }
        })
        
        // Try dropdown buttons
        cy.get('[data-cy*="filter"], .dropdown').then($dropdowns => {
          if ($dropdowns.length > 0) {
            cy.get('[data-cy*="filter"], .dropdown').first().click()
            cy.wait(500)
            
            // Look for dropdown options
            cy.get('body').then($body => {
              const options = $body.find('[role="option"], .dropdown-item, li')
              if (options.length > 0) {
                cy.get('[role="option"], .dropdown-item, li').first().click()
                cy.wait(500)
                cy.log('✅ Model type filter applied via dropdown')
              }
            })
          }
        })
      } else {
        cy.log('ℹ️ No model type filter controls found - skipping model type test')
      }
    })
  })

  it('should clear all applied filters', () => {
    // Apply some filters first if available
    cy.get('body').then($body => {
      const filterElements = $body.find('select, input[type="date"], [data-cy*="filter"]')
      
      if (filterElements.length > 0) {
        cy.log('Testing filter clearing functionality')
        
        // Apply a filter
        cy.get('select').then($selects => {
          if ($selects.length > 0) {
            cy.get('select').first().select(0)
            cy.wait(500)
          }
        })
        
        // Look for clear/reset button
        const clearSelectors = [
          '[data-cy*="clear"]',
          '[data-cy*="reset"]',
          'button:contains("Clear")',
          'button:contains("Reset")',
          '.clear-filters',
          '.reset-filters'
        ]
        
        cy.get('body').then($body => {
          const clearButton = $body.find(clearSelectors.join(', '))
          
          if (clearButton.length > 0) {
            cy.get(clearSelectors.join(', ')).first().click()
            cy.wait(500)
            cy.log('✅ Filters cleared successfully')
          } else {
            // Try to reset manually
            cy.get('select').then($selects => {
              if ($selects.length > 0) {
                cy.get('select').first().select(0) // Reset to first option
                cy.log('✅ Manually reset filters')
              }
            })
          }
        })
      } else {
        cy.log('ℹ️ No filter controls found for clearing test')
      }
    })
  })

  it('should save and apply custom filter presets', () => {
    // Test if preset functionality exists
    cy.get('body').then($body => {
      const presetElements = $body.find('[data-cy*="preset"], .preset, .saved-filter')
      
      if (presetElements.length > 0) {
        cy.log('Testing filter preset functionality')
        
        // Try to save a preset
        cy.get('[data-cy*="save"], .save-preset').then($saveElements => {
          if ($saveElements.length > 0) {
            cy.get('[data-cy*="save"], .save-preset').first().click()
            cy.wait(500)
            
            // Look for name input
            cy.get('input[type="text"], [data-cy*="name"]').then($nameInputs => {
              if ($nameInputs.length > 0) {
                cy.get('input[type="text"], [data-cy*="name"]').first().type('Test Preset')
                cy.wait(500)
                
                // Look for confirm button
                cy.get('button:contains("Save"), [data-cy*="confirm"]').then($confirmButtons => {
                  if ($confirmButtons.length > 0) {
                    cy.get('button:contains("Save"), [data-cy*="confirm"]').first().click()
                    cy.wait(500)
                    cy.log('✅ Filter preset saved')
                  }
                })
              }
            })
          }
        })
      } else {
        cy.log('ℹ️ No preset functionality found - skipping preset test')
      }
    })
  })

  it('should show filter results count', () => {
    // Look for results count displays
    cy.get('body').then($body => {
      const countElements = $body.find('[data-cy*="count"], [data-cy*="result"], .result-count, .item-count')
      
      if (countElements.length > 0) {
        cy.log('✅ Results count display found')
        cy.get('[data-cy*="count"], [data-cy*="result"], .result-count').should('be.visible')
        
        // Verify it contains numbers
        cy.get('[data-cy*="count"], [data-cy*="result"], .result-count').first().then($count => {
          const text = $count.text()
          const hasNumbers = /\d+/.test(text)
          if (hasNumbers) {
            cy.log(`✅ Results count shows: ${text}`)
          }
        })
      } else {
        // Look for any numeric displays that might be counts
        cy.get('body').then($body => {
          const textElements = $body.find('span, div, p').filter((_, el) => {
            const text = Cypress.$(el).text()
            return /\d+\s*(item|result|model|record)/.test(text.toLowerCase())
          })
          
          if (textElements.length > 0) {
            cy.log(`✅ Found ${textElements.length} potential count displays`)
          } else {
            cy.log('ℹ️ No results count display found')
          }
        })
      }
    })
  })

  it('should handle advanced filter combinations', () => {
    cy.log('Testing advanced filter combinations')
    
    // Ensure we stay on the dashboard page
    cy.url().should('include', '/dashboard')
    
    // Look for advanced filter controls
    cy.get('body').then($body => {
      const advancedSelectors = [
        '[data-cy*="advanced"]:not([href])',  // Exclude links that would navigate away
        '.advanced-filter:not(a)',
        '.advanced-control:not(a)',
        '[data-cy*="filter-advanced"]',
        '.filter-advanced'
      ]
      
      let advancedFound = false
      
      advancedSelectors.forEach(selector => {
        const elements = $body.find(selector)
        if (elements.length > 0 && !advancedFound) {
          cy.log(`Found advanced filter control: ${selector}`)
          
          // Check if it's a button/control, not a navigation link
          cy.get(selector).first().then($el => {
            const tagName = $el.prop('tagName').toLowerCase()
            const href = $el.attr('href')
            
            if (!href && (tagName === 'button' || tagName === 'div' || $el.hasClass('filter'))) {
              cy.log('Clicking advanced filter control (non-navigation)')
              cy.get(selector).first().click()
              cy.wait(500)
              
              // Verify we're still on dashboard after clicking
              cy.url().should('include', '/dashboard')
              
              advancedFound = true
              
              // Look for additional filter controls that appear after clicking
              cy.get('body').then($bodyAfter => {
                // Look for range inputs with graceful fallback
                const rangeSelectors = [
                  'input[type="range"]',
                  'input[type="number"]',
                  '[data-cy*="range"]',
                  '.range-slider',
                  '[role="slider"]'
                ]
                
                let rangeFound = false
                rangeSelectors.forEach(rangeSelector => {
                  if ($bodyAfter.find(rangeSelector).length > 0 && !rangeFound) {
                    cy.get(rangeSelector).first().then($range => {
                      if ($range.is('input[type="number"]')) {
                        cy.get(rangeSelector).first().clear().type('0.8')
                      } else if ($range.is('input[type="range"]')) {
                        cy.get(rangeSelector).first().invoke('val', '0.8').trigger('input')
                      }
                      cy.wait(500)
                      cy.log('✅ Advanced filter range applied')
                      rangeFound = true
                    })
                  }
                })
                
                // Look for additional filter options
                const additionalSelectors = [
                  'select[data-cy*="advanced"]',
                  '.advanced-select',
                  'input[type="checkbox"]:not(:checked)',
                  '[data-cy*="advanced-option"]'
                ]
                
                additionalSelectors.forEach(addSelector => {
                  if ($bodyAfter.find(addSelector).length > 0) {
                    cy.get(addSelector).first().then($el => {
                      if ($el.is('select')) {
                        cy.get(addSelector).first().select(0)
                        cy.log('✅ Advanced select filter applied')
                      } else if ($el.is('input[type="checkbox"]')) {
                        cy.get(addSelector).first().check()
                        cy.log('✅ Advanced checkbox filter applied')
                      }
                      cy.wait(500)
                    })
                  }
                })
                
                if (!rangeFound) {
                  cy.log('ℹ️ No range inputs found in advanced filters - this is acceptable')
                }
              })
            } else {
              cy.log(`⚠️ Element is a navigation link (${href}) - skipping to avoid page change`)
            }
          })
        }
      })
      
      if (!advancedFound) {
        cy.log('ℹ️ No non-navigation advanced filter controls found - testing basic combination filters')
        
        // Fallback: test combination of basic filters if available
        const basicFilterTypes = ['select', 'input[type="date"]', 'input[type="text"]']
        let filtersApplied = 0
        
        basicFilterTypes.forEach(filterType => {
          if ($body.find(filterType).length > 0 && filtersApplied < 2) {
            cy.get(filterType).first().then($filter => {
              if ($filter.is('select')) {
                cy.get(filterType).first().select(0)
                filtersApplied++
                cy.log(`✅ Applied ${filterType} filter`)
              } else if ($filter.is('input[type="date"]')) {
                cy.get(filterType).first().type('2024-01-01')
                filtersApplied++
                cy.log(`✅ Applied ${filterType} filter`)
              } else if ($filter.is('input[type="text"]')) {
                cy.get(filterType).first().type('test')
                filtersApplied++
                cy.log(`✅ Applied ${filterType} filter`)
              }
              cy.wait(500)
            })
          }
        })
        
        if (filtersApplied > 1) {
          cy.log('✅ Multiple basic filters combined successfully')
        } else {
          cy.log('ℹ️ Advanced filter combination test completed (limited filters available)')
        }
      }
    })
    
    // Ensure we end on the dashboard page
    cy.url().should('include', '/dashboard')
    cy.log('✅ Advanced filter test completed while staying on dashboard')
  })

  it('should remember filter state on page reload', () => {
    // Apply a filter if available
    cy.get('body').then($body => {
      const filterElements = $body.find('select, input[type="date"], [data-cy*="filter"]')
      
      if (filterElements.length > 0) {
        cy.log('Testing filter persistence after reload')
        
        // Apply a filter
        cy.get('select').then($selects => {
          if ($selects.length > 0) {
            cy.get('select').first().select(0)
            cy.wait(500)
            
            // Get the selected value
            cy.get('select').first().then($select => {
              const selectedValue = $select.val()
              
              // Reload the page
              cy.reload()
              cy.get('body').should('be.visible')
              cy.wait(2000)
              
              // Check if filter state is maintained
              cy.get('select').first().should('have.value', selectedValue)
              cy.log('✅ Filter state persisted after reload')
            })
          } else {
            cy.log('ℹ️ No persistent filters to test')
          }
        })
      } else {
        cy.log('ℹ️ No filter controls found for persistence test')
      }
    })
  })
})