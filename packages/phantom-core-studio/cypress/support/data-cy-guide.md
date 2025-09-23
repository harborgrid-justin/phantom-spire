# Data-Cy Attribute Implementation Guide

This guide provides comprehensive instructions for implementing systematic `data-cy` attributes across all UI components in the Phantom ML Studio application.

## 1. Naming Conventions

### Base Principles
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise
- Follow a hierarchical structure
- Avoid implementation details

### Patterns

#### Page-Level Elements
```tsx
// Page containers
data-cy="dashboard-content"
data-cy="model-builder-content"
data-cy="experiments-content"

// Main sections
data-cy="header-section"
data-cy="sidebar-section"
data-cy="main-content-section"
data-cy="footer-section"
```

#### Navigation Elements
```tsx
// Navigation items
data-cy="nav-dashboard"
data-cy="nav-model-builder"
data-cy="nav-experiments"
data-cy="nav-deployments"

// Breadcrumbs
data-cy="breadcrumb-home"
data-cy="breadcrumb-models"
data-cy="breadcrumb-model-details"
```

#### Form Elements
```tsx
// Input fields
data-cy="model-name-input"
data-cy="algorithm-select"
data-cy="dataset-upload"
data-cy="hyperparameter-{parameter-name}"

// Buttons
data-cy="submit-button"
data-cy="cancel-button"
data-cy="save-model-button"
data-cy="train-model-button"

// Form sections
data-cy="basic-config-section"
data-cy="advanced-config-section"
data-cy="validation-section"
```

#### Data Display Elements
```tsx
// Tables
data-cy="models-table"
data-cy="experiments-table"
data-cy="table-row-{id}"
data-cy="table-header-{column}"
data-cy="table-cell-{row}-{column}"

// Cards
data-cy="model-card-{id}"
data-cy="metric-card-{metric-name}"
data-cy="summary-card"

// Lists
data-cy="feature-list"
data-cy="feature-item-{index}"
data-cy="result-list"
```

#### Chart and Visualization Elements
```tsx
// Chart containers
data-cy="performance-chart"
data-cy="accuracy-chart"
data-cy="confusion-matrix"
data-cy="roc-curve"
data-cy="feature-importance-chart"

// Chart components
data-cy="chart-legend"
data-cy="chart-tooltip"
data-cy="chart-controls"
data-cy="zoom-controls"

// Interactive elements
data-cy="chart-data-point-{index}"
data-cy="legend-item-{series}"
```

#### Modal and Dialog Elements
```tsx
// Modal containers
data-cy="model-details-modal"
data-cy="delete-confirmation-modal"
data-cy="settings-modal"

// Modal components
data-cy="modal-header"
data-cy="modal-body"
data-cy="modal-footer"
data-cy="modal-close"
data-cy="modal-backdrop"
```

#### Status and State Elements
```tsx
// Status indicators
data-cy="status-{status-value}"
data-cy="loading-spinner"
data-cy="error-message"
data-cy="success-message"

// Progress indicators
data-cy="training-progress"
data-cy="upload-progress"
data-cy="analysis-progress"
```

## 2. Implementation by Component Type

### Material-UI Components

#### Buttons
```tsx
import { Button } from '@mui/material';

<Button data-cy="create-model-button" variant="contained">
  Create Model
</Button>

<Button data-cy="save-draft-button" variant="outlined">
  Save Draft
</Button>
```

#### Form Controls
```tsx
import { TextField, Select, MenuItem } from '@mui/material';

<TextField
  data-cy="model-name-input"
  label="Model Name"
  variant="outlined"
/>

<Select data-cy="algorithm-select">
  <MenuItem data-cy="algo-option-random-forest" value="random-forest">
    Random Forest
  </MenuItem>
  <MenuItem data-cy="algo-option-neural-network" value="neural-network">
    Neural Network
  </MenuItem>
</Select>
```

#### Data Grid
```tsx
import { DataGrid } from '@mui/x-data-grid';

<DataGrid
  data-cy="models-data-grid"
  rows={models}
  columns={columns}
  componentsProps={{
    row: {
      'data-cy': 'grid-row'
    },
    cell: {
      'data-cy': 'grid-cell'
    }
  }}
/>
```

#### Tabs
```tsx
import { Tabs, Tab } from '@mui/material';

<Tabs data-cy="main-tabs">
  <Tab data-cy="tab-overview" label="Overview" />
  <Tab data-cy="tab-configuration" label="Configuration" />
  <Tab data-cy="tab-results" label="Results" />
</Tabs>
```

