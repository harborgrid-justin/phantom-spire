/// <reference types="cypress" />

/**
 * UX Test Suite: Navigation & Layout
 * Core navigation functionality and responsive layout testing
 */

describe('UX: Navigation & Layout', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('default');
    cy.visit('/');
  });

  describe('Primary Navigation Flow', () => {
    it('should navigate through all primary sections via sidebar', () => {
      // Test Core section navigation
      cy.get('[data-cy="nav-section-core"]').should('be.visible');
      cy.navigateViaSidebar('Dashboard');
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy="nav-link-dashboard"]').should('have.class', 'active');

      cy.navigateViaSidebar('Data Explorer');
      cy.url().should('include', '/dataExplorer');
      cy.get('[data-cy="nav-link-data-explorer"]').should('have.class', 'active');

      cy.navigateViaSidebar('Model Builder');
      cy.url().should('include', '/modelBuilder');

      // Test Advanced section
      cy.get('[data-cy="nav-section-advanced"]').should('be.visible');
      cy.navigateViaSidebar('AutoML Pipeline');
      cy.url().should('include', '/automlPipeline');

      cy.navigateViaSidebar('Bias Detection Engine');
      cy.url().should('include', '/biasDetection');

      // Test Security section
      cy.get('[data-cy="nav-section-security"]').should('be.visible');
      cy.navigateViaSidebar('Threat Intelligence');
      cy.url().should('include', '/threat-intelligence-marketplace');

      // Test System section
      cy.get('[data-cy="nav-section-system"]').should('be.visible');
      cy.navigateViaSidebar('Settings');
      cy.url().should('include', '/settings');

      // Verify active state highlighting
      cy.get('[data-cy="nav-link-settings"]').should('have.class', 'active');
    });

    it('should handle direct URL access and browser navigation', () => {
      // Test direct access to nested routes
      cy.visit('/biasDetection');
      cy.get('[data-cy="nav-link-bias-detection-engine"]').should('have.class', 'active');
      cy.get('h1').should('contain', 'Bias Detection Engine');

      // Test browser back button
      cy.visit('/modelBuilder');
      cy.go('back');
      cy.url().should('include', '/biasDetection');

      // Test browser forward button
      cy.go('forward');
      cy.url().should('include', '/modelBuilder');

      // Test URL state persistence
      cy.reload();
      cy.url().should('include', '/modelBuilder');
      cy.get('[data-cy="nav-link-model-builder"]').should('have.class', 'active');
    });

    it('should provide optimal navigation across device sizes', () => {
      // Desktop: Full sidebar visible
      cy.viewport(1280, 720);
      cy.get('[data-cy="nav-sidebar"]').should('be.visible');
      cy.get('[data-cy="nav-mobile-toggle"]').should('not.be.visible');

      // Tablet: Adaptive navigation
      cy.viewport(768, 1024);
      cy.get('[data-cy="nav-sidebar"]').should('be.visible');

      // Mobile: Collapsible sidebar with overlay
      cy.viewport(375, 667);
      cy.get('[data-cy="nav-sidebar"]').should('not.be.visible');
      cy.get('[data-cy="nav-mobile-toggle"]').should('be.visible');

      // Open mobile menu
      cy.get('[data-cy="nav-mobile-toggle"]').click();
      cy.get('[data-cy="nav-sidebar"]').should('be.visible');
      cy.get('[data-cy="nav-sidebar-backdrop"]').should('be.visible');

      // Close by clicking backdrop
      cy.get('[data-cy="nav-sidebar-backdrop"]').click();
      cy.get('[data-cy="nav-sidebar"]').should('not.be.visible');

      // Test menu item navigation on mobile
      cy.get('[data-cy="nav-mobile-toggle"]').click();
      cy.navigateViaSidebar('Dashboard');
      cy.get('[data-cy="nav-sidebar"]').should('not.be.visible'); // Should auto-close
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should display accurate breadcrumbs and enable navigation', () => {
      cy.visit('/biasDetection');

      // Check breadcrumb structure
      cy.get('[data-cy="breadcrumb-container"]').should('be.visible');
      cy.get('[data-cy="breadcrumb-home"]').should('contain', 'Home');
      cy.get('[data-cy="breadcrumb-current"]').should('contain', 'Bias Detection');

      // Navigate via breadcrumb
      cy.get('[data-cy="breadcrumb-home"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Test nested breadcrumbs
      cy.visit('/models/123');
      cy.get('[data-cy="breadcrumb-models"]').should('contain', 'Models');
      cy.get('[data-cy="breadcrumb-current"]').should('contain', 'Model Details');
    });
  });

  describe('Top Bar Functionality', () => {
    it('should display user profile and notifications correctly', () => {
      cy.get('[data-cy="topbar-container"]').should('be.visible');

      // Test notifications
      cy.get('[data-cy="notifications-button"]').should('be.visible');
      cy.get('[data-cy="notifications-button"]').click();
      cy.get('[data-cy="notifications-dropdown"]').should('be.visible');
      cy.get('[data-cy="notification-item"]').should('have.length.at.least', 1);

      // Test user profile dropdown
      cy.get('[data-cy="user-profile-button"]').should('be.visible');
      cy.get('[data-cy="user-profile-button"]').click();
      cy.get('[data-cy="user-profile-dropdown"]').should('be.visible');
      cy.get('[data-cy="profile-menu-settings"]').should('contain', 'Settings');
      cy.get('[data-cy="profile-menu-logout"]').should('contain', 'Logout');

      // Close dropdown by clicking outside
      cy.get('body').click(0, 0);
      cy.get('[data-cy="user-profile-dropdown"]').should('not.exist');
    });
  });

  describe('Layout Responsiveness', () => {
    it('should adapt layout components across screen sizes', () => {
      const testSizes = [
        { width: 320, height: 568, name: 'Mobile Small' },
        { width: 375, height: 667, name: 'Mobile Medium' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Tablet Landscape' },
        { width: 1280, height: 720, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' }
      ];

      testSizes.forEach(size => {
        cy.viewport(size.width, size.height);
        cy.log(`Testing ${size.name} (${size.width}x${size.height})`);

        // Verify layout doesn't break
        cy.get('[data-cy="main-layout"]').should('be.visible');
        cy.get('[data-cy="topbar-container"]').should('be.visible');

        if (size.width >= 768) {
          cy.get('[data-cy="nav-sidebar"]').should('be.visible');
        } else {
          cy.get('[data-cy="nav-mobile-toggle"]').should('be.visible');
        }

        // Check that content area is accessible
        cy.get('[data-cy="main-content"]').should('be.visible');
        cy.get('[data-cy="main-content"]').should('not.have.css', 'overflow-x', 'visible');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support complete keyboard navigation', () => {
      // Test tab navigation through sidebar
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'nav-link-dashboard');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'nav-link-data-explorer');

      // Test Enter key navigation
      cy.focused().type('{enter}');
      cy.url().should('include', '/dataExplorer');

      // Test Escape key for mobile menu
      cy.viewport(375, 667);
      cy.get('[data-cy="nav-mobile-toggle"]').click();
      cy.get('body').type('{esc}');
      cy.get('[data-cy="nav-sidebar"]').should('not.be.visible');
    });
  });

  describe('Loading States', () => {
    it('should show appropriate loading states during navigation', () => {
      // Intercept route with delay to test loading state
      cy.intercept('GET', '/api/dashboard/**', { delay: 1000 }).as('slowDashboard');

      cy.navigateViaSidebar('Dashboard');
      cy.get('[data-cy="page-loading-spinner"]').should('be.visible');

      cy.wait('@slowDashboard');
      cy.get('[data-cy="page-loading-spinner"]').should('not.exist');
      cy.get('[data-cy="dashboard-content"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', () => {
      // Test 404 handling
      cy.visit('/non-existent-page', { failOnStatusCode: false });
      cy.get('[data-cy="error-404"]').should('be.visible');
      cy.get('[data-cy="error-go-home"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Test network error handling
      cy.intercept('GET', '/api/models', { statusCode: 500 }).as('serverError');
      cy.visit('/models');
      cy.get('[data-cy="error-network"]').should('be.visible');
      cy.get('[data-cy="error-retry"]').should('be.visible');
    });
  });
});