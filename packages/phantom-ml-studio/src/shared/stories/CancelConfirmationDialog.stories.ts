import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import CancelConfirmationDialog from '..\..\lib\app\automlPipeline\components\CancelConfirmationDialog';
import { Pipeline } from '..\..\lib\app\automlPipeline\types';

// Mock pipeline data
const mockPipeline: Pipeline = {
  id: 'pipeline-123',
  name: 'Fraud Detection Model Training',
  status: 'running',
  progress: 65,
  currentStep: 'Feature Engineering',
  algorithm: 'Random Forest',
  accuracy: 0.89,
  startTime: new Date('2024-01-15T10:30:00Z'),
  estimatedTime: 180000,
  datasetId: 'dataset-456'
};

const meta = {
  title: 'ML Studio/Cancel Confirmation Dialog',
  component: CancelConfirmationDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A confirmation dialog that appears when users attempt to cancel a running pipeline. Shows pipeline details and warns about losing progress.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls whether the dialog is visible'
    },
    pipeline: {
      control: 'object',
      description: 'Pipeline data to display in the confirmation dialog'
    },
    onClose: {
      action: 'closed',
      description: 'Callback when dialog is closed without confirmation'
    },
    onConfirm: {
      action: 'confirmed',
      description: 'Callback when cancellation is confirmed'
    }
  },
  args: {
    onClose: fn(),
    onConfirm: fn()
  }
} satisfies Meta<typeof CancelConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    pipeline: mockPipeline
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog open with a running pipeline showing current progress and warning message.'
      }
    }
  }
};

export const HighProgress: Story = {
  args: {
    open: true,
    pipeline: {
      ...mockPipeline,
      progress: 95,
      currentStep: 'Model Validation'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog for a pipeline that is nearly complete (95% progress).'
      }
    }
  }
};

export const EarlyStage: Story = {
  args: {
    open: true,
    pipeline: {
      ...mockPipeline,
      progress: 15,
      currentStep: 'Data Preprocessing'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog for a pipeline in early stages of execution.'
      }
    }
  }
};

export const Closed: Story = {
  args: {
    open: false,
    pipeline: mockPipeline
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog in closed state (not visible).'
      }
    }
  }
};

export const NullPipeline: Story = {
  args: {
    open: true,
    pipeline: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog open without pipeline data (edge case handling).'
      }
    }
  }
};

export const LongPipelineName: Story = {
  args: {
    open: true,
    pipeline: {
      ...mockPipeline,
      name: 'Very Long Pipeline Name That Tests How The Dialog Handles Extensive Text Content And Potential Layout Issues'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog with a very long pipeline name to test text wrapping and layout.'
      }
    }
  }
};