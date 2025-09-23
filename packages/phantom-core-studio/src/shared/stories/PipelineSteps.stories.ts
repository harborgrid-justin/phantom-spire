import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PipelineStepsComponent from '../../lib/app/automlPipeline/components/PipelineSteps';
import { PipelineStep } from '../../lib/app/automlPipeline/types';

// Mock pipeline steps data
const mockSteps: PipelineStep[] = [
  {
    id: 'step-1',
    name: 'Data Preprocessing',
    status: 'completed',
    duration: 15000,
    metrics: {
      'rows_processed': 10000,
      'features_engineered': 25,
      'missing_values_handled': 150
    }
  },
  {
    id: 'step-2',
    name: 'Feature Engineering',
    status: 'completed',
    duration: 22000,
    metrics: {
      'features_created': 12,
      'correlations_analyzed': 300,
      'importance_calculated': 37
    }
  },
  {
    id: 'step-3',
    name: 'Model Training',
    status: 'running',
    duration: 0,
    metrics: {
      'algorithms_tested': 3,
      'current_accuracy': 0.87
    }
  },
  {
    id: 'step-4',
    name: 'Model Validation',
    status: 'pending',
    duration: 0
  },
  {
    id: 'step-5',
    name: 'Performance Optimization',
    status: 'pending',
    duration: 0
  }
];

const meta = {
  title: 'ML Studio/Pipeline Steps',
  component: PipelineStepsComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays pipeline execution steps in a vertical stepper format. Shows step status, duration, and metrics. Used in the AutoML Pipeline Visualizer to track progress through the machine learning workflow.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    steps: {
      control: 'object',
      description: 'Array of pipeline steps with status, duration, and metrics'
    }
  }
} satisfies Meta<typeof PipelineStepsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    steps: mockSteps
  },
  parameters: {
    docs: {
      description: {
        story: 'Pipeline in progress with some completed steps, one currently running, and others pending.'
      }
    }
  }
};

export const AllCompleted: Story = {
  args: {
    steps: mockSteps.map(step => ({
      ...step,
      status: 'completed' as const,
      duration: step.duration || 18000
    }))
  },
  parameters: {
    docs: {
      description: {
        story: 'All pipeline steps completed successfully.'
      }
    }
  }
};

export const WithFailure: Story = {
  args: {
    steps: [
      ...mockSteps.slice(0, 2),
      {
        ...mockSteps[2],
        status: 'failed' as const,
        duration: 8000
      },
      ...mockSteps.slice(3)
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Pipeline with a failed step, remaining steps are pending.'
      }
    }
  }
};

export const JustStarted: Story = {
  args: {
    steps: [
      {
        ...mockSteps[0],
        status: 'running' as const,
        duration: 0
      },
      ...mockSteps.slice(1).map(step => ({
        ...step,
        status: 'pending' as const
      }))
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Pipeline just started with first step running and others pending.'
      }
    }
  }
};

export const SingleStep: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        name: 'Quick Analysis',
        status: 'completed',
        duration: 5000,
        metrics: {
          'data_points': 1000,
          'accuracy': 0.92
        }
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Single step pipeline.'
      }
    }
  }
};

export const Empty: Story = {
  args: {
    steps: []
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no pipeline steps are available.'
      }
    }
  }
};

export const LongRunningStep: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        name: 'Large Dataset Processing',
        status: 'running',
        duration: 0,
        metrics: {
          'estimated_time_remaining': 3600000,
          'progress_percentage': 45
        }
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Long-running step with progress information.'
      }
    }
  }
};