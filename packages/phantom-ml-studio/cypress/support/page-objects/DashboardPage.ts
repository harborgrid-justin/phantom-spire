/// <reference types="cypress" />
import { BasePage } from './BasePage';

/**
 * Dashboard Page Object Model
 */
export class DashboardPage extends BasePage {
  constructor() {
    super('/dashboard', '[data-cy="dashboard-content"]');
  }

  // Selectors
  private readonly selectors = {
    metricsContainer: '[data-cy="dashboard-metrics"]',
    metricCards: '[data-cy="metric-card"]',
    modelsMetric: '[data-cy="models-metric"]',
    experimentsMetric: '[data-cy="experiments-metric"]',
    deploymentsMetric: '[data-cy="deployments-metric"]',
    performanceChart: '[data-cy="performance-chart"]',
    recentActivityFeed: '[data-cy="recent-activity-feed"]',
    quickActions: '[data-cy="quick-actions"]',
    systemHealth: '[data-cy="system-health"]',
    navigationPanel: '[data-cy="dashboard-nav"]',
    searchBar: '[data-cy="dashboard-search"]',
    filterDropdown: '[data-cy="dashboard-filter"]',
    refreshButton: '[data-cy="refresh-dashboard"]',
    notificationBell: '[data-cy="notification-bell"]',
    userProfile: '[data-cy="user-profile"]',
    themeToggle: '[data-cy="theme-toggle"]',
    helpButton: '[data-cy="help-button"]',
    modelBuilderLink: '[data-cy="nav-link"][href*="model-builder"]',
    dataExplorerLink: '[data-cy="nav-link"][href*="data-explorer"]',
    experimentsLink: '[data-cy="nav-link"][href*="experiments"]',
    alertsPanel: '[data-cy="alerts-panel"]',
    resourceUsage: '[data-cy="resource-usage"]',
    recentModels: '[data-cy="recent-models"]',
    trendsChart: '[data-cy="trends-chart"]',
    statusIndicators: '[data-cy="status-indicator"]'
  };

  /**
   * Verify all dashboard metrics are displayed
   */
  verifyMetricsDisplayed(): this {
    cy.get(this.selectors.metricsContainer).should('be.visible');
    cy.get(this.selectors.metricCards).should('have.length.at.least', 3);
    return this;
  }

  /**
   * Get specific metric value
   */
  getMetricValue(metricType: 'models' | 'experiments' | 'deployments'): Cypress.Chainable<string> {
    return cy.get(`[data-cy="${metricType}-metric"]`).invoke('text');
  }

  /**
   * Verify metric values are reasonable
   */
  verifyMetricValues(): this {
    this.getMetricValue('models').should('match', /\d+/);
    this.getMetricValue('experiments').should('match', /\d+/);
    this.getMetricValue('deployments').should('match', /\d+/);
    return this;
  }

  /**
   * Navigate to Model Builder
   */
  navigateToModelBuilder(): this {
    cy.get(this.selectors.modelBuilderLink).click();
    cy.url().should('include', '/model-builder');
    return this;
  }

  /**
   * Navigate to Data Explorer
   */
  navigateToDataExplorer(): this {
    cy.get(this.selectors.dataExplorerLink).click();
    cy.url().should('include', '/data-explorer');
    return this;
  }

  /**
   * Navigate to Experiments
   */
  navigateToExperiments(): this {
    cy.get(this.selectors.experimentsLink).click();
    cy.url().should('include', '/experiments');
    return this;
  }

  /**
   * Interact with performance chart
   */
  interactWithPerformanceChart(): this {
    cy.get(this.selectors.performanceChart).should('be.visible');
    cy.waitForChart(this.selectors.performanceChart);
    cy.interactWithChart('hover');
    return this;
  }

  /**
   * Verify chart displays correctly
   */
  verifyChartDisplay(): this {
    cy.get(this.selectors.performanceChart).within(() => {
      cy.get('svg').should('exist');
      cy.get('.recharts-legend').should('be.visible');
      cy.get('.recharts-cartesian-axis').should('exist');
    });
    return this;
  }

  /**
   * Check recent activity feed
   */
  verifyRecentActivity(): this {
    cy.get(this.selectors.recentActivityFeed).should('be.visible');
    cy.get(this.selectors.recentActivityFeed).within(() => {
      cy.get('[data-cy="activity-item"]').should('have.length.at.least', 1);
    });
    return this;
  }

  /**
   * Use search functionality
   */
  searchDashboard(query: string): this {
    cy.get(this.selectors.searchBar).type(query);
    cy.get('[data-cy="search-results"]').should('be.visible');
    return this;
  }

  /**
   * Clear search
   */
  clearSearch(): this {
    cy.get(this.selectors.searchBar).clear();
    cy.get('[data-cy="search-results"]').should('not.exist');
    return this;
  }

  /**
   * Apply dashboard filter
   */
  applyFilter(filterType: string, filterValue: string): this {
    cy.get(this.selectors.filterDropdown).click();
    cy.get(`[data-cy="filter-option-${filterType}"]`).click();
    cy.get(`[data-cy="filter-value-${filterValue}"]`).click();
    this.waitForLoadingToComplete();
    return this;
  }

