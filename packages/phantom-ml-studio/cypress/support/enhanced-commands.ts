/// <reference types="cypress" />

// **********************************************************************
// ENHANCED CUSTOM COMMANDS FOR PHANTOM ML STUDIO - COMPREHENSIVE EDITION
// **********************************************************************

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      // ===== NAVIGATION COMMANDS =====
      navigateToPage(pagePath: string): Chainable<Element>;
      navigateViaSidebar(menuItem: string): Chainable<Element>;
      login(credentials?: { username?: string; password?: string }): Chainable<Element>;
      logout(): Chainable<Element>;

      // ===== TEST ENVIRONMENT SETUP =====
      setupTestEnvironment(environment?: string): Chainable<Element>;

      // ===== MATERIAL-UI SPECIFIC COMMANDS =====
      muiClickButton(dataCy: string, options?: { timeout?: number; force?: boolean }): Chainable<Element>;
      muiSelectOption(dataCy: string, option: string | number, searchable?: boolean): Chainable<Element>;
      muiTypeInTextField(dataCy: string, text: string, options?: { clear?: boolean; delay?: number }): Chainable<Element>;
      muiToggleSwitch(dataCy: string, state?: boolean): Chainable<Element>;
      muiOpenDialog(triggerButton: string): Chainable<Element>;
      muiCloseDialog(method?: 'button' | 'escape' | 'backdrop'): Chainable<Element>;
      muiSelectTab(tabLabel: string | number): Chainable<Element>;
      muiExpandAccordion(dataCy: string, expand?: boolean): Chainable<Element>;
      muiSelectAutocomplete(dataCy: string, option: string, createOption?: boolean): Chainable<Element>;
      muiSelectDatePicker(dataCy: string, date: string): Chainable<Element>;
      muiSelectTimePicker(dataCy: string, time: string): Chainable<Element>;
      muiInteractWithSlider(dataCy: string, value: number): Chainable<Element>;
      muiSelectChip(dataCy: string, chipLabel: string): Chainable<Element>;
      muiDeleteChip(dataCy: string, chipLabel: string): Chainable<Element>;
      muiStepperNavigate(direction: 'next' | 'back' | 'step', stepNumber?: number): Chainable<Element>;

      // ===== ENHANCED CHART INTERACTION COMMANDS =====
      waitForChart(chartSelector?: string, timeout?: number): Chainable<Element>;
      waitForRechart(dataCy: string, timeout?: number): Chainable<Element>;
      waitForPlotlyChart(dataCy: string, timeout?: number): Chainable<Element>;
      waitForMuiChart(dataCy: string, timeout?: number): Chainable<Element>;
      verifyChartData(dataCy: string, expectedDataPoints?: number): Chainable<Element>;
      interactWithChart(dataCy: string, action: 'hover' | 'click', coordinates?: { x: number; y: number }): Chainable<Element>;
      captureChartScreenshot(dataCy: string, name: string): Chainable<Element>;
      verifyChartTooltip(expectedContent: string): Chainable<Element>;
      verifyChartLegend(expectedItems: string[]): Chainable<Element>;
      toggleChartSeries(seriesName: string): Chainable<Element>;
      zoomChart(dataCy: string, zoomArea: { x1: number; y1: number; x2: number; y2: number }): Chainable<Element>;
      resetChartZoom(dataCy: string): Chainable<Element>;
      exportChart(dataCy: string, format: 'png' | 'svg' | 'pdf'): Chainable<Element>;

      // ===== ADVANCED FORM VALIDATION COMMANDS =====
      fillForm(formData: Record<string, string | number | boolean>): Chainable<Element>;
      fillMuiForm(formData: Record<string, string | number | boolean | string[] | { type: string; value: unknown; createOption?: boolean }>): Chainable<Element>;
      validateFormField(fieldName: string, expectedValidation: 'valid' | 'invalid', errorMessage?: string): Chainable<Element>;
      validateMuiFormField(fieldName: string, expectedValidation: 'valid' | 'invalid', errorMessage?: string): Chainable<Element>;
      submitForm(formSelector?: string): Chainable<Element>;
      resetForm(formSelector?: string): Chainable<Element>;
      validateFormSubmission(expectedResult: string, timeout?: number): Chainable<Element>;
      testFieldValidation(fieldName: string, testCases: Array<{ value: string; shouldBeValid: boolean; errorMessage?: string }>): Chainable<Element>;

      // ===== FILE UPLOAD/DOWNLOAD COMMANDS =====
      uploadFile(fileSelector: string, filePath: string, mimeType?: string): Chainable<Element>;
      dragAndDropFile(dropZoneSelector: string, filePath: string, fileName?: string): Chainable<Element>;
      downloadFile(downloadTrigger: string, expectedFileName?: string): Chainable<Element>;
      verifyDownload(fileName: string, timeout?: number): Chainable<Element>;
      uploadCSVDataset(filePath: string, datasetName?: string): Chainable<Element>;
      uploadModelFile(filePath: string, modelName?: string): Chainable<Element>;

      // ===== ENHANCED TABLE/DATA GRID COMMANDS =====
      sortTable(columnSelector: string, direction?: 'asc' | 'desc'): Chainable<Element>;
      sortMuiDataGrid(columnName: string, direction?: 'asc' | 'desc'): Chainable<Element>;
      filterTable(filterValue: string, columnIndex?: number): Chainable<Element>;
      filterMuiDataGrid(columnName: string, filterValue: string, filterType?: 'contains' | 'equals' | 'startsWith'): Chainable<Element>;
      paginateTable(page: number): Chainable<Element>;
      selectTableRow(rowIndex: number, multiple?: boolean): Chainable<Element>;
      selectMuiDataGridRow(rowId: string | number, multiple?: boolean): Chainable<Element>;
      verifyTableData(expectedRowCount: number, columnVerifications?: Array<{ column: number; contains: string }>): Chainable<Element>;
      exportTableData(format: 'csv' | 'json' | 'xlsx'): Chainable<Element>;
      searchInTable(searchTerm: string): Chainable<Element>;

      // ===== API & DATA COMMANDS =====
      mockApiResponse(endpoint: string, response: Record<string, unknown>, method?: string, statusCode?: number): Chainable<Element>;
      interceptApiCall(endpoint: string, alias: string, method?: string): Chainable<Element>;
      waitForApiResponse(alias: string, timeout?: number): Chainable<Element>;
      verifyApiCall(alias: string, expectedRequest?: Record<string, unknown>): Chainable<Element>;
      seedTestData(dataType: string, count?: number): Chainable<Element>;
      cleanupTestData(): Chainable<Element>;
      mockMLStudioAPI(): Chainable<Element>;
      mockHuggingFaceAPI(response?: Record<string, unknown>): Chainable<Element>;

      // ===== PERFORMANCE COMMANDS =====
      measurePageLoad(): Chainable<Element>;
      measureApiResponse(apiAlias: string): Chainable<Element>;
      measureChartRender(chartSelector: string): Chainable<Element>;
      measureFormSubmission(formSelector: string): Chainable<Element>;
      verifyPagePerformance(thresholds?: { loadTime?: number; fcp?: number; lcp?: number }): Chainable<Element>;

      // ===== ACCESSIBILITY COMMANDS =====
      checkColorContrast(minRatio?: number): Chainable<Element>;
      checkKeyboardNavigation(startElement?: string): Chainable<Element>;
      checkScreenReaderSupport(): Chainable<Element>;
      verifyAriaLabels(elements: Array<{ selector: string; expectedLabel?: string; expectedRole?: string }>): Chainable<Element>;

      // ===== WAIT & RETRY COMMANDS =====
      waitForElement(selector: string, timeout?: number): Chainable<Element>;
      waitForText(text: string, timeout?: number): Chainable<Element>;
      waitForCondition(conditionFn: () => boolean, timeout?: number, interval?: number): Chainable<Element>;
      retryAction(actionFn: () => void, maxRetries?: number, delay?: number): Chainable<Element>;
      waitForStableElement(selector: string, timeout?: number): Chainable<Element>;
      waitForNetworkIdle(timeout?: number): Chainable<Element>;

      // ===== VISUAL TESTING COMMANDS =====
      matchSnapshot(name: string, options?: { threshold?: number; capture?: string }): Chainable<Element>;
      compareScreenshot(name: string, threshold?: number): Chainable<Element>;
      visuallyCompareElement(selector: string, name: string): Chainable<Element>;
      detectVisualRegression(baseline: string, current: string): Chainable<Element>;

      // ===== ML STUDIO SPECIFIC COMMANDS =====
      createModel(modelConfig: { name?: string; algorithm?: string; dataset?: string; parameters?: Record<string, unknown> }): Chainable<Element>;
      trainModel(modelId: string, trainingConfig?: Record<string, unknown>): Chainable<Element>;
      runExperiment(experimentConfig: { name?: string; type?: string; models?: string[] }): Chainable<Element>;
      deployModel(modelId: string, deploymentConfig?: { environment?: string; instanceType?: string }): Chainable<Element>;
      uploadDataset(filePath: string, datasetName?: string, datasetType?: string): Chainable<Element>;
      validateChartRender(chartType: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap'): Chainable<Element>;
      monitorModelPerformance(modelId: string): Chainable<Element>;
      runBiasDetection(datasetId: string, sensitiveAttributes: string[]): Chainable<Element>;

      // ===== ADVANCED INTERACTION COMMANDS =====
      dragAndDrop(sourceSelector: string, targetSelector: string): Chainable<Element>;
      simulateKeyboardShortcut(shortcut: string): Chainable<Element>;
      simulateMouseGesture(gesture: 'double-click' | 'right-click' | 'long-press', selector: string): Chainable<Element>;
      simulateTouch(selector: string, gesture: 'tap' | 'swipe' | 'pinch'): Chainable<Element>;
      resizeElement(selector: string, dimensions: { width: number; height: number }): Chainable<Element>;

      // ===== ERROR HANDLING & DEBUGGING =====
      handleError(errorType: string, recoveryAction?: () => void): Chainable<Element>;
      debugElement(selector: string): Chainable<Element>;
      logTestStep(step: string, data?: unknown): Chainable<Element>;
      takeDebugScreenshot(name?: string): Chainable<Element>;
      savePageState(name: string): Chainable<Element>;
      restorePageState(name: string): Chainable<Element>;
    }
  }
}

