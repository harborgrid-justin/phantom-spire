import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AlgorithmPerformanceComponent from '../app/automlPipeline/components/AlgorithmPerformance';
import { AlgorithmPerformance } from '../app/automlPipeline/types';

// Mock data for the stories
const mockPerformanceData: AlgorithmPerformance[] = [
  {
    algorithm: 'Random Forest',
    accuracy: 0.95,
    f1Score: 0.94,
    precision: 0.93,
    recall: 0.95,
    trainingTime: 45000,
    status: 'completed'
  },
  {
    algorithm: 'XGBoost',
    accuracy: 0.92,
    f1Score: 0.91,
    precision: 0.90,
    recall: 0.92,
    trainingTime: 62000,
    status: 'completed'
  },
  {
    algorithm: 'Neural Network',
    accuracy: 0.88,
    f1Score: 0.87,
    precision: 0.86,
    recall: 0.89,
    trainingTime: 120000,
    status: 'completed'
  },
  {
    algorithm: 'Logistic Regression',
    accuracy: 0.0,
    f1Score: 0.0,
    precision: 0.0,
    recall: 0.0,
    trainingTime: 0,
    status: 'running'
  },
  {
    algorithm: 'Support Vector Machine',
    accuracy: 0.0,
    f1Score: 0.0,
    precision: 0.0,
    recall: 0.0,
    trainingTime: 0,
    status: 'failed'
  }
];

const meta = {
  title: 'ML Studio/Algorithm Performance',
  component: AlgorithmPerformanceComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays algorithm performance metrics in a table format with ranking and status indicators. Used in the AutoML Pipeline Visualizer to show training results.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    performance: {
      control: 'object',
      description: 'Array of algorithm performance data'
    }
  }
} satisfies Meta<typeof AlgorithmPerformanceComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMultipleAlgorithms: Story = {
  args: {
    performance: mockPerformanceData
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows multiple algorithms with different statuses: completed, running, and failed. The best performing algorithm is highlighted.'
      }
    }
  }
};

export const AllCompleted: Story = {
  args: {
    performance: mockPerformanceData.filter(p => p.status === 'completed')
  },
  parameters: {
    docs: {
      description: {
        story: 'All algorithms have completed training successfully. Shows rankings and performance metrics.'
      }
    }
  }
};

export const SingleRunning: Story = {
  args: {
    performance: [
      {
        algorithm: 'Deep Learning',
        accuracy: 0.0,
        f1Score: 0.0,
        precision: 0.0,
        recall: 0.0,
        trainingTime: 0,
        status: 'running'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Single algorithm currently training with progress indicator.'
      }
    }
  }
};

export const Empty: Story = {
  args: {
    performance: []
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no algorithm performance data is available.'
      }
    }
  }
};

export const OnlyFailed: Story = {
  args: {
    performance: [
      {
        algorithm: 'Broken Algorithm',
        accuracy: 0.0,
        f1Score: 0.0,
        precision: 0.0,
        recall: 0.0,
        trainingTime: 0,
        status: 'failed'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Algorithm that failed during training.'
      }
    }
  }
};