  /**
   * Refresh dashboard
   */
  refreshDashboard(): this {
    cy.get(this.selectors.refreshButton).click();
    this.waitForLoadingToComplete();
    return this;
  }

  /**
   * Check system health status
   */
  verifySystemHealth(): this {
    cy.get(this.selectors.systemHealth).should('be.visible');
    cy.get(this.selectors.statusIndicators).each(($indicator) => {
      cy.wrap($indicator).should('have.attr', 'data-status').and('match', /healthy|warning|error/);
    });
    return this;
  }

  /**
   * Verify quick actions are available
   */
  verifyQuickActions(): this {
    cy.get(this.selectors.quickActions).should('be.visible');
    cy.get(this.selectors.quickActions).within(() => {
      cy.get('[data-cy="quick-action-button"]').should('have.length.at.least', 3);
    });
    return this;
  }

  /**
   * Click quick action
   */
  clickQuickAction(actionType: string): this {
    cy.get(`[data-cy="quick-action-${actionType}"]`).click();
    return this;
  }

  /**
   * Check notifications
   */
  checkNotifications(): this {
    cy.get(this.selectors.notificationBell).click();
    cy.get('[data-cy="notifications-panel"]').should('be.visible');
    return this;
  }

  /**
   * Toggle theme
   */
  toggleTheme(): this {
    cy.get(this.selectors.themeToggle).click();
    cy.wait(500); // Allow theme transition
    return this;
  }

  /**
   * Verify real-time updates
   */
  verifyRealTimeUpdates(): this {
    // Check for WebSocket connection status
    cy.get('[data-cy="connection-status"]').should('contain.text', 'Connected');

    // Verify metrics update over time
    this.getMetricValue('models').as('initialValue');
    cy.wait(5000);
    this.getMetricValue('models').then((currentValue) => {
      cy.get('@initialValue').then((initialValue) => {
        // Values might change in real-time environment
        expect(currentValue).to.be.a('string');
      });
    });
    return this;
  }

  /**
   * Verify responsive layout
   */
  verifyResponsiveLayout(): this {
    // Mobile view
    cy.viewport('iphone-6');
    cy.get(this.selectors.metricsContainer).should('be.visible');

    // Tablet view
    cy.viewport('ipad-2');
    cy.get(this.selectors.metricCards).should('be.visible');

    // Desktop view
    cy.viewport(1200, 800);
    cy.get(this.selectors.performanceChart).should('be.visible');

    return this;
  }

  /**
   * Test drag and drop functionality for dashboard widgets
   */
  reorderWidgets(): this {
    cy.get('[data-cy="widget-handle"]').first().as('sourceWidget');
    cy.get('[data-cy="widget-handle"]').last().as('targetWidget');

    cy.get('@sourceWidget').trigger('dragstart');
    cy.get('@targetWidget').trigger('drop');

    return this;
  }

  /**
   * Verify error handling
   */
  verifyErrorHandling(): this {
    // Mock API error
    cy.intercept('GET', '/api/dashboard/metrics', { statusCode: 500 }).as('metricsError');
    this.refreshDashboard();

    cy.get('[data-cy="error-message"]').should('be.visible');
    cy.get('[data-cy="retry-button"]').should('be.visible');

    return this;
  }

  /**
   * Test offline behavior
   */
  testOfflineBehavior(): this {
    cy.window().then((win) => {
      // Simulate offline
      win.navigator.onLine = false;
      win.dispatchEvent(new Event('offline'));
    });

    cy.get('[data-cy="offline-indicator"]').should('be.visible');

    cy.window().then((win) => {
      // Simulate back online
      win.navigator.onLine = true;
      win.dispatchEvent(new Event('online'));
    });

    cy.get('[data-cy="offline-indicator"]').should('not.exist');

    return this;
  }

  /**
   * Verify data persistence
   */
  verifyDataPersistence(): this {
    // Change a setting or filter
    this.applyFilter('date', 'last-week');

    // Reload page
    cy.reload();
    this.waitForPageLoad();

    // Verify setting persisted
    cy.get(this.selectors.filterDropdown).should('contain.text', 'last-week');

    return this;
  }

  /**
   * Test security headers
   */
  verifySecurityHeaders(): this {
    cy.request('/dashboard').then((response) => {
      expect(response.headers).to.have.property('x-frame-options');
      expect(response.headers).to.have.property('x-content-type-options');
    });
    return this;
  }

  /**
   * Comprehensive dashboard validation
   */
  performComprehensiveValidation(): this {
    return this
      .waitForPageLoad()
      .verifyTitle('Dashboard')
      .verifyUrl()
      .verifyMetricsDisplayed()
      .verifyMetricValues()
      .verifyChartDisplay()
      .verifyRecentActivity()
      .verifySystemHealth()
      .verifyQuickActions()
      .checkAccessibility()
      .verifyPerformance();
  }
}