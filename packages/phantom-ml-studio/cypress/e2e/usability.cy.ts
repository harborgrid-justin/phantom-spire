/// <reference types="cypress" />

describe('Usability Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Navigation', () => {
    it('should navigate to the Dashboard page', () => {
      cy.get('a[href="/dashboard"]').click();
      cy.url().should('include', '/dashboard');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should navigate to the Data Explorer page', () => {
      cy.get('a[href="/data-explorer"]').click();
      cy.url().should('include', '/data-explorer');
      cy.get('h1').should('contain', 'Data Explorer');
    });

    it('should navigate to the Model Builder page', () => {
      cy.get('a[href="/model-builder"]').click();
      cy.url().should('include', '/model-builder');
      cy.get('h1').should('contain', 'Model Builder');
    });

    it('should navigate to the Experiments page', () => {
      cy.get('a[href="/experiments"]').click();
      cy.url().should('include', '/experiments');
      cy.get('h1').should('contain', 'Experiments');
    });

    it('should navigate to the Deployments page', () => {
      cy.get('a[href="/deployments"]').click();
      cy.url().should('include', '/deployments');
      cy.get('h1').should('contain', 'Deployments');
    });
  });

  context('Data Explorer', () => {
    beforeEach(() => {
      cy.visit('/data-explorer');
    });

    it('should upload a dataset', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/example.json', { force: true });
      cy.get('.dataset-name').should('contain', 'example.json');
    });

    it('should display a data preview', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/example.json', { force: true });
      cy.get('.data-preview').should('be.visible');
    });

    it('should select a feature for visualization', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/example.json', { force: true });
      cy.get('.feature-list').contains('feature_1').click();
      cy.get('.visualization').should('be.visible');
    });

    it('should apply a data transformation', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/example.json', { force: true });
      cy.get('.transformation-select').select('normalize');
      cy.get('.apply-transformation').click();
      cy.get('.data-preview').should('contain', 'normalized_feature');
    });

    it('should save a processed dataset', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/example.json', { force: true });
      cy.get('.save-dataset').click();
      cy.get('.notification').should('contain', 'Dataset saved successfully');
    });
  });

  context('Model Builder', () => {
    beforeEach(() => {
      cy.visit('/model-builder');
    });

    it('should select a model type', () => {
      cy.get('.model-type-select').select('classification');
      cy.get('.model-type-select').should('have.value', 'classification');
    });

    it('should configure model parameters', () => {
      cy.get('.model-type-select').select('classification');
      cy.get('.parameter-input[name="learning_rate"]').type('0.01');
      cy.get('.parameter-input[name="learning_rate"]').should('have.value', '0.01');
    });

    it('should train a model', () => {
      cy.get('.model-type-select').select('classification');
      cy.get('.train-model').click();
      cy.get('.training-status').should('contain', 'Training in progress');
      cy.get('.training-status').should('contain', 'Training complete', { timeout: 10000 });
    });

    it('should display model evaluation metrics', () => {
      cy.get('.model-type-select').select('classification');
      cy.get('.train-model').click();
      cy.get('.evaluation-metrics').should('be.visible');
    });

    it('should save a trained model', () => {
      cy.get('.model-type-select').select('classification');
      cy.get('.train-model').click();
      cy.get('.save-model').click();
      cy.get('.notification').should('contain', 'Model saved successfully');
    });
  });

  context('Experiments', () => {
    beforeEach(() => {
      cy.visit('/experiments');
    });

    it('should create a new experiment', () => {
      cy.get('.create-experiment').click();
      cy.get('.experiment-name').type('My New Experiment');
      cy.get('.save-experiment').click();
      cy.get('.experiment-list').should('contain', 'My New Experiment');
    });

    it('should log a parameter to an experiment', () => {
      cy.get('.experiment-list').contains('My New Experiment').click();
      cy.get('.log-parameter').click();
      cy.get('.parameter-name').type('learning_rate');
      cy.get('.parameter-value').type('0.01');
      cy.get('.save-parameter').click();
      cy.get('.parameter-list').should('contain', 'learning_rate');
    });

    it('should log a metric to an experiment', () => {
      cy.get('.experiment-list').contains('My New Experiment').click();
      cy.get('.log-metric').click();
      cy.get('.metric-name').type('accuracy');
      cy.get('.metric-value').type('0.95');
      cy.get('.save-metric').click();
      cy.get('.metric-list').should('contain', 'accuracy');
    });

    it('should compare experiments', () => {
      cy.get('.experiment-list').contains('Experiment 1').find('input[type="checkbox"]').check();
      cy.get('.experiment-list').contains('Experiment 2').find('input[type="checkbox"]').check();
      cy.get('.compare-experiments').click();
      cy.get('.comparison-view').should('be.visible');
    });

    it('should delete an experiment', () => {
      cy.get('.experiment-list').contains('My New Experiment').find('.delete-experiment').click();
      cy.get('.experiment-list').should('not.contain', 'My New Experiment');
    });
  });

  context('Deployments', () => {
    beforeEach(() => {
      cy.visit('/deployments');
    });

    it('should deploy a model', () => {
      cy.get('.deploy-model').click();
      cy.get('.model-select').select('My Trained Model');
      cy.get('.deployment-name').type('My New Deployment');
      cy.get('.create-deployment').click();
      cy.get('.deployment-list').should('contain', 'My New Deployment');
    });

    it('should view deployment details', () => {
      cy.get('.deployment-list').contains('My New Deployment').click();
      cy.get('.deployment-details').should('be.visible');
    });

    it('should scale a deployment', () => {
      cy.get('.deployment-list').contains('My New Deployment').click();
      cy.get('.scale-deployment').click();
      cy.get('.instance-count').type('3');
      cy.get('.save-scaling').click();
      cy.get('.deployment-details').should('contain', '3 instances');
    });

    it('should view deployment logs', () => {
      cy.get('.deployment-list').contains('My New Deployment').click();
      cy.get('.view-logs').click();
      cy.get('.logs-view').should('be.visible');
    });

    it('should delete a deployment', () => {
      cy.get('.deployment-list').contains('My New Deployment').find('.delete-deployment').click();
      cy.get('.deployment-list').should('not.contain', 'My New Deployment');
    });
  });

  context('Settings', () => {
    beforeEach(() => {
      cy.visit('/settings');
    });

    it('should update user profile', () => {
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john.doe@example.com');
      cy.get('.save-profile').click();
      cy.get('.notification').should('contain', 'Profile updated successfully');
    });

    it('should change password', () => {
      cy.get('input[name="current_password"]').type('password123');
      cy.get('input[name="new_password"]').type('newpassword456');
      cy.get('input[name="confirm_password"]').type('newpassword456');
      cy.get('.change-password').click();
      cy.get('.notification').should('contain', 'Password changed successfully');
    });

    it('should update notification settings', () => {
      cy.get('input[name="email_notifications"]').check();
      cy.get('.save-notifications').click();
      cy.get('.notification').should('contain', 'Notification settings updated');
    });

    it('should generate an API key', () => {
      cy.get('.generate-api-key').click();
      cy.get('.api-key').should('be.visible');
    });
  });
});