// **********************************************************************
// NAVIGATION COMMANDS
// **********************************************************************

Cypress.Commands.add('setupTestEnvironment', (environment = 'default') => {
  cy.log(`Setting up test environment: ${environment}`);

  // Mock common API endpoints based on environment
  switch (environment) {
    case 'ml-models':
      // Mock ML-specific endpoints
      cy.intercept('GET', '/api/models', { fixture: 'models.json' }).as('getModels');
      cy.intercept('GET', '/api/datasets', { fixture: 'test-data.csv' }).as('getDatasets');
      cy.intercept('GET', '/api/algorithms', { 
        body: { algorithms: ['random-forest', 'neural-network', 'linear-regression', 'svm'] } 
      }).as('getAlgorithms');
      cy.intercept('POST', '/api/models/train', { statusCode: 202, body: { status: 'started' } }).as('trainModel');
      cy.intercept('GET', '/api/models/*/status', { body: { status: 'completed' } }).as('getTrainingStatus');
      cy.intercept('GET', '/api/experiments', { fixture: 'experiments.json' }).as('getExperiments');
      break;

    case 'dashboard':
      // Mock dashboard-specific endpoints
      cy.intercept('GET', '/api/dashboard/metrics', { fixture: 'dashboard-metrics.json' }).as('getDashboardMetrics');
      cy.intercept('GET', '/api/dashboard/charts/**', { fixture: 'api-responses.json' }).as('getChartData');
      break;

    case 'default':
    default:
      // Mock basic endpoints for all tests
      cy.intercept('GET', '/api/health', { body: { status: 'healthy' } }).as('healthCheck');
      cy.intercept('GET', '/api/user/profile', { 
        body: { id: 1, name: 'Test User', email: 'test@example.com' } 
      }).as('getUserProfile');
      break;
  }

  // Setup common test data in localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('cypress_test_mode', 'true');
    win.localStorage.setItem('test_environment', environment);
  });

  // Seed any required test data
  cy.seedTestData('models', 5);
  cy.seedTestData('experiments', 3);
  cy.seedTestData('datasets', 10);

  // Clear any existing notifications or modals
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="notification"]').length) {
      cy.get('[data-cy="notification-dismiss"]').click({ multiple: true });
    }
    if ($body.find('[role="dialog"]').length) {
      cy.get('[role="dialog"] [aria-label="close"]').click({ multiple: true });
    }
  });

  cy.log(`Test environment '${environment}' setup complete`);
});