### Chart Components

#### Recharts
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

<LineChart data-cy="performance-line-chart" data={data}>
  <XAxis data-cy="chart-x-axis" />
  <YAxis data-cy="chart-y-axis" />
  <Tooltip data-cy="chart-tooltip" />
  <Legend data-cy="chart-legend" />
  <Line data-cy="accuracy-line" dataKey="accuracy" />
  <Line data-cy="precision-line" dataKey="precision" />
</LineChart>
```

#### MUI X Charts
```tsx
import { LineChart } from '@mui/x-charts/LineChart';

<LineChart
  data-cy="mui-performance-chart"
  series={[
    { data: accuracyData, label: 'Accuracy' },
    { data: precisionData, label: 'Precision' }
  ]}
  xAxis={[{ data: dates }]}
/>
```

#### Plotly
```tsx
import Plot from 'react-plotly.js';

<Plot
  data-cy="plotly-3d-chart"
  data={plotData}
  layout={layout}
  config={{ displayModeBar: true }}
/>
```

### Custom Components

#### Feature Engineering Components
```tsx
// Feature selection
<FeatureSelector data-cy="feature-selector">
  <FeatureItem data-cy="feature-item-age" featureName="age" />
  <FeatureItem data-cy="feature-item-income" featureName="income" />
</FeatureSelector>

// Transformation pipeline
<TransformationPipeline data-cy="transformation-pipeline">
  <TransformationStep data-cy="transform-step-normalize" type="normalize" />
  <TransformationStep data-cy="transform-step-encode" type="encode" />
</TransformationPipeline>
```

#### Model Training Components
```tsx
// Training configuration
<TrainingConfig data-cy="training-config">
  <HyperparameterGrid data-cy="hyperparameter-grid">
    <HyperparameterInput
      data-cy="hyperparam-learning-rate"
      name="learning_rate"
    />
    <HyperparameterInput
      data-cy="hyperparam-batch-size"
      name="batch_size"
    />
  </HyperparameterGrid>
</TrainingConfig>

// Training progress
<TrainingProgress data-cy="training-progress">
  <ProgressBar data-cy="progress-bar" value={progress} />
  <TrainingLogs data-cy="training-logs" />
  <MetricsDisplay data-cy="training-metrics" />
</TrainingProgress>
```

## 3. Page-Specific Implementation

### Dashboard Page
```tsx
// src/app/dashboard/page.tsx
<div data-cy="dashboard-content">
  <header data-cy="dashboard-header">
    <h1 data-cy="page-title">Dashboard</h1>
    <Button data-cy="refresh-dashboard">Refresh</Button>
  </header>

  <section data-cy="metrics-section">
    <MetricCard data-cy="models-metric" title="Total Models" value={totalModels} />
    <MetricCard data-cy="experiments-metric" title="Active Experiments" value={activeExperiments} />
    <MetricCard data-cy="deployments-metric" title="Deployments" value={deployments} />
  </section>

  <section data-cy="charts-section">
    <PerformanceChart data-cy="performance-chart" />
    <TrendsChart data-cy="trends-chart" />
  </section>

  <section data-cy="activity-section">
    <RecentActivity data-cy="recent-activity-feed" />
  </section>
</div>
```

### Model Builder Page
```tsx
// src/app/model-builder/page.tsx
<div data-cy="model-builder-content">
  <header data-cy="model-builder-header">
    <h1 data-cy="page-title">Model Builder</h1>
    <Button data-cy="create-model-button">Create New Model</Button>
  </header>

  <form data-cy="model-creation-form">
    <section data-cy="basic-config-section">
      <TextField data-cy="model-name-input" label="Model Name" />
      <Select data-cy="algorithm-select">
        <MenuItem data-cy="algo-random-forest" value="random-forest">
          Random Forest
        </MenuItem>
      </Select>
    </section>

    <section data-cy="dataset-section">
      <DatasetSelector data-cy="dataset-selector" />
      <FeatureSelector data-cy="feature-selector" />
    </section>

    <section data-cy="training-section">
      <HyperparameterConfig data-cy="hyperparameter-config" />
      <Button data-cy="start-training-button">Start Training</Button>
    </section>
  </form>

  <section data-cy="results-section">
    <EvaluationMetrics data-cy="evaluation-metrics" />
    <ConfusionMatrix data-cy="confusion-matrix" />
    <ROCCurve data-cy="roc-curve" />
  </section>
