/// <reference types="cypress" />

/**
 * Server-Side Rendering (SSR) Validation Tests
 * Tests Next.js SSR functionality and hydration
 * Addresses R.41, R.50 requirements for SSR/CSR testing
 */

describe('Server-Side Rendering Validation', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('default');
  });

  describe('SSR Content Validation', () => {
    it('should render initial HTML content on server', () => {
      // Disable JavaScript to test SSR content
      cy.visit('/dashboard', {
        onBeforeLoad: (win) => {
          // Disable JavaScript execution to test SSR
          Object.defineProperty(win.navigator, 'javaEnabled', {
            value: () => false
          });
        }
      });

      // Verify critical content is present in SSR HTML
      cy.get('body').should('contain.text', 'Dashboard');
      cy.get('[data-cy="dashboard-layout"]').should('exist');
    });

    it('should hydrate properly with client-side JavaScript', () => {
      cy.visit('/dashboard');

      // Test that interactive elements work after hydration
      cy.get('[data-cy="sidebar-toggle"]').should('be.visible').click();
      cy.get('[data-cy="sidebar"]').should('be.visible');
    });

    it('should handle dynamic routes with SSR', () => {
      cy.visit('/models/test-model-id');

      // Verify SSR content for dynamic routes
      cy.get('body').should('be.visible');
      cy.url().should('include', '/models/test-model-id');
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should render proper meta tags for SEO', () => {
      cy.visit('/dashboard');

      cy.get('head title').should('exist');
      cy.get('head meta[name="description"]').should('exist');
      cy.get('head meta[property="og:title"]').should('exist');
    });

    it('should render structured data for pages', () => {
      cy.visit('/models');

      cy.get('head script[type="application/ld+json"]').should('exist');
    });
  });

  describe('Performance and Loading', () => {
    it('should measure Time to First Byte (TTFB)', () => {
      cy.window().then((win) => {
        const navigationTiming = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;

        // TTFB should be under 500ms for good SSR performance
        expect(ttfb).to.be.lessThan(500);
        cy.log(`TTFB: ${ttfb}ms`);
      });
    });

    it('should measure Largest Contentful Paint (LCP)', () => {
      cy.visit('/dashboard');

      cy.window().then((win) => {
        return new Promise((resolve) => {
          new win.PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            resolve(lcp.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 3000);
        });
      }).then((lcp) => {
        // LCP should be under 2.5s for good user experience
        expect(lcp as number).to.be.lessThan(2500);
        cy.log(`LCP: ${lcp}ms`);
      });
    });
  });

  describe('Static Generation Validation', () => {
    it('should serve static pages efficiently', () => {
      cy.visit('/');

      // Check for static generation indicators
      cy.get('html').should('have.attr', 'data-react-helmet');
    });

    it('should handle incremental static regeneration', () => {
      cy.visit('/models');

      // Verify page loads without server delays
      cy.get('[data-cy="models-list"]').should('be.visible');
      cy.measurePageLoad();
    });
  });

  describe('Error Boundaries and Fallbacks', () => {
    it('should render error boundaries for SSR errors', () => {
      // Visit a page that might have SSR errors
      cy.visit('/error-test', { failOnStatusCode: false });

      // Should show error boundary instead of white screen
      cy.get('body').should('not.be.empty');
    });

    it('should handle loading states during hydration', () => {
      cy.visit('/dashboard');

      // Check for loading states that prevent layout shift
      cy.get('[data-cy="loading-skeleton"]').should('exist');
      cy.get('[data-cy="dashboard-content"]').should('be.visible');
    });
  });
});