Cypress.Commands.add('navigateToPage', (pagePath: string) => {
  cy.visit(pagePath);
  cy.url().should('include', pagePath);
  cy.get('body').should('be.visible');
  cy.get('[data-cy="page-loading"]').should('not.exist');
  cy.wait(500); // Allow for any animations
});

Cypress.Commands.add('navigateViaSidebar', (menuItem: string) => {
  cy.get('[data-cy="sidebar-toggle"]').click({ force: true });
  cy.get(`[data-cy="sidebar-menu-${menuItem}"]`).click();
  cy.get('[data-cy="page-loading"]').should('not.exist');
});

Cypress.Commands.add('login', (credentials = {}) => {
  const { username = 'testuser', password = 'testpass' } = credentials;

  // For now, just navigate to dashboard (no auth system)
  cy.visit('/dashboard');
  cy.url().should('include', '/dashboard');

  // If authentication is implemented later, add login logic here
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/login');
});

// **********************************************************************
// MATERIAL-UI SPECIFIC COMMANDS
// **********************************************************************

Cypress.Commands.add('muiClickButton', (dataCy: string, options = {}) => {
  const { timeout = 10000, force = false } = options;
  cy.get(`[data-cy="${dataCy}"]`, { timeout })
    .should('be.visible')
    .and('not.be.disabled')
    .click({ force });
});

