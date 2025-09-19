/// <reference types="cypress" />

/**
 * Next.js App Router Testing
 * Tests App Router features, layouts, loading states, and error boundaries
 * Addresses R.50 requirement for Next.js App Router testing
 */

describe('Next.js App Router Features', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('default');
  });

  describe('Route Navigation', () => {
    it('should handle client-side navigation between routes', () => {
      cy.visit('/dashboard');

      // Test client-side navigation
      cy.get('[data-cy="nav-models"]').click();
      cy.url().should('include', '/models');
      cy.get('[data-cy="models-page"]').should('be.visible');

      // Navigate back
      cy.get('[data-cy="nav-dashboard"]').click();
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy="dashboard-page"]').should('be.visible');
    });

    it('should handle dynamic routes correctly', () => {
      cy.visit('/models/test-model-123');

      cy.url().should('include', '/models/test-model-123');
      cy.get('[data-cy="model-detail"]').should('be.visible');
    });

    it('should handle nested routes', () => {
      cy.visit('/projects/project-1/models/model-1');

      cy.url().should('include', '/projects/project-1/models/model-1');
      cy.get('[data-cy="nested-model-view"]').should('be.visible');
    });
  });

  describe('Layouts and Templates', () => {
    it('should maintain layout consistency across pages', () => {
      const pages = ['/dashboard', '/models', '/data-explorer', '/experiments'];

      pages.forEach(page => {
        cy.visit(page);

        // Check that root layout elements persist
        cy.get('[data-cy="root-layout"]').should('be.visible');
        cy.get('[data-cy="sidebar"]').should('be.visible');
        cy.get('[data-cy="header"]').should('be.visible');
      });
    });

    it('should handle nested layouts properly', () => {
      cy.visit('/projects/project-1');

      // Should have both root layout and project layout
      cy.get('[data-cy="root-layout"]').should('be.visible');
      cy.get('[data-cy="project-layout"]').should('be.visible');
    });

    it('should handle layout templates for common elements', () => {
      cy.visit('/models');

      // Check for template elements
      cy.get('[data-cy="page-header"]').should('be.visible');
      cy.get('[data-cy="breadcrumbs"]').should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should show loading UI during route transitions', () => {
      cy.visit('/dashboard');

      // Trigger navigation and check for loading state
      cy.get('[data-cy="nav-data-explorer"]').click();

      // Should show loading state briefly
      cy.get('[data-cy="route-loading"]').should('be.visible');
      cy.get('[data-cy="data-explorer-page"]').should('be.visible');
    });

    it('should handle streaming loading states', () => {
      cy.visit('/models');

      // Check for streaming content loading
      cy.get('[data-cy="models-skeleton"]').should('be.visible');
      cy.get('[data-cy="models-list"]').should('be.visible');
    });

    it('should show appropriate loading for slow pages', () => {
      cy.visit('/data-explorer');

      // Data explorer might have longer loading times
      cy.get('[data-cy="page-loading"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-cy="data-explorer-content"]').should('be.visible');
    });
  });

  describe('Error Boundaries', () => {
    it('should handle page-level errors gracefully', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });

      // Should show 404 page instead of crashing
      cy.get('[data-cy="error-404"]').should('be.visible');
      cy.get('body').should('contain.text', '404');
    });

    it('should handle component errors with error boundaries', () => {
      cy.visit('/dashboard');

      // Simulate component error by manipulating DOM/state
      cy.window().then((win) => {
        // Trigger error condition if possible
        win.dispatchEvent(new Event('error'));
      });

      // Should show error boundary instead of white screen
      cy.get('body').should('not.be.empty');
    });

    it('should provide error recovery options', () => {
      cy.visit('/error-test', { failOnStatusCode: false });

      // Should offer recovery options
      cy.get('[data-cy="error-retry"]').should('be.visible');
      cy.get('[data-cy="error-home"]').should('be.visible');
    });
  });

  describe('Route Groups and Organization', () => {
    it('should handle route groups without affecting URL structure', () => {
      cy.visit('/dashboard');

      // Route groups should not appear in URL
      cy.url().should('not.include', '(dashboard)');
      cy.url().should('not.include', '(app)');
    });

    it('should organize related routes properly', () => {
      const mlRoutes = ['/models', '/experiments', '/data-explorer'];

      mlRoutes.forEach(route => {
        cy.visit(route);
        cy.get('[data-cy="ml-layout"]').should('be.visible');
      });
    });
  });

  describe('Parallel Routes', () => {
    it('should handle parallel route rendering', () => {
      cy.visit('/dashboard');

      // Check for parallel route content
      cy.get('[data-cy="main-content"]').should('be.visible');
      cy.get('[data-cy="sidebar-content"]').should('be.visible');
    });

    it('should handle conditional parallel routes', () => {
      cy.visit('/models');

      // Should show different parallel content based on state
      cy.get('[data-cy="models-main"]').should('be.visible');
      cy.get('[data-cy="models-sidebar"]').should('be.visible');
    });
  });

  describe('Intercepting Routes', () => {
    it('should handle modal routes via interception', () => {
      cy.visit('/models');

      // Click item that should open modal
      cy.get('[data-cy="model-quick-view"]').first().click();

      // Should show modal overlay while maintaining URL
      cy.get('[data-cy="modal-overlay"]').should('be.visible');
      cy.url().should('include', '/models/');
    });

    it('should handle direct navigation to intercepted routes', () => {
      cy.visit('/models/test-model-123');

      // Direct navigation should show full page, not modal
      cy.get('[data-cy="modal-overlay"]').should('not.exist');
      cy.get('[data-cy="model-detail-page"]').should('be.visible');
    });
  });

  describe('Route Handlers and API Routes', () => {
    it('should integrate API routes with App Router', () => {
      cy.visit('/dashboard');

      // Test that page can call API routes
      cy.intercept('GET', '/api/dashboard/metrics').as('getMetrics');
      cy.get('[data-cy="refresh-metrics"]').click();
      cy.wait('@getMetrics');
    });

    it('should handle API route errors in components', () => {
      cy.visit('/models');

      // Mock API error
      cy.intercept('GET', '/api/models', { statusCode: 500 }).as('getModelsError');
      cy.get('[data-cy="refresh-models"]').click();
      cy.wait('@getModelsError');

      // Should show error state in component
      cy.get('[data-cy="models-error"]').should('be.visible');
    });
  });

  describe('Metadata and SEO', () => {
    it('should generate proper metadata for each route', () => {
      const routes = [
        { path: '/dashboard', title: 'Dashboard' },
        { path: '/models', title: 'Models' },
        { path: '/data-explorer', title: 'Data Explorer' }
      ];

      routes.forEach(route => {
        cy.visit(route.path);

        cy.get('head title').should('contain', route.title);
        cy.get('head meta[name="description"]').should('exist');
      });
    });

    it('should handle dynamic metadata for dynamic routes', () => {
      cy.visit('/models/test-model-123');

      cy.get('head title').should('contain', 'test-model-123');
      cy.get('head meta[property="og:title"]').should('exist');
    });
  });
});