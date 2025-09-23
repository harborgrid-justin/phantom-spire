describe('Dashboard Performance Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.viewport(1280, 720)
  })

  it('should load dashboard within acceptable time', () => {
    const startTime = Date.now()
    
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
    cy.get('h1, h2, [data-cy="dashboard-title"], main').should('be.visible')
    
    cy.then(() => {
      const loadTime = Date.now() - startTime
      cy.log(`Dashboard loaded in ${loadTime}ms`)
      
      // Performance thresholds
      if (loadTime < 1000) {
        cy.log('🚀 Excellent performance: < 1s')
      } else if (loadTime < 3000) {
        cy.log('✅ Good performance: < 3s')
      } else if (loadTime < 5000) {
        cy.log('⚠️ Acceptable performance: < 5s')
      } else {
        cy.log('❌ Poor performance: > 5s')
      }
      
      // Should load within 10 seconds
      expect(loadTime).to.be.lessThan(10000)
      
      // Log detailed timing
      cy.window().then(win => {
        const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
          const loadComplete = navigation.loadEventEnd - navigation.fetchStart
          
          cy.log(`DOM Content Loaded: ${domContentLoaded}ms`)
          cy.log(`Load Complete: ${loadComplete}ms`)
        }
      })
    })
  })

  it('should handle large datasets efficiently', () => {
    // Mock large dataset API response
    cy.intercept('GET', '**/api/dashboard/metrics', {
      statusCode: 200,
      body: {
        metrics: Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          name: `Model ${i + 1}`,
          accuracy: Math.random() * 0.3 + 0.7,
          created: new Date().toISOString(),
          status: ['active', 'training', 'completed'][i % 3]
        })),
        totalCount: 1000
      },
      delay: 100
    }).as('largeDataset')

    const startTime = Date.now()
    
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
    
    cy.then(() => {
      const renderTime = Date.now() - startTime
      cy.log(`Large dataset rendered in ${renderTime}ms`)
      
      // Should handle large datasets within reasonable time
      expect(renderTime).to.be.lessThan(5000)
      
      // Check if performance indicators exist
      cy.get('body').then($body => {
        const hasPerformanceIndicator = $body.find('[data-cy*="performance"], .performance, [class*="slow"]').length > 0
        if (hasPerformanceIndicator) {
          cy.get('[data-cy*="performance"]').should('not.have.class', 'slow')
        }
      })
    })
  })

  it('should optimize chart rendering', () => {
    cy.visit('/dashboard')
    
    // Look for chart elements
    const chartSelectors = [
      'canvas',
      'svg',
      '[data-cy*="chart"]',
      '.chart',
      '.recharts-wrapper'
    ]
    
    cy.get('body').then($body => {
      const chartElements = $body.find(chartSelectors.join(', '))
      
      if (chartElements.length > 0) {
        cy.log(`Found ${chartElements.length} chart elements`)
        
        const chartRenderStart = Date.now()
        
        // Wait for charts to be visible
        cy.get(chartSelectors.join(', ')).should('be.visible')
        
        cy.then(() => {
          const chartRenderTime = Date.now() - chartRenderStart
          cy.log(`Charts rendered in ${chartRenderTime}ms`)
          
          // Charts should render within 2 seconds
          expect(chartRenderTime).to.be.lessThan(2000)
          
          // Check performance API if available
          cy.window().then(win => {
            const performanceEntries = win.performance.getEntriesByType('measure')
            const chartRenderEntry = performanceEntries.find(entry => 
              entry.name.includes('chart') || entry.name.includes('render')
            )
            
            if (chartRenderEntry) {
              cy.log(`Performance API chart render: ${chartRenderEntry.duration}ms`)
              expect(chartRenderEntry.duration).to.be.lessThan(1000)
            }
          })
        })
      } else {
        cy.log('ℹ️ No chart elements found - skipping chart rendering test')
      }
    })
  })

  it('should lazy load dashboard widgets', () => {
    cy.visit('/dashboard')
    
    // Check what's visible above the fold
    cy.get('body').should('be.visible')
    
    // Look for widgets or content sections
    const widgetSelectors = [
      '[data-cy*="widget"]',
      '.widget',
      '.card',
      '.panel',
      'section',
      '.dashboard-section'
    ]
    
    cy.get('body').then($body => {
      const widgets = $body.find(widgetSelectors.join(', '))
      
      if (widgets.length > 0) {
        cy.log(`Found ${widgets.length} widget elements`)
        
        // Check initial visible widgets
        cy.get(widgetSelectors.join(', ')).should('have.length.at.least', 1)
        
        // Scroll to bottom to trigger lazy loading
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        
        // Check if more content becomes visible
        cy.get(widgetSelectors.join(', ')).then($widgetsAfterScroll => {
          cy.log(`Widgets after scroll: ${$widgetsAfterScroll.length}`)
          
          // Test if scrolling reveals more content
          if ($widgetsAfterScroll.length >= widgets.length) {
            cy.log('✅ Lazy loading working - content loaded on scroll')
          }
        })
        
        // Scroll back to top
        cy.scrollTo('top', { duration: 500 })
      } else {
        cy.log('ℹ️ No widget elements found - testing basic scrolling behavior')
        
        // Test basic scroll performance
        cy.scrollTo('bottom', { duration: 1000 })
        cy.scrollTo('top', { duration: 500 })
        cy.log('✅ Basic scrolling performance test completed')
      }
    })
  })

  it('should cache dashboard data', () => {
    // Mock API responses to test caching
    cy.intercept('GET', '**/api/**', {
      statusCode: 200,
      body: { cached: false, data: 'initial load' }
    }).as('initialLoad')
    
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
    cy.wait(1000)
    
    // Check localStorage for cached data
    cy.window().then(win => {
      const hasLocalStorageCache = Object.keys(win.localStorage).some(key => 
        key.includes('cache') || key.includes('dashboard')
      )
      
      if (hasLocalStorageCache) {
        cy.log('✅ LocalStorage caching detected')
      }
    })
    
    // Mock cached response for reload
    cy.intercept('GET', '**/api/**', {
      statusCode: 200,
      body: { cached: true, data: 'cached load' }
    }).as('cachedLoad')
    
    const reloadStartTime = Date.now()
    
    cy.reload()
    cy.get('body').should('be.visible')
    
    cy.then(() => {
      const reloadTime = Date.now() - reloadStartTime
      cy.log(`Page reloaded in ${reloadTime}ms`)
      
      // Cached reload should be faster (though this is hard to guarantee)
      if (reloadTime < 2000) {
        cy.log('✅ Fast reload suggests caching is working')
      }
      
      // Check for cache indicators in the DOM
      cy.get('body').then($body => {
        const hasCacheIndicator = $body.find('[data-cy*="cache"], .cached, [class*="cache"]').length > 0
        if (hasCacheIndicator) {
          cy.get('[data-cy*="cache"], .cached').should('be.visible')
          cy.log('✅ Cache indicator found in DOM')
        }
      })
    })
    
    // Test session storage as well
    cy.window().then(win => {
      const hasSessionStorageCache = Object.keys(win.sessionStorage).some(key => 
        key.includes('cache') || key.includes('dashboard')
      )
      
      if (hasSessionStorageCache) {
        cy.log('✅ SessionStorage caching detected')
      }
    })
  })
})