Cypress.Commands.add('muiSelectOption', (dataCy: string, option: string | number, searchable = false) => {
  cy.get(`[data-cy="${dataCy}"]`).click();

  if (searchable && typeof option === 'string') {
    cy.get('[data-cy="select-search-input"]').type(option);
  }

  cy.get('[role="listbox"]').should('be.visible');
  cy.contains('[role="option"]', option).click();
  cy.get('[role="listbox"]').should('not.exist');
});

Cypress.Commands.add('muiTypeInTextField', (dataCy: string, text: string, options = {}) => {
  const { clear = true, delay = 0 } = options;
  const input = cy.get(`[data-cy="${dataCy}"] input, [data-cy="${dataCy}"] textarea`);

  if (clear) {
    input.clear();
  }

  if (delay > 0) {
    input.type(text, { delay });
  } else {
    input.type(text);
  }
});

Cypress.Commands.add('muiToggleSwitch', (dataCy: string, state?: boolean) => {
  cy.get(`[data-cy="${dataCy}"]`).within(() => {
    if (state !== undefined) {
      cy.get('input[type="checkbox"]').then(($checkbox) => {
        const isChecked = $checkbox.prop('checked');
        if ((state && !isChecked) || (!state && isChecked)) {
          cy.wrap($checkbox).click();
        }
      });
    } else {
      cy.get('input[type="checkbox"]').click();
    }
  });
});

Cypress.Commands.add('muiOpenDialog', (triggerButton: string) => {
  cy.muiClickButton(triggerButton);
  cy.get('[role="dialog"]').should('be.visible');
  cy.get('[data-cy="dialog-backdrop"]').should('exist');
});

Cypress.Commands.add('muiCloseDialog', (method = 'button') => {
  switch (method) {
    case 'button':
      cy.get('[role="dialog"] [aria-label="close"], [role="dialog"] [data-cy="close-dialog"]')
        .first()
        .click();
      break;
    case 'escape':
      cy.get('body').type('{esc}');
      break;
    case 'backdrop':
      cy.get('[data-cy="dialog-backdrop"]').click({ force: true });
      break;
  }
  cy.get('[role="dialog"]').should('not.exist');
});

Cypress.Commands.add('muiSelectTab', (tabLabel: string | number) => {
  if (typeof tabLabel === 'number') {
    cy.get('[role="tab"]').eq(tabLabel).click();
  } else {
    cy.contains('[role="tab"]', tabLabel).click();
  }

  cy.get('[role="tab"][aria-selected="true"]').should('exist');
});

Cypress.Commands.add('muiExpandAccordion', (dataCy: string, expand = true) => {
  cy.get(`[data-cy="${dataCy}"]`).within(() => {
    cy.get('[aria-expanded]').then(($accordion) => {
      const isExpanded = $accordion.attr('aria-expanded') === 'true';
      if ((expand && !isExpanded) || (!expand && isExpanded)) {
        cy.wrap($accordion).click();
      }
    });
  });
});

Cypress.Commands.add('muiSelectAutocomplete', (dataCy: string, option: string, createOption = false) => {
  cy.get(`[data-cy="${dataCy}"] input`).click().type(option);
  cy.get('[role="listbox"]').should('be.visible');

  if (createOption) {
    cy.get('[role="listbox"]').then(($listbox) => {
      if ($listbox.find(`[role="option"]:contains("${option}")`).length === 0) {
        cy.get('[data-cy="create-option"]').click();
      } else {
        cy.contains('[role="option"]', option).click();
      }
    });
  } else {
    cy.contains('[role="option"]', option).click();
  }
});

