/// <reference types="cypress" />

// **********************************************************************
// ENHANCED CUSTOM COMMANDS FOR PHANTOM ML STUDIO - COMPREHENSIVE EDITION
// **********************************************************************

declare global {
  namespace Cypress {
    interface Chainable {
      // ===== NAVIGATION COMMANDS =====
      navigateToPage(pagePath: string): Chainable<void>;
      navigateViaSidebar(menuItem: string): Chainable<void>;
      login(credentials?: { username?: string; password?: string }): Chainable<void>;
      logout(): Chainable<void>;

      // ===== MATERIAL-UI SPECIFIC COMMANDS =====
      muiClickButton(dataCy: string, options?: { timeout?: number; force?: boolean }): Chainable<void>;
      muiSelectOption(dataCy: string, option: string | number, searchable?: boolean): Chainable<void>;
      muiTypeInTextField(dataCy: string, text: string, options?: { clear?: boolean; delay?: number }): Chainable<void>;
      muiToggleSwitch(dataCy: string, state?: boolean): Chainable<void>;
      muiOpenDialog(triggerButton: string): Chainable<void>;
      muiCloseDialog(method?: 'button' | 'escape' | 'backdrop'): Chainable<void>;
      muiSelectTab(tabLabel: string | number): Chainable<void>;
      muiExpandAccordion(dataCy: string, expand?: boolean): Chainable<void>;
      muiSelectAutocomplete(dataCy: string, option: string, createOption?: boolean): Chainable<void>;
      muiSelectDatePicker(dataCy: string, date: string): Chainable<void>;
      muiSelectTimePicker(dataCy: string, time: string): Chainable<void>;
      muiInteractWithSlider(dataCy: string, value: number): Chainable<void>;
      muiSelectChip(dataCy: string, chipLabel: string): Chainable<void>;
      muiDeleteChip(dataCy: string, chipLabel: string): Chainable<void>;
      muiStepperNavigate(direction: 'next' | 'back' | 'step', stepNumber?: number): Chainable<void>;

      // ===== ENHANCED CHART INTERACTION COMMANDS =====
      waitForChart(chartSelector?: string, timeout?: number): Chainable<void>;
      waitForRechart(dataCy: string, timeout?: number): Chainable<void>;
      waitForPlotlyChart(dataCy: string, timeout?: number): Chainable<void>;
      waitForMuiChart(dataCy: string, timeout?: number): Chainable<void>;
      verifyChartData(dataCy: string, expectedDataPoints?: number): Chainable<void>;
      interactWithChart(dataCy: string, action: 'hover' | 'click', coordinates?: { x: number; y: number }): Chainable<void>;
      captureChartScreenshot(dataCy: string, name: string): Chainable<void>;
      verifyChartTooltip(expectedContent: string): Chainable<void>;
      verifyChartLegend(expectedItems: string[]): Chainable<void>;
      toggleChartSeries(seriesName: string): Chainable<void>;
      zoomChart(dataCy: string, zoomArea: { x1: number; y1: number; x2: number; y2: number }): Chainable<void>;
      resetChartZoom(dataCy: string): Chainable<void>;
      exportChart(dataCy: string, format: 'png' | 'svg' | 'pdf'): Chainable<void>;

      // ===== ADVANCED FORM VALIDATION COMMANDS =====
      fillForm(formData: Record<string, any>): Chainable<void>;
      fillMuiForm(formData: Record<string, any>): Chainable<void>;
      validateFormField(fieldName: string, expectedValidation: 'valid' | 'invalid', errorMessage?: string): Chainable<void>;
      validateMuiFormField(fieldName: string, expectedValidation: 'valid' | 'invalid', errorMessage?: string): Chainable<void>;
      submitForm(formSelector?: string): Chainable<void>;
      resetForm(formSelector?: string): Chainable<void>;
      validateFormSubmission(expectedResult: string, timeout?: number): Chainable<void>;
      testFieldValidation(fieldName: string, testCases: Array<{ value: string; shouldBeValid: boolean; errorMessage?: string }>): Chainable<void>;

      // ===== FILE UPLOAD/DOWNLOAD COMMANDS =====
      uploadFile(fileSelector: string, filePath: string, mimeType?: string): Chainable<void>;
      dragAndDropFile(dropZoneSelector: string, filePath: string, fileName?: string): Chainable<void>;
      downloadFile(downloadTrigger: string, expectedFileName?: string): Chainable<void>;
      verifyDownload(fileName: string, timeout?: number): Chainable<void>;
      uploadCSVDataset(filePath: string, datasetName?: string): Chainable<void>;
      uploadModelFile(filePath: string, modelName?: string): Chainable<void>;

      // ===== ENHANCED TABLE/DATA GRID COMMANDS =====
      sortTable(columnSelector: string, direction?: 'asc' | 'desc'): Chainable<void>;
      sortMuiDataGrid(columnName: string, direction?: 'asc' | 'desc'): Chainable<void>;
      filterTable(filterValue: string, columnIndex?: number): Chainable<void>;
      filterMuiDataGrid(columnName: string, filterValue: string, filterType?: 'contains' | 'equals' | 'startsWith'): Chainable<void>;
      paginateTable(page: number): Chainable<void>;
      selectTableRow(rowIndex: number, multiple?: boolean): Chainable<void>;
      selectMuiDataGridRow(rowId: string | number, multiple?: boolean): Chainable<void>;
      verifyTableData(expectedRowCount: number, columnVerifications?: Array<{ column: number; contains: string }>): Chainable<void>;
      exportTableData(format: 'csv' | 'json' | 'xlsx'): Chainable<void>;
      searchInTable(searchTerm: string): Chainable<void>;

      // ===== API & DATA COMMANDS =====
      mockApiResponse(endpoint: string, response: any, method?: string, statusCode?: number): Chainable<void>;
      interceptApiCall(endpoint: string, alias: string, method?: string): Chainable<void>;
      waitForApiResponse(alias: string, timeout?: number): Chainable<void>;
      verifyApiCall(alias: string, expectedRequest?: any): Chainable<void>;
      seedTestData(dataType: string, count?: number): Chainable<void>;
      cleanupTestData(): Chainable<void>;
      mockMLStudioAPI(): Chainable<void>;
      mockHuggingFaceAPI(response?: any): Chainable<void>;

      // ===== PERFORMANCE COMMANDS =====
      measurePageLoad(): Chainable<void>;
      measureApiResponse(apiAlias: string): Chainable<void>;
      measureChartRender(chartSelector: string): Chainable<void>;
      measureFormSubmission(formSelector: string): Chainable<void>;
      verifyPagePerformance(thresholds?: { loadTime?: number; fcp?: number; lcp?: number }): Chainable<void>;

      // ===== ACCESSIBILITY COMMANDS =====
      checkA11y(context?: string, options?: any): Chainable<void>;
      injectAxe(): Chainable<void>;
      checkColorContrast(minRatio?: number): Chainable<void>;
      checkKeyboardNavigation(startElement?: string): Chainable<void>;
      checkScreenReaderSupport(): Chainable<void>;
      verifyAriaLabels(elements: Array<{ selector: string; expectedLabel?: string; expectedRole?: string }>): Chainable<void>;

      // ===== WAIT & RETRY COMMANDS =====
      waitForElement(selector: string, timeout?: number): Chainable<void>;
      waitForText(text: string, timeout?: number): Chainable<void>;
      waitForCondition(conditionFn: () => boolean, timeout?: number, interval?: number): Chainable<void>;
      retryAction(actionFn: () => void, maxRetries?: number, delay?: number): Chainable<void>;
      waitForStableElement(selector: string, timeout?: number): Chainable<void>;
      waitForNetworkIdle(timeout?: number): Chainable<void>;

      // ===== VISUAL TESTING COMMANDS =====
      matchSnapshot(name: string, options?: any): Chainable<void>;
      compareScreenshot(name: string, threshold?: number): Chainable<void>;
      visuallyCompareElement(selector: string, name: string): Chainable<void>;
      detectVisualRegression(baseline: string, current: string): Chainable<void>;

      // ===== ML STUDIO SPECIFIC COMMANDS =====
      createModel(modelConfig: any): Chainable<void>;
      trainModel(modelId: string, trainingConfig?: any): Chainable<void>;
      runExperiment(experimentConfig: any): Chainable<void>;
      deployModel(modelId: string, deploymentConfig?: any): Chainable<void>;
      uploadDataset(filePath: string, datasetName?: string, datasetType?: string): Chainable<void>;
      validateChartRender(chartType: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap'): Chainable<void>;
      monitorModelPerformance(modelId: string): Chainable<void>;
      runBiasDetection(datasetId: string, sensitiveAttributes: string[]): Chainable<void>;

      // ===== ADVANCED INTERACTION COMMANDS =====
      dragAndDrop(sourceSelector: string, targetSelector: string): Chainable<void>;
      simulateKeyboardShortcut(shortcut: string): Chainable<void>;
      simulateMouseGesture(gesture: 'double-click' | 'right-click' | 'long-press', selector: string): Chainable<void>;
      simulateTouch(selector: string, gesture: 'tap' | 'swipe' | 'pinch'): Chainable<void>;
      resizeElement(selector: string, dimensions: { width: number; height: number }): Chainable<void>;

      // ===== ERROR HANDLING & DEBUGGING =====
      handleError(errorType: string, recoveryAction?: () => void): Chainable<void>;
      debugElement(selector: string): Chainable<void>;
      logTestStep(step: string, data?: any): Chainable<void>;
      takeDebugScreenshot(name?: string): Chainable<void>;
      savePageState(name: string): Chainable<void>;
      restorePageState(name: string): Chainable<void>;
    }
  }
}

// **********************************************************************
// NAVIGATION COMMANDS
// **********************************************************************

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

Cypress.Commands.add('fillMuiForm', (formData: Record<string, any>) => {
  Object.entries(formData).forEach(([field, value]) => {
    if (typeof value === 'boolean') {
      cy.muiToggleSwitch(field, value);
    } else if (Array.isArray(value)) {
      // Handle multi-select
      value.forEach(option => {
        cy.muiSelectOption(field, option);
      });
    } else if (typeof value === 'object' && value.type) {
      // Handle special field types
      switch (value.type) {
        case 'date':
          cy.muiSelectDatePicker(field, value.value);
          break;
        case 'time':
          cy.muiSelectTimePicker(field, value.value);
          break;
        case 'slider':
          cy.muiInteractWithSlider(field, value.value);
          break;
        case 'autocomplete':
          cy.muiSelectAutocomplete(field, value.value, value.createOption);
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
    field.should('have.class', 'Mui-error').or('have.attr', 'aria-invalid', 'true');

    if (errorMessage) {
      cy.get(`[data-cy="${fieldName}-error"], [data-cy="${fieldName}"] ~ .MuiFormHelperText-root.Mui-error`)
        .should('contain.text', errorMessage);
    }
  } else {
    field.should('not.have.class', 'Mui-error').and('not.have.attr', 'aria-invalid', 'true');
  }
});

// **********************************************************************
// ML STUDIO SPECIFIC COMMANDS
// **********************************************************************

Cypress.Commands.add('createModel', (modelConfig: any) => {
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
    cy.fillMuiForm(modelConfig.parameters);
  }

  cy.muiClickButton('save-model-button');
  cy.waitForText('Model created successfully');
});

Cypress.Commands.add('trainModel', (modelId: string, trainingConfig = {}) => {
  cy.get(`[data-cy="model-${modelId}-train-button"]`).click();

  if (Object.keys(trainingConfig).length > 0) {
    cy.fillMuiForm(trainingConfig);
  }

  cy.muiClickButton('start-training-button');
  cy.waitForText('Training started');
});

Cypress.Commands.add('runExperiment', (experimentConfig: any) => {
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

Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((win) => {
    if (!win.axe) {
      const axeScript = win.document.createElement('script');
      axeScript.src = '/node_modules/axe-core/axe.min.js';
      axeScript.onload = () => {
        cy.log('Axe-core injected successfully');
      };
      win.document.head.appendChild(axeScript);
    }
  });
});

Cypress.Commands.add('checkA11y', (context?: string, options?: any) => {
  if (Cypress.env('accessibility')?.runAxeChecks) {
    cy.injectAxe();
    cy.wait(1000); // Allow axe to load

    cy.window().then((win) => {
      if (win.axe) {
        win.axe.run(context || document, options || {}).then((results) => {
          const violations = results.violations;
          if (violations.length > 0 && Cypress.env('accessibility')?.failOnViolations) {
            throw new Error(`Accessibility violations found: ${violations.length}`);
          }
          cy.task('log', `Accessibility check completed. Violations: ${violations.length}`);
        });
      }
    });
  }
});

// **********************************************************************
// ENHANCED WAIT COMMANDS
// **********************************************************************

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

Cypress.Commands.add('logTestStep', (step: string, data?: any) => {
  cy.task('log', `Test Step: ${step}${data ? ` - Data: ${JSON.stringify(data)}` : ''}`);
});

Cypress.Commands.add('takeDebugScreenshot', (name?: string) => {
  const screenshotName = name || `debug-${Date.now()}`;
  cy.screenshot(screenshotName, { capture: 'fullPage' });
});