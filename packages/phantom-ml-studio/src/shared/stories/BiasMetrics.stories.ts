import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BiasMetrics } from '..\..\lib\app\biasDetection\components\BiasMetrics';
import { BiasMetric } from '..\..\lib\app\biasDetection\types';

// Mock bias metrics data
const mockMetrics: BiasMetric[] = [
  {
    metric: 'Demographic Parity',
    value: 0.85,
    threshold: 0.8,
    status: 'pass',
    description: 'Measures the difference in positive prediction rates between different demographic groups. A value closer to 1.0 indicates better fairness.'
  },
  {
    metric: 'Equalized Odds',
    value: 0.65,
    threshold: 0.8,
    status: 'warning',
    description: 'Measures whether the true positive and false positive rates are equal across groups. Values below threshold indicate potential bias.'
  },
  {
    metric: 'Equal Opportunity',
    value: 0.45,
    threshold: 0.7,
    status: 'fail',
    description: 'Measures whether the true positive rate is equal across groups. Critical for ensuring fair access to positive outcomes.'
  },
  {
    metric: 'Calibration',
    value: 0.92,
    threshold: 0.85,
    status: 'pass',
    description: 'Measures whether predicted probabilities match actual outcomes across groups. Higher values indicate better calibration.'
  }
];

const meta = {
  title: 'ML Studio/Bias Metrics',
  component: BiasMetrics,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays detailed bias metrics analysis with visualizations. Used in the Bias Detection Engine to show model fairness across different metrics with status indicators and progress bars.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    metrics: {
      control: 'object',
      description: 'Array of bias metrics with values, thresholds, and status'
    }
  }
} satisfies Meta<typeof BiasMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleMetrics: Story = {
  args: {
    metrics: mockMetrics
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows multiple bias metrics with different statuses: pass, warning, and fail. Each metric includes value, threshold, progress bar, and description.'
      }
    }
  }
};

export const AllPassing: Story = {
  args: {
    metrics: [
      {
        metric: 'Demographic Parity',
        value: 0.95,
        threshold: 0.8,
        status: 'pass',
        description: 'Measures the difference in positive prediction rates between different demographic groups.'
      },
      {
        metric: 'Equalized Odds',
        value: 0.92,
        threshold: 0.8,
        status: 'pass',
        description: 'Measures whether the true positive and false positive rates are equal across groups.'
      },
      {
        metric: 'Equal Opportunity',
        value: 0.89,
        threshold: 0.7,
        status: 'pass',
        description: 'Measures whether the true positive rate is equal across groups.'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'All metrics passing fairness thresholds - ideal state for a fair model.'
      }
    }
  }
};

export const AllFailing: Story = {
  args: {
    metrics: [
      {
        metric: 'Demographic Parity',
        value: 0.45,
        threshold: 0.8,
        status: 'fail',
        description: 'Significant disparity in positive prediction rates between demographic groups.'
      },
      {
        metric: 'Equalized Odds',
        value: 0.35,
        threshold: 0.8,
        status: 'fail',
        description: 'Unequal true positive and false positive rates across groups.'
      },
      {
        metric: 'Equal Opportunity',
        value: 0.42,
        threshold: 0.7,
        status: 'fail',
        description: 'Unequal true positive rates indicate access disparities.'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'All metrics failing - indicates a model with significant bias issues requiring attention.'
      }
    }
  }
};

export const SingleMetric: Story = {
  args: {
    metrics: [
      {
        metric: 'Demographic Parity',
        value: 0.75,
        threshold: 0.8,
        status: 'warning',
        description: 'Measures the difference in positive prediction rates between different demographic groups.'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Single metric display with warning status.'
      }
    }
  }
};

export const Empty: Story = {
  args: {
    metrics: []
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no bias metrics are available.'
      }
    }
  }
};

export const EdgeCaseValues: Story = {
  args: {
    metrics: [
      {
        metric: 'Perfect Score',
        value: 1.0,
        threshold: 0.9,
        status: 'pass',
        description: 'Maximum possible fairness value.'
      },
      {
        metric: 'Zero Score',
        value: 0.0,
        threshold: 0.5,
        status: 'fail',
        description: 'Minimum possible value indicating complete bias.'
      },
      {
        metric: 'Threshold Edge',
        value: 0.8,
        threshold: 0.8,
        status: 'pass',
        description: 'Value exactly at threshold boundary.'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case values including perfect scores, zero values, and threshold boundaries.'
      }
    }
  }
};