Cypress.Commands.add('muiSelectDatePicker', (dataCy: string, date: string) => {
  cy.get(`[data-cy="${dataCy}"] input`).click();
  cy.get('[role="dialog"]').should('be.visible'); // Date picker dialog

  // Handle date selection logic based on MUI DatePicker structure
  const dateObj = new Date(date);
  cy.get(`[data-date="${dateObj.toISOString().split('T')[0]}"]`).click();
  cy.get('[role="dialog"]').should('not.exist');
});

Cypress.Commands.add('muiSelectTimePicker', (dataCy: string, time: string) => {
  cy.get(`[data-cy="${dataCy}"] input`).clear().type(time);
  cy.get(`[data-cy="${dataCy}"] input`).blur();
});

Cypress.Commands.add('muiInteractWithSlider', (dataCy: string, value: number) => {
  cy.get(`[data-cy="${dataCy}"] .MuiSlider-thumb`).then(($thumb) => {
    const slider = $thumb.closest('.MuiSlider-root')[0];
    const min = parseInt(slider.getAttribute('data-min') || '0');
    const max = parseInt(slider.getAttribute('data-max') || '100');
    const percentage = ((value - min) / (max - min)) * 100;

    cy.wrap($thumb).invoke('attr', 'style', `left: ${percentage}%`);
    cy.wrap($thumb).trigger('change');
  });
});

// **********************************************************************
// ENHANCED CHART INTERACTION COMMANDS
// **********************************************************************

Cypress.Commands.add('waitForChart', (chartSelector = '[data-cy="chart"]', timeout = 15000) => {
  cy.get(chartSelector, { timeout }).should('be.visible');
  cy.get(`${chartSelector} svg, ${chartSelector} canvas`).should('exist');
  cy.wait(1500); // Allow time for chart animation and data loading
});

Cypress.Commands.add('waitForRechart', (dataCy: string, timeout = 15000) => {
  cy.get(`[data-cy="${dataCy}"]`, { timeout }).should('be.visible');
  cy.get(`[data-cy="${dataCy}"] .recharts-wrapper`).should('exist');
  cy.get(`[data-cy="${dataCy}"] .recharts-surface`).should('be.visible');
  cy.wait(2000); // Allow for Recharts animation
});

Cypress.Commands.add('waitForPlotlyChart', (dataCy: string, timeout = 15000) => {
  cy.get(`[data-cy="${dataCy}"]`, { timeout }).should('be.visible');
  cy.get(`[data-cy="${dataCy}"] .plotly`).should('exist');
  cy.get(`[data-cy="${dataCy}"] .plotly .main-svg`).should('be.visible');
  cy.wait(2500); // Allow for Plotly rendering
});

Cypress.Commands.add('waitForMuiChart', (dataCy: string, timeout = 15000) => {
  cy.get(`[data-cy="${dataCy}"]`, { timeout }).should('be.visible');
  cy.get(`[data-cy="${dataCy}"] svg`).should('exist');
  cy.wait(1500); // Allow for MUI Charts rendering
});

Cypress.Commands.add('verifyChartData', (dataCy: string, expectedDataPoints?: number) => {
  cy.get(`[data-cy="${dataCy}"]`).should('be.visible');

  if (expectedDataPoints) {
    cy.get(`[data-cy="${dataCy}"]`).within(() => {
      // Check for various chart elements that indicate data points
      cy.get('.recharts-line-dot, .recharts-bar-rectangle, .plotly .point, .MuiChart-element').then(($elements) => {
        expect($elements.length).to.be.at.least(expectedDataPoints);
      });
    });
  }
});

Cypress.Commands.add('interactWithChart', (dataCy: string, action: 'hover' | 'click', coordinates?: { x: number; y: number }) => {
  const chartElement = cy.get(`[data-cy="${dataCy}"]`);

  if (coordinates) {
    if (action === 'hover') {
      chartElement.trigger('mousemove', { clientX: coordinates.x, clientY: coordinates.y });
    } else {
      chartElement.click(coordinates.x, coordinates.y);
    }
  } else {
    // Default interaction with first data point
    chartElement.within(() => {
      const elements = '.recharts-line-dot, .recharts-bar-rectangle, .plotly .point, .MuiChart-element';
      cy.get(elements).first().then(($el) => {
        if (action === 'hover') {
          cy.wrap($el).trigger('mouseover');
        } else {
          cy.wrap($el).click();
        }
      });
    });
  }
});

