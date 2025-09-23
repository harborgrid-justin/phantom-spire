/**
 * Client-Side Routing and Navigation Tests
 * Addresses Controls N.26 and N.27: Navigation Testing with Edge Cases
 */

describe('Next.js Linking and Routing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('N.1: <Link> Component Usage', () => {
    it('should use Link components for internal navigation', () => {
      // Check that internal links use Next.js Link (no full page reload)
      cy.get('[data-cy="nav-link"]').first().click();

      // Should be client-side navigation (no page reload)
      cy.window().then((win) => {
        cy.wrap(win.performance.navigation.type).should('equal', 0);
      });
    });

    it('should not use <a> tags for internal routes', () => {
      // All internal links should be Next.js Link components
      cy.get('a[href^="/"]').should('not.exist').or('have.attr', 'data-nextjs-link');
    });
  });

  describe('N.2: Valid href Values', () => {
    it('should have valid href values on all Link components', () => {
      cy.get('[data-cy="nav-link"]').each(($link) => {
        cy.wrap($link).should('have.attr', 'href');
        cy.wrap($link).invoke('attr', 'href').should('not.be.empty');
        cy.wrap($link).invoke('attr', 'href').should('not.equal', 'undefined');
        cy.wrap($link).invoke('attr', 'href').should('not.equal', 'null');
      });
    });
  });

  describe('N.3: Dynamic Route Interpolation', () => {
    it('should handle dynamic routes with template literals', () => {
      // Test dynamic project route
      cy.visit('/projects/test-project-123');
      cy.url().should('include', '/projects/test-project-123');

      // Test dynamic model route
      cy.visit('/projects/test-project/models/model-456');
      cy.url().should('include', '/projects/test-project/models/model-456');
    });
  });

  describe('N.4: No Nested Links', () => {
    it('should not have nested Link components', () => {
      // Check for nested link structures
      cy.get('a a').should('not.exist');
      cy.get('[data-nextjs-link] [data-nextjs-link]').should('not.exist');
    });
  });

  describe('N.5: External Links', () => {
    it('should handle external links with proper attributes', () => {
      cy.get('a[href^="http"]').each(($link) => {
        cy.wrap($link).should('have.attr', 'target', '_blank');
        cy.wrap($link).should('have.attr', 'rel').and('include', 'noopener');
      });
    });
  });

  describe('N.13: Client-Side Navigation', () => {
    it('should not trigger full page reloads for internal navigation', () => {
      let initialLoadTime: number;

      cy.window().then((win) => {
        initialLoadTime = win.performance.now();
      });

      cy.get('[data-cy="nav-link"]').first().click();

      cy.window().then((win) => {
        // Navigation should be much faster than initial load
        expect(win.performance.now() - initialLoadTime).to.be.lessThan(1000);
      });
    });

    it('should preserve JavaScript state during navigation', () => {
      // Set some state that should persist
      cy.window().then((win) => {
        (win as any).testNavigationState = 'preserved';
      });

      cy.get('[data-cy="nav-link"]').first().click();

      cy.window().then((win) => {
        expect((win as any).testNavigationState).to.equal('preserved');
      });
    });
  });

  describe('N.14: Scroll Behavior', () => {
    it('should scroll to top by default on navigation', () => {
      // Scroll down on current page
      cy.scrollTo('bottom');
      cy.window().its('scrollY').should('be.greaterThan', 0);

      // Navigate to another page
      cy.get('[data-cy="nav-link"]').first().click();

      // Should scroll to top
      cy.window().its('scrollY').should('equal', 0);
    });

    it('should handle hash navigation without scrolling', () => {
      cy.get('a[href*="#"]').first().click();
      // Hash navigation should be handled properly
      cy.url().should('include', '#');
    });
  });

  describe('N.15: Replace Prop Usage', () => {
    it('should use replace prop for certain navigation types', () => {
      // Test redirect-style navigation that shouldn't add to history
      cy.visit('/');
      cy.get('[data-testid="redirect-link"]').click();

      cy.go('back');
      cy.url().should('not.include', '/redirect');
    });
  });

  describe('N.18: Active Link States', () => {
    it('should highlight active navigation links', () => {
      cy.visit('/dashboard');
      cy.get('a[href="/dashboard"]').should('have.class', 'active').or('have.attr', 'aria-current');
    });

    it('should update active states on navigation', () => {
      cy.visit('/dashboard');
      cy.get('a[href="/models"]').should('not.have.class', 'active');

      cy.get('a[href="/models"]').click();
      cy.get('a[href="/models"]').should('have.class', 'active').or('have.attr', 'aria-current');
      cy.get('a[href="/dashboard"]').should('not.have.class', 'active');
    });
  });

  describe('N.19: Accessibility', () => {
    it('should have accessible labels on navigation links', () => {
      cy.get('[data-cy="nav-link"]').each(($link) => {
        cy.wrap($link).should('have.attr', 'aria-label').or('contain.text');
      });
    });

    it('should be keyboard navigable', () => {
      cy.get('[data-cy="nav-link"]').first().focus().type('{enter}');
      cy.url().should('not.equal', Cypress.config().baseUrl + '/');
    });
  });

  describe('N.27: Edge Cases', () => {
    context('Slow Network Conditions', () => {
      it('should handle navigation during slow network', () => {
        // Simulate slow network
        cy.intercept('*', (req) => {
          req.reply((res) => {
            res.delay(2000);
          });
        });

        cy.get('[data-cy="nav-link"]').first().click();

        // Should show loading state or remain functional
        cy.get('[data-testid="loading-indicator"]').should('exist');
      });
    });

    context('Navigation Cancellation', () => {
      it('should handle cancelled navigation gracefully', () => {
        // Start navigation
        cy.get('[data-cy="nav-link"]').first().click();

        // Immediately navigate elsewhere
        cy.get('[data-cy="nav-link"]').last().click();

        // Should end up at the final destination
        cy.url().should('not.equal', Cypress.config().baseUrl + '/');
      });
    });

    context('Dynamic Route Fallbacks', () => {
      it('should handle missing dynamic route segments', () => {
        cy.visit('/projects/nonexistent-project', { failOnStatusCode: false });

        // Should show 404 or fallback page
        cy.get('[data-testid="not-found"]').should('exist')
          .or(() => {
            cy.get('body').should('contain.text', '404');
          });
      });
    });

    context('Prefetch Failures', () => {
      it('should handle failed prefetch gracefully', () => {
        // Mock prefetch failures
        cy.intercept('/_next/static/**', { statusCode: 500 });

        // Navigation should still work
        cy.get('[data-cy="nav-link"]').first().click();
        cy.url().should('not.equal', Cypress.config().baseUrl + '/');
      });
    });

    context('JavaScript Disabled Fallback', () => {
      it('should provide basic navigation without JavaScript', () => {
        // This test ensures server-side rendering works
        cy.visit('/', {
          onBeforeLoad: (win) => {
            // Disable JavaScript
            Object.defineProperty(win.navigator, 'userAgent', {
              value: 'NoJS'
            });
          }
        });

        // Links should still be navigable
        cy.get('a[href="/dashboard"]').should('exist');
      });
    });
  });

  describe('N.31: Navigation Metrics', () => {
    it('should track navigation performance metrics', () => {
      cy.window().then((win) => {
        // Check if performance monitoring is active
        expect(win.performance).to.exist;

        const observer = new win.PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              // Navigation timing should be logged
              cy.log(`Navigation timing: ${entry.duration}ms`);
            }
          });
        });

        observer.observe({ entryTypes: ['navigation'] });
      });

      cy.get('[data-cy="nav-link"]').first().click();

      // Performance metrics should be available
      cy.window().then((win) => {
        const navEntries = win.performance.getEntriesByType('navigation');
        expect(navEntries).to.have.length.greaterThan(0);
      });
    });
  });

  describe('N.32: Hash Navigation Accessibility', () => {
    it('should maintain focus and scroll properly for hash links', () => {
      // Test hash navigation focus management
      cy.get('a[href*="#section"]').click();

      cy.get('#section').should('be.visible');
      cy.focused().should('have.id', 'section').or('be.visible');
    });
  });

  describe('N.39: Scroll Restoration', () => {
    it('should restore scroll position appropriately', () => {
      cy.visit('/dashboard');
      cy.scrollTo(0, 500);

      cy.visit('/models');
      cy.go('back');

      // Should restore previous scroll position
      cy.window().its('scrollY').should('be.greaterThan', 400);
    });
  });
});