</div>
```

### Experiments Page
```tsx
// src/app/experiments/page.tsx
<div data-cy="experiments-content">
  <header data-cy="experiments-header">
    <h1 data-cy="page-title">Experiments</h1>
    <Button data-cy="create-experiment-button">Create Experiment</Button>
  </header>

  <section data-cy="experiments-list-section">
    <DataGrid
      data-cy="experiments-table"
      rows={experiments}
      columns={columns}
    />
  </section>

  <section data-cy="experiment-details-section">
    <Tabs data-cy="experiment-tabs">
      <Tab data-cy="overview-tab" label="Overview" />
      <Tab data-cy="results-tab" label="Results" />
      <Tab data-cy="comparison-tab" label="Comparison" />
    </Tabs>

    <div data-cy="experiment-results">
      <MetricsComparison data-cy="metrics-comparison" />
      <StatisticalAnalysis data-cy="statistical-analysis" />
      <ExperimentChart data-cy="experiment-chart" />
    </div>
  </section>
</div>
```

## 4. Testing Integration

### Custom Commands Usage
```typescript
// Using data-cy attributes in tests
cy.get('[data-cy="create-model-button"]').click();
cy.get('[data-cy="model-name-input"]').type('Test Model');
cy.get('[data-cy="algorithm-select"]').click();
cy.get('[data-cy="algo-random-forest"]').click();

// With custom commands
cy.muiClickButton('create-model-button');
cy.muiTypeInTextField('model-name-input', 'Test Model');
cy.muiSelectOption('algorithm-select', 'Random Forest');
```

### Page Object Integration
```typescript
// In page objects
class ModelBuilderPage extends BasePage {
  createModel(name: string, algorithm: string) {
    cy.get('[data-cy="create-model-button"]').click();
    cy.get('[data-cy="model-name-input"]').type(name);
    cy.get('[data-cy="algorithm-select"]').click();
    cy.get(`[data-cy="algo-${algorithm}"]`).click();
    return this;
  }
}
```

## 5. Implementation Checklist

### Priority 1: Core Navigation and Actions
- [ ] Main navigation menu items
- [ ] Primary action buttons (Create, Save, Delete, etc.)
- [ ] Form submission buttons
- [ ] Page containers and sections

### Priority 2: Form Elements
- [ ] All input fields (text, select, checkbox, radio)
- [ ] Form validation error messages
- [ ] Form section containers
- [ ] Multi-step form navigation

### Priority 3: Data Display
- [ ] Tables and data grids
- [ ] Cards and list items
- [ ] Charts and visualizations
- [ ] Modal dialogs and overlays

### Priority 4: Interactive Elements
- [ ] Chart interaction points
- [ ] Drag and drop areas
- [ ] Tooltip triggers
- [ ] Expandable sections

### Priority 5: Status and Feedback
- [ ] Loading indicators
- [ ] Error and success messages
- [ ] Progress bars
- [ ] Status badges

## 6. Validation and Quality Assurance

### Automated Validation
Create a script to validate data-cy attribute coverage:

```javascript
// scripts/validate-data-cy.js
const fs = require('fs');
const path = require('path');

function validateDataCyAttributes(dir) {
  const files = fs.readdirSync(dir);
  const issues = [];

  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');

      // Check for buttons without data-cy
      const buttonMatches = content.match(/<Button[^>]*>/g) || [];
      buttonMatches.forEach(button => {
        if (!button.includes('data-cy=')) {
          issues.push(`${file}: Button missing data-cy attribute`);
        }
      });

      // Check for form inputs without data-cy
      const inputMatches = content.match(/<TextField[^>]*>/g) || [];
      inputMatches.forEach(input => {
        if (!input.includes('data-cy=')) {
          issues.push(`${file}: TextField missing data-cy attribute`);
        }
      });
    }
  });

  return issues;
}
```

### Manual Review Checklist
- [ ] All interactive elements have data-cy attributes
- [ ] Attributes follow naming conventions
- [ ] No duplicate data-cy values on the same page
- [ ] Dynamic attributes use appropriate patterns
- [ ] Chart elements are properly tagged

## 7. Maintenance Guidelines

### Regular Audits
- Review new components for data-cy attributes
- Update existing attributes when component structure changes
- Ensure consistency across similar components
- Document any new patterns or conventions

### Team Guidelines
- Include data-cy attributes in code review checklists
- Provide templates for common component patterns
- Train team members on naming conventions
- Use linting rules to enforce data-cy requirements

This systematic approach ensures comprehensive test coverage and maintainable test automation across the entire Phantom ML Studio application.