Cypress.Commands.add('verifyChartTooltip', (expectedContent: string) => {
  cy.get('[data-cy="chart-tooltip"], .recharts-tooltip-wrapper, .plotly-tooltip').should('be.visible');
  cy.get('[data-cy="chart-tooltip"], .recharts-tooltip-wrapper, .plotly-tooltip').should('contain.text', expectedContent);
});

Cypress.Commands.add('verifyChartLegend', (expectedItems: string[]) => {
  cy.get('[data-cy="chart-legend"], .recharts-legend, .plotly .legend').should('be.visible');
  expectedItems.forEach(item => {
    cy.get('[data-cy="chart-legend"], .recharts-legend, .plotly .legend').should('contain.text', item);
  });
});

// **********************************************************************
// ENHANCED FORM VALIDATION COMMANDS
// **********************************************************************

Cypress.Commands.add('fillMuiForm', (formData: Record<string, string | number | boolean | string[] | { type: string; value: unknown; createOption?: boolean }>) => {
  Object.entries(formData).forEach(([field, value]) => {
    if (typeof value === 'boolean') {
      cy.muiToggleSwitch(field, value);
    } else if (Array.isArray(value)) {
      // Handle multi-select
      value.forEach(option => {
        cy.muiSelectOption(field, option);
      });
    } else if (typeof value === 'object' && value !== null && 'type' in value && typeof value.type === 'string') {
      // Handle special field types
      switch (value.type) {
        case 'date':
          cy.muiSelectDatePicker(field, String(value.value));
          break;
        case 'time':
          cy.muiSelectTimePicker(field, String(value.value));
          break;
        case 'slider':
          cy.muiInteractWithSlider(field, Number(value.value));
          break;
        case 'autocomplete':
          cy.muiSelectAutocomplete(field, String(value.value), value.createOption);
          break;
        default:
          cy.muiTypeInTextField(field, String(value.value));
      }
    } else {
      cy.muiTypeInTextField(field, String(value));
    }
  });
});

Cypress.Commands.add('validateMuiFormField', (fieldName: string, expectedValidation: 'valid' | 'invalid', errorMessage?: string) => {
  const field = cy.get(`[data-cy="${fieldName}"]`);

  if (expectedValidation === 'invalid') {
    // Check for MUI error state
    field.should('have.class', 'Mui-error');

    if (errorMessage) {
      cy.get(`[data-cy="${fieldName}-error"], [data-cy="${fieldName}"] ~ .MuiFormHelperText-root.Mui-error`)
        .should('contain.text', errorMessage);
    }
  } else {
    field.should('not.have.class', 'Mui-error').and('not.have.attr', 'aria-invalid', 'true');
  }
});

// **********************************************************************
// FILE UPLOAD/DOWNLOAD COMMANDS
// **********************************************************************

Cypress.Commands.add('uploadFile', (fileSelector: string, filePath: string, mimeType?: string) => {
  cy.log(`Uploading file ${filePath} to ${fileSelector}`)
  cy.get(fileSelector).should('exist')
  
  const selectFileOptions: { force: boolean; mimeType?: string } = { force: true }
  if (mimeType) {
    selectFileOptions.mimeType = mimeType
  }
  
  cy.get(fileSelector).selectFile(filePath, selectFileOptions)
  cy.wait(1000) // Allow time for file processing
  cy.log('File upload completed')
})

Cypress.Commands.add('dragAndDropFile', (dropZoneSelector: string, filePath: string, fileName?: string) => {
  cy.get(dropZoneSelector).should('be.visible')
  
  cy.get(dropZoneSelector).selectFile(filePath, {
    action: 'drag-drop',
    force: true
  })
  
  if (fileName) {
    cy.log(`File ${fileName} dropped successfully`)
  }
  
  cy.wait(1500) // Allow time for drag-drop processing
})

Cypress.Commands.add('downloadFile', (downloadTrigger: string, expectedFileName?: string) => {
  cy.get(downloadTrigger).click()
  
  if (expectedFileName) {
    cy.readFile(`cypress/downloads/${expectedFileName}`, { timeout: 10000 }).should('exist')
  }
})

