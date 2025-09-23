/// <reference types="cypress" />

/**
 * Base Page Object Model class providing common functionality for all page objects
 */
export abstract class BasePage {
  protected readonly url: string;
  protected readonly pageLoadSelector: string;

  constructor(url: string, pageLoadSelector: string = '[data-cy="main-content"]') {
    this.url = url;
    this.pageLoadSelector = pageLoadSelector;
  }

  /**
   * Visit the page and wait for it to load
   */
  visit(options?: Partial<Cypress.VisitOptions>): this {
    cy.visit(this.url, options);
    this.waitForPageLoad();
    return this;
  }

  /**
   * Wait for the page to fully load
   */
  waitForPageLoad(timeout: number = 30000): this {
    cy.get(this.pageLoadSelector, { timeout }).should('be.visible');
    cy.get('[data-cy="page-loading"]').should('not.exist');
    return this;
  }

  /**
   * Get the page title element
   */
  getTitle(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('[data-cy="page-title"]');
  }

  /**
   * Verify the page title
   */
  verifyTitle(expectedTitle: string): this {
    this.getTitle().should('contain.text', expectedTitle);
    return this;
  }

  /**
   * Check if the page URL matches expected pattern
   */
  verifyUrl(urlPattern?: string): this {
    if (urlPattern) {
      cy.url().should('match', new RegExp(urlPattern));
    } else {
      cy.url().should('include', this.url);
    }
    return this;
  }

  /**
   * Check page accessibility
   */
  checkAccessibility(context?: string): this {
    cy.checkA11y(context);
    return this;
  }

  /**
   * Check responsive design at different breakpoints
   */
  checkResponsiveDesign(breakpoints: string[] = ['mobile', 'tablet', 'desktop']): this {
    cy.checkResponsiveDesign(breakpoints);
    return this;
  }

  /**
   * Measure and verify page load performance
   */
  verifyPerformance(maxLoadTime: number = 5000): this {
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
      expect(loadTime).to.be.lessThan(maxLoadTime);
    });
    return this;
  }

  /**
   * Wait for any loading indicators to disappear
   */
  waitForLoadingToComplete(): this {
    cy.get('[data-cy="loading-spinner"]').should('not.exist');
    cy.get('[data-cy="skeleton-loader"]').should('not.exist');
    cy.get('[data-cy="page-loading"]').should('not.exist');
    return this;
  }

  /**
   * Handle error states on the page
   */
  checkForErrors(): this {
    cy.get('[data-cy="error-message"]').should('not.exist');
    cy.get('[data-cy="error-boundary"]').should('not.exist');
    return this;
  }

  /**
   * Dismiss any notifications
   */
  dismissNotifications(): this {
    cy.get('[data-cy="notification"]').then(($notifications) => {
      if ($notifications.length > 0) {
        cy.get('[data-cy="notification-dismiss"]').click({ multiple: true });
      }
    });
    return this;
  }

  /**
   * Scroll to top of page
   */
  scrollToTop(): this {
    cy.scrollTo('top');
    return this;
  }

  /**
   * Scroll to bottom of page
   */
  scrollToBottom(): this {
    cy.scrollTo('bottom');
    return this;
  }

  /**
   * Scroll to a specific element
   */
  scrollToElement(selector: string): this {
    cy.get(selector).scrollIntoView();
    return this;
  }

  /**
   * Take screenshot for visual testing
   */
  takeScreenshot(name?: string): this {
    const screenshotName = name || this.constructor.name.toLowerCase();
    cy.screenshot(screenshotName);
    return this;
  }

  /**
   * Wait for network requests to complete
   */
  waitForNetworkIdle(timeout: number = 10000): this {
    cy.intercept('**/*').as('allRequests');
    cy.wait('@allRequests', { timeout, requestTimeout: timeout });
    return this;
  }

  /**
   * Check for console errors
   */
  checkConsoleErrors(): this {
    cy.window().then((win) => {
      expect(win.console.error).to.not.have.been.called;
    });
    return this;
  }

  /**
   * Mock API responses for testing
   */
  mockApiResponse(endpoint: string, response: unknown, alias?: string): this {
    const aliasName = alias || 'apiResponse';
    cy.intercept('GET', endpoint, { body: response }).as(aliasName);
    return this;
  }

  /**
   * Wait for specific API call
   */
  waitForApiCall(alias: string, timeout: number = 10000): this {
    cy.wait(`@${alias}`, { timeout });
    return this;
  }

  /**
   * Verify meta tags for SEO
   */
  verifyMetaTags(tags: Record<string, string>): this {
    Object.entries(tags).forEach(([name, content]) => {
      cy.get(`meta[name="${name}"]`).should('have.attr', 'content', content);
    });
    return this;
  }

  /**
   * Test keyboard navigation
   */
  testKeyboardNavigation(): this {
    cy.get('body').tab();
    cy.focused().should('be.visible');
    return this;
  }

  /**
   * Test focus management
   */
  testFocusManagement(initialFocusSelector?: string): this {
    if (initialFocusSelector) {
      cy.get(initialFocusSelector).should('be.focused');
    }
    return this;
  }

  /**
   * Simulate user interaction patterns
   */
  simulateUserBehavior(actions: Array<() => void>): this {
    actions.forEach((action, index) => {
      cy.then(() => {
        cy.log(`Executing user action ${index + 1}`);
        action();
        cy.wait(500); // Realistic pause between actions
      });
    });
    return this;
  }

  /**
   * Check for proper ARIA labels and roles
   */
  verifyAriaLabels(elements: Array<{ selector: string; expectedLabel?: string; expectedRole?: string }>): this {
    elements.forEach(({ selector, expectedLabel, expectedRole }) => {
      const element = cy.get(selector);
      if (expectedLabel) {
        element.should('have.attr', 'aria-label', expectedLabel);
      }
      if (expectedRole) {
        element.should('have.attr', 'role', expectedRole);
      }
    });
    return this;
  }
}