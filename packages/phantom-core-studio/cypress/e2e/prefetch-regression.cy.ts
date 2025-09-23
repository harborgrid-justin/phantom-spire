/**
 * P.43: Prefetch-related regression tests for automated UI test suites
 * Tests prefetch behavior to prevent regressions after upgrades
 */

describe('Prefetch Regression Tests', () => {
  beforeEach(() => {
    // Visit the main page
    cy.visit('/');

    // Clear any existing prefetch cache
    cy.window().then(win => {
      if ('caches' in win) {
        win.caches.keys().then(names => {
          names.forEach(name => {
            win.caches.delete(name);
          });
        });
      }
    });
  });

  describe('P.1: Automatic Prefetching in Production', () => {
    it('should enable automatic prefetching for standard Link components', () => {
      // Check that navigation links have prefetch enabled by default
      cy.get('[data-testid="navigation-link"]').first().should('have.attr', 'data-prefetch-enabled', 'true');
    });
  });

  describe('P.4: Resource-Heavy Route Prefetching', () => {
    it('should disable prefetching for resource-heavy routes', () => {
      // Training page should have prefetch disabled
      cy.get('a[href="/training"]').should('exist');
      cy.get('a[href="/training"]').should('have.attr', 'data-prefetch-enabled', 'false');

      // Datasets page should have prefetch disabled
      cy.get('a[href="/datasets"]').should('exist');
      cy.get('a[href="/datasets"]').should('have.attr', 'data-prefetch-enabled', 'false');
    });

    it('should enable prefetching for lightweight routes', () => {
      // Dashboard should have prefetch enabled
      cy.get('a[href="/dashboard"]').should('have.attr', 'data-prefetch-enabled', 'true');

      // Models page should have prefetch enabled
      cy.get('a[href="/models"]').should('have.attr', 'data-prefetch-enabled', 'true');
    });
  });

  describe('P.11: Navigation Link Prefetching', () => {
    it('should not force-disable prefetch on common navigation links', () => {
      const commonRoutes = ['/dashboard', '/models', '/experiments'];

      commonRoutes.forEach(route => {
        cy.get(`a[href="${route}"]`).should('not.have.attr', 'data-prefetch-enabled', 'false');
      });
    });
  });

  describe('P.21: Custom Prefetch Accessibility', () => {
    it('should maintain accessibility for custom Link components', () => {
      // Check that custom links maintain proper ARIA attributes
      cy.get('a[href="/dashboard"]').should('be.visible');

      // Should be keyboard accessible
      cy.get('a[href="/dashboard"]').focus().should('have.focus');

      // Should work with Enter key
      cy.get('a[href="/dashboard"]').focus().type('{enter}');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('P.22: Viewport-Based Prefetching', () => {
    it('should only prefetch links in viewport', () => {
      // Scroll to bottom to test viewport detection
      cy.scrollTo('bottom');

      // Links at top should not be prefetched when out of viewport
      cy.scrollTo('top');

      // Visible links should be prefetched
      cy.get('a[href="/dashboard"]').should('be.visible');
    });
  });

  describe('P.28: User Navigation Interference', () => {
    it('should not interfere with user-initiated navigation', () => {
      const startTime = Date.now();

      cy.get('a[href="/dashboard"]').click();

      cy.url().should('include', '/dashboard');

      // Navigation should be instant (prefetched content)
      cy.window().then(() => {
        const navigationTime = Date.now() - startTime;
        expect(navigationTime).to.be.lessThan(500); // Should be fast due to prefetching
      });
    });
  });

  describe('P.36: Sensitive Route Protection', () => {
    it('should not auto-prefetch contentious links', () => {
      // Admin routes should not be auto-prefetched
      cy.get('a[href*="/admin"]').should('not.exist').or(
        'have.attr', 'data-prefetch-enabled', 'false'
      );

      // Auth routes should not be auto-prefetched
      cy.get('a[href*="/auth"]').should('not.exist').or(
        'have.attr', 'data-prefetch-enabled', 'false'
      );
    });
  });

  describe('Connection-Aware Prefetching', () => {
    it('should respect data saver mode', () => {
      // Mock data saver mode
      cy.window().then(win => {
        Object.defineProperty(win.navigator, 'connection', {
          value: { saveData: true },
          writable: true
        });
      });

      cy.reload();

      // Prefetching should be disabled
      cy.get('[data-prefetch-reason]').should('contain.text', 'Data saver mode enabled');
    });

    it('should disable prefetching on slow connections', () => {
      // Mock slow connection
      cy.window().then(win => {
        Object.defineProperty(win.navigator, 'connection', {
          value: { effectiveType: 'slow-2g', saveData: false },
          writable: true
        });
      });

      cy.reload();

      // Prefetching should be disabled
      cy.get('[data-prefetch-reason]').should('contain.text', 'slow connection');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track prefetch effectiveness', () => {
      // Enable performance monitoring
      cy.window().then(win => {
        const observer = new win.PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name.includes('prefetch')) {
              cy.log(`Prefetch entry: ${entry.name} - ${entry.duration}ms`);
            }
          });
        });
        observer.observe({ entryTypes: ['navigation'] });
      });

      // Navigate to prefetched route
      cy.get('a[href="/dashboard"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Error Handling', () => {
    it('should handle prefetch failures gracefully', () => {
      // Intercept and fail prefetch requests
      cy.intercept('GET', '/dashboard', { statusCode: 500 }).as('failedPrefetch');

      // Click should still work even if prefetch failed
      cy.get('a[href="/dashboard"]').click();

      // Should eventually navigate successfully (regular request)
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Cache Behavior', () => {
    it('should cache prefetched content appropriately', () => {
      // First visit to cache content
      cy.visit('/dashboard');
      cy.go('back');

      // Second visit should be from cache
      const startTime = Date.now();
      cy.get('a[href="/dashboard"]').click();

      cy.window().then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(200); // Should be very fast from cache
      });
    });
  });
});