Cypress.Commands.add('verifyDownload', (fileName: string, timeout = 10000) => {
  cy.readFile(`cypress/downloads/${fileName}`, { timeout }).should('exist')
})

Cypress.Commands.add('uploadCSVDataset', (filePath: string, datasetName?: string) => {
  cy.navigateToPage('/data-explorer')
  cy.muiClickButton('upload-dataset-button')
  
  cy.uploadFile('[data-cy="file-upload"]', filePath, 'text/csv')
  
  if (datasetName) {
    cy.muiTypeInTextField('dataset-name', datasetName)
  }
  
  cy.muiClickButton('save-dataset-button')
  cy.waitForText('Dataset uploaded successfully')
})

Cypress.Commands.add('uploadModelFile', (filePath: string, modelName?: string) => {
  cy.navigateToPage('/model-builder')
  cy.muiClickButton('upload-model-button')
  
  cy.uploadFile('[data-cy="model-file-upload"]', filePath)
  
  if (modelName) {
    cy.muiTypeInTextField('model-name', modelName)
  }
  
  cy.muiClickButton('save-model-button')
  cy.waitForText('Model uploaded successfully')
})

// **********************************************************************
// ML STUDIO SPECIFIC COMMANDS
// **********************************************************************

Cypress.Commands.add('createModel', (modelConfig: { name?: string; algorithm?: string; dataset?: string; parameters?: Record<string, unknown> }) => {
  cy.navigateToPage('/model-builder');
  cy.muiClickButton('create-model-button');

  if (modelConfig.name) {
    cy.muiTypeInTextField('model-name', modelConfig.name);
  }
  if (modelConfig.algorithm) {
    cy.muiSelectOption('algorithm-select', modelConfig.algorithm);
  }
  if (modelConfig.dataset) {
    cy.muiSelectOption('dataset-select', modelConfig.dataset);
  }
  if (modelConfig.parameters) {
    cy.fillMuiForm(modelConfig.parameters as Record<string, string | number | boolean | string[] | { type: string; value: unknown; createOption?: boolean }>);
  }

  cy.muiClickButton('save-model-button');
  cy.waitForText('Model created successfully');
});

Cypress.Commands.add('trainModel', (modelId: string, trainingConfig = {}) => {
  cy.get(`[data-cy="model-${modelId}-train-button"]`).click();

  if (Object.keys(trainingConfig).length > 0) {
    cy.fillMuiForm(trainingConfig as Record<string, string | number | boolean | string[] | { type: string; value: unknown; createOption?: boolean }>);
  }

  cy.muiClickButton('start-training-button');
  cy.waitForText('Training started');
});

Cypress.Commands.add('runExperiment', (experimentConfig: { name?: string; type?: string; models?: string[] }) => {
  cy.navigateToPage('/experiments');
  cy.muiClickButton('create-experiment-button');

  if (experimentConfig.name) {
    cy.muiTypeInTextField('experiment-name', experimentConfig.name);
  }
  if (experimentConfig.type) {
    cy.muiSelectOption('experiment-type-select', experimentConfig.type);
  }
  if (experimentConfig.models && experimentConfig.models.length > 0) {
    experimentConfig.models.forEach((model: string, index: number) => {
      cy.muiSelectOption(`model-select-${index}`, model);
    });
  }

  cy.muiClickButton('run-experiment-button');
  cy.waitForText('Experiment started');
});

Cypress.Commands.add('deployModel', (modelId: string, deploymentConfig = {}) => {
  cy.navigateToPage('/deployments');
  cy.muiClickButton('deploy-model-button');

  cy.muiSelectOption('model-select', modelId);

  if (deploymentConfig.environment) {
    cy.muiSelectOption('environment-select', deploymentConfig.environment);
  }
  if (deploymentConfig.instanceType) {
    cy.muiSelectOption('instance-type-select', deploymentConfig.instanceType);
  }

  cy.muiClickButton('deploy-button');
  cy.waitForText('Model deployed successfully');
});

Cypress.Commands.add('uploadDataset', (filePath: string, datasetName?: string, datasetType = 'csv') => {
  cy.navigateToPage('/data-explorer');
  cy.muiClickButton('upload-dataset-button');

  cy.uploadFile('[data-cy="file-upload"]', filePath);

  if (datasetName) {
    cy.muiTypeInTextField('dataset-name', datasetName);
  }

  cy.muiSelectOption('dataset-type-select', datasetType);
  cy.muiClickButton('save-dataset-button');
  cy.waitForText('Dataset uploaded successfully');
});

