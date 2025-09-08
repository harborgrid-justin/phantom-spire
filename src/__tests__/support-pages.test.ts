/**
 * Support Pages Test Suite
 * Comprehensive tests for all 49 support-related pages
 */

import { describe, test, expect } from '@jest/globals';
import { supportNavigation } from '../frontend/navigation/supportNavigation';

describe('Support Pages Integration Tests', () => {
  describe('Navigation Configuration Tests', () => {
    test('should have routes for all 49 support pages', () => {
      expect(supportNavigation).toHaveLength(49);
      
      const categories = supportNavigation.reduce((acc, page) => {
        acc[page.category] = (acc[page.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(categories['customer-support']).toBe(12);
      expect(categories['technical-support']).toBe(12);
      expect(categories['help-desk']).toBe(12);
      expect(categories['knowledge-management']).toBe(13);
    });

    test('should have unique IDs for all support pages', () => {
      const ids = supportNavigation.map(page => page.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(supportNavigation.length);
    });

    test('should have unique paths for all support pages', () => {
      const paths = supportNavigation.map(page => page.path);
      const uniquePaths = new Set(paths);
      
      expect(uniquePaths.size).toBe(supportNavigation.length);
    });

    test('should have consistent naming conventions', () => {
      for (const page of supportNavigation) {
        // ID should be kebab-case
        expect(page.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
        
        // Component should be PascalCase
        expect(page.component).toMatch(/^[A-Z][a-zA-Z]*$/);
        
        // Path should start with /support/
        expect(page.path).toMatch(/^\/support\//);
        
        // Title should be proper title case
        expect(page.title).toMatch(/^[A-Z]/);
      }
    });

    test('should validate support page categories', () => {
      const validCategories = ['customer-support', 'technical-support', 'help-desk', 'knowledge-management'];
      
      for (const page of supportNavigation) {
        expect(validCategories).toContain(page.category);
        expect(page.title).toBeTruthy();
        expect(page.description).toBeTruthy();
        expect(page.path).toBeTruthy();
        expect(page.component).toBeTruthy();
        expect(page.icon).toBeTruthy();
      }
    });
  });

  describe('Customer Support Pages', () => {
    const customerSupportPages = supportNavigation.filter(p => p.category === 'customer-support');

    test('should have 12 customer support pages', () => {
      expect(customerSupportPages).toHaveLength(12);
    });

    test('should include customer portal dashboard', () => {
      const portalDashboard = customerSupportPages.find(p => p.id === 'customer-portal-dashboard');
      expect(portalDashboard).toBeDefined();
      expect(portalDashboard?.title).toBe('Customer Portal Dashboard');
      expect(portalDashboard?.featured).toBe(true);
    });

    test('should include ticket submission wizard', () => {
      const ticketWizard = customerSupportPages.find(p => p.id === 'ticket-submission-wizard');
      expect(ticketWizard).toBeDefined();
      expect(ticketWizard?.title).toBe('Ticket Submission Wizard');
      expect(ticketWizard?.featured).toBe(true);
    });

    test('should have required pages for customer support', () => {
      const requiredPages = [
        'customer-portal-dashboard',
        'ticket-submission-wizard',
        'case-status-tracker',
        'customer-communication-center',
        'service-level-agreement-monitor',
        'customer-satisfaction-feedback',
        'escalation-management-system',
        'customer-history-analytics',
        'priority-queue-manager',
        'customer-onboarding-portal',
        'billing-support-center',
        'customer-loyalty-programs'
      ];

      for (const pageId of requiredPages) {
        const page = customerSupportPages.find(p => p.id === pageId);
        expect(page).toBeDefined();
      }
    });
  });

  describe('Technical Support Pages', () => {
    const technicalSupportPages = supportNavigation.filter(p => p.category === 'technical-support');

    test('should have 12 technical support pages', () => {
      expect(technicalSupportPages).toHaveLength(12);
    });

    test('should include technical diagnostics center', () => {
      const diagnosticsCenter = technicalSupportPages.find(p => p.id === 'technical-diagnostics-center');
      expect(diagnosticsCenter).toBeDefined();
      expect(diagnosticsCenter?.title).toBe('Technical Diagnostics Center');
      expect(diagnosticsCenter?.featured).toBe(true);
    });

    test('should include remote support platform', () => {
      const remotePlatform = technicalSupportPages.find(p => p.id === 'remote-support-platform');
      expect(remotePlatform).toBeDefined();
      expect(remotePlatform?.title).toBe('Remote Support Platform');
      expect(remotePlatform?.featured).toBe(true);
    });

    test('should have required pages for technical support', () => {
      const requiredPages = [
        'technical-diagnostics-center',
        'remote-support-platform',
        'system-health-monitor',
        'patch-management-center',
        'technical-documentation-hub',
        'incident-response-toolkit',
        'performance-optimization-suite',
        'security-vulnerability-scanner',
        'backup-recovery-manager',
        'network-troubleshooting-tools',
        'software-compatibility-checker',
        'technical-escalation-board'
      ];

      for (const pageId of requiredPages) {
        const page = technicalSupportPages.find(p => p.id === pageId);
        expect(page).toBeDefined();
      }
    });
  });

  describe('Help Desk Pages', () => {
    const helpDeskPages = supportNavigation.filter(p => p.category === 'help-desk');

    test('should have 12 help desk pages', () => {
      expect(helpDeskPages).toHaveLength(12);
    });

    test('should include help desk dashboard', () => {
      const helpDeskDashboard = helpDeskPages.find(p => p.id === 'help-desk-dashboard');
      expect(helpDeskDashboard).toBeDefined();
      expect(helpDeskDashboard?.title).toBe('Help Desk Dashboard');
      expect(helpDeskDashboard?.featured).toBe(true);
    });

    test('should include ticket management console', () => {
      const ticketConsole = helpDeskPages.find(p => p.id === 'ticket-management-console');
      expect(ticketConsole).toBeDefined();
      expect(ticketConsole?.title).toBe('Ticket Management Console');
      expect(ticketConsole?.featured).toBe(true);
    });

    test('should have required pages for help desk', () => {
      const requiredPages = [
        'help-desk-dashboard',
        'ticket-management-console',
        'agent-workbench',
        'chat-support-interface',
        'call-center-integration',
        'queue-management-system',
        'agent-performance-analytics',
        'first-contact-resolution-tracker',
        'multi-language-support-hub',
        'shift-scheduling-system',
        'call-recording-analytics',
        'help-desk-reporting-suite'
      ];

      for (const pageId of requiredPages) {
        const page = helpDeskPages.find(p => p.id === pageId);
        expect(page).toBeDefined();
      }
    });
  });

  describe('Knowledge Management Pages', () => {
    const knowledgePages = supportNavigation.filter(p => p.category === 'knowledge-management');

    test('should have 13 knowledge management pages', () => {
      expect(knowledgePages).toHaveLength(13);
    });

    test('should include knowledge base portal', () => {
      const knowledgePortal = knowledgePages.find(p => p.id === 'knowledge-base-portal');
      expect(knowledgePortal).toBeDefined();
      expect(knowledgePortal?.title).toBe('Knowledge Base Portal');
      expect(knowledgePortal?.featured).toBe(true);
    });

    test('should include article authoring system', () => {
      const authoringSystem = knowledgePages.find(p => p.id === 'article-authoring-system');
      expect(authoringSystem).toBeDefined();
      expect(authoringSystem?.title).toBe('Article Authoring System');
      expect(authoringSystem?.featured).toBe(true);
    });

    test('should have required pages for knowledge management', () => {
      const requiredPages = [
        'knowledge-base-portal',
        'article-authoring-system',
        'content-approval-workflow',
        'knowledge-analytics-dashboard',
        'expert-collaboration-platform',
        'training-materials-manager',
        'faq-management-system',
        'video-tutorial-platform',
        'knowledge-gap-analyzer',
        'content-versioning-system',
        'search-optimization-engine',
        'community-forums-platform',
        'knowledge-certification-system'
      ];

      for (const pageId of requiredPages) {
        const page = knowledgePages.find(p => p.id === pageId);
        expect(page).toBeDefined();
      }
    });
  });

  describe('Featured Pages', () => {
    test('should have featured pages distributed across categories', () => {
      const featuredPages = supportNavigation.filter(page => page.featured);
      const featuredByCategory = featuredPages.reduce((acc, page) => {
        acc[page.category] = (acc[page.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(featuredPages.length).toBeGreaterThan(0);
      expect(Object.keys(featuredByCategory).length).toBeGreaterThan(1);
    });

    test('should have at least 1 featured page per category', () => {
      const categories = ['customer-support', 'technical-support', 'help-desk', 'knowledge-management'];
      
      for (const category of categories) {
        const featuredInCategory = supportNavigation.filter(p => 
          p.category === category && p.featured
        );
        expect(featuredInCategory.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Component Structure', () => {
    test('should have proper component exports', () => {
      const componentNames = supportNavigation.map(page => page.component);
      
      for (const componentName of componentNames) {
        expect(componentName).toBeTruthy();
        expect(componentName).toMatch(/^[A-Z][a-zA-Z]*$/);
      }
    });

    test('should have consistent path structure', () => {
      for (const page of supportNavigation) {
        expect(page.path).toMatch(new RegExp(`^/support/${page.category}/`));
        expect(page.path).toContain(page.id);
      }
    });
  });
});

describe('Support Dashboard Tests', () => {
  test('should have correct support statistics', () => {
    const stats = {
      totalPages: supportNavigation.length,
      customerSupport: supportNavigation.filter(p => p.category === 'customer-support').length,
      technicalSupport: supportNavigation.filter(p => p.category === 'technical-support').length,
      helpDesk: supportNavigation.filter(p => p.category === 'help-desk').length,
      knowledgeManagement: supportNavigation.filter(p => p.category === 'knowledge-management').length,
      featuredPages: supportNavigation.filter(p => p.featured).length
    };

    expect(stats.totalPages).toBe(49);
    expect(stats.customerSupport).toBe(12);
    expect(stats.technicalSupport).toBe(12);
    expect(stats.helpDesk).toBe(12);
    expect(stats.knowledgeManagement).toBe(13);
    expect(stats.featuredPages).toBeGreaterThan(0);
  });

  test('should validate category configuration', () => {
    const categoryKeys = ['customer-support', 'technical-support', 'help-desk', 'knowledge-management'];
    
    for (const key of categoryKeys) {
      const pagesInCategory = supportNavigation.filter(p => p.category === key);
      expect(pagesInCategory.length).toBeGreaterThan(0);
    }
  });
});

export { supportNavigation };