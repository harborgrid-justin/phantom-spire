/// <reference types="cypress" />

// Import all Page Object Models
import { BasePage } from './BasePage';
import { DashboardPage } from './DashboardPage';
import { DataExplorerPage } from './DataExplorerPage';
import { ModelBuilderPage } from './ModelBuilderPage';
import { ExperimentsPage } from './ExperimentsPage';
import { DeploymentsPage } from './DeploymentsPage';
import { BiasDetectionPage } from './BiasDetectionPage';

// Export all Page Object Models for easy importing
export { BasePage } from './BasePage';
export { DashboardPage } from './DashboardPage';
export { DataExplorerPage } from './DataExplorerPage';
export { ModelBuilderPage } from './ModelBuilderPage';
export { ExperimentsPage } from './ExperimentsPage';
export { DeploymentsPage } from './DeploymentsPage';
export { BiasDetectionPage } from './BiasDetectionPage';

// Page Object Factory for easy instantiation
export class PageObjectFactory {
  static getDashboardPage(): DashboardPage {
    return new DashboardPage();
  }

  static getDataExplorerPage(): DataExplorerPage {
    return new DataExplorerPage();
  }

  static getModelBuilderPage(): ModelBuilderPage {
    return new ModelBuilderPage();
  }

  static getExperimentsPage(): ExperimentsPage {
    return new ExperimentsPage();
  }

  static getDeploymentsPage(): DeploymentsPage {
    return new DeploymentsPage();
  }

  static getBiasDetectionPage(): BiasDetectionPage {
    return new BiasDetectionPage();
  }

  // Helper method to get any page by name
  static getPage(pageName: string): BasePage {
    const pages: Record<string, () => BasePage> = {
      dashboard: () => new DashboardPage(),
      'data-explorer': () => new DataExplorerPage(),
      'model-builder': () => new ModelBuilderPage(),
      experiments: () => new ExperimentsPage(),
      deployments: () => new DeploymentsPage(),
      'bias-detection-engine': () => new BiasDetectionPage(),
    };

    const pageFactory = pages[pageName];
    if (!pageFactory) {
      throw new Error(`Page '${pageName}' not found in factory`);
    }

    return pageFactory();
  }
}

// Global page objects for convenient access in tests
declare global {
  namespace Cypress {
    interface Chainable {
      getPage(pageName: string): Chainable<BasePage>;
    }
  }
}

// Custom command to get page objects
Cypress.Commands.add('getPage', (pageName: string) => {
  return cy.wrap(PageObjectFactory.getPage(pageName));
});