Cypress.Commands.add('validateChartRender', (chartType: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap') => {
  const chartSelectors = {
    line: '.recharts-line, .plotly .scatterlayer .trace, .MuiLineChart-line',
    bar: '.recharts-bar, .plotly .barlayer .trace, .MuiBarChart-bar',
    scatter: '.recharts-scatter, .plotly .scatterlayer .trace, .MuiScatterChart-scatter',
    pie: '.recharts-pie, .plotly .pielayer .trace, .MuiPieChart-pie',
    heatmap: '.recharts-heatmap, .plotly .heatmaplayer .trace, .MuiHeatMap-cell'
  };

  cy.get(chartSelectors[chartType]).should('exist').and('be.visible');
});

// **********************************************************************
// PERFORMANCE MEASUREMENT COMMANDS
// **********************************************************************

Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    const fcp = win.performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
    const lcp = win.performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;

    cy.task('performance', {
      type: 'pageLoad',
      duration: loadTime,
      fcp,
      lcp
    });

    expect(loadTime).to.be.lessThan(Cypress.env('performance')?.maxPageLoadTime || 5000);
  });
});

Cypress.Commands.add('measureChartRender', (chartSelector: string) => {
  const startTime = Date.now();
  cy.waitForChart(chartSelector).then(() => {
    const renderTime = Date.now() - startTime;
    cy.task('performance', {
      type: 'chartRender',
      selector: chartSelector,
      duration: renderTime
    });
    expect(renderTime).to.be.lessThan(Cypress.env('performance')?.maxChartRenderTime || 3000);
  });
});

// **********************************************************************
// ACCESSIBILITY COMMANDS
// **********************************************************************
// checkA11y and injectAxe are already implemented in commands.ts

// **********************************************************************
// ENHANCED WAIT COMMANDS
// **********************************************************************

Cypress.Commands.add('waitForElement', (selector: string, timeout = 10000) => {
  cy.get(selector, { timeout }).should('exist').and('be.visible')
})

Cypress.Commands.add('waitForText', (text: string, timeout = 10000) => {
  cy.contains(text, { timeout }).should('be.visible')
})

Cypress.Commands.add('waitForCondition', (conditionFn: () => boolean, timeout = 10000, interval = 100) => {
  const startTime = Date.now();

  const checkCondition = () => {
    if (conditionFn()) {
      return;
    }

    if (Date.now() - startTime > timeout) {
      throw new Error('Condition not met within timeout');
    }

    cy.wait(interval).then(checkCondition);
  };

  checkCondition();
});

Cypress.Commands.add('waitForStableElement', (selector: string, timeout = 10000) => {
  let previousPosition: { x: number; y: number } = { x: 0, y: 0 };
  let stableCount = 0;
  const requiredStableChecks = 3;

  const checkStability = () => {
    cy.get(selector).then(($el) => {
      const currentPosition = $el.offset();

      if (currentPosition &&
          currentPosition.left === previousPosition.x &&
          currentPosition.top === previousPosition.y) {
        stableCount++;
      } else {
        stableCount = 0;
        previousPosition = { x: currentPosition?.left || 0, y: currentPosition?.top || 0 };
      }

      if (stableCount >= requiredStableChecks) {
        return;
      }

      cy.wait(100).then(checkStability);
    });
  };

  cy.get(selector, { timeout }).should('be.visible').then(checkStability);
});

// **********************************************************************
// ERROR HANDLING & DEBUGGING COMMANDS
// **********************************************************************

Cypress.Commands.add('handleError', (errorType: string, recoveryAction?: () => void) => {
  cy.on('fail', (err) => {
    cy.task('log', `Error occurred: ${errorType} - ${err.message}`);
    cy.takeDebugScreenshot(`error-${errorType}-${Date.now()}`);

    if (recoveryAction) {
      try {
        recoveryAction();
      } catch (recoveryError) {
        cy.task('log', `Recovery action failed: ${recoveryError}`);
      }
    }

    throw err;
  });
});

Cypress.Commands.add('logTestStep', (step: string, data?: unknown) => {
  cy.task('log', `Test Step: ${step}${data ? ` - Data: ${JSON.stringify(data)}` : ''}`);
});

Cypress.Commands.add('takeDebugScreenshot', (name?: string) => {
  const screenshotName = name || `debug-${Date.now()}`;
  cy.screenshot(screenshotName, { capture: 'fullPage' });
});
