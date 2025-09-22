import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '../../../modernize/src/components/ui/Badge';

const meta = {
  title: 'Modernize/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern badge component for displaying status, labels, or categories. Comes in multiple variants to suit different use cases.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'The visual style variant of the badge'
    },
    children: {
      control: 'text',
      description: 'Badge content'
    }
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Error',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collection of badges showing different status states'
      }
    }
  }
};

export const WithNumbers: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge>99+</Badge>
      <Badge variant="destructive">5</Badge>
      <Badge variant="secondary">12</Badge>
      <Badge variant="outline">0</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges displaying numerical values like notification counts'
      }
    }
  }
};

export const Categories: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge>React</Badge>
      <Badge variant="secondary">TypeScript</Badge>
      <Badge variant="outline">Tailwind</Badge>
      <Badge>Storybook</Badge>
      <Badge variant="secondary">Components</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used as category tags or labels'
      }
    }
  }
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-2 items-center flex-wrap">
      <Badge className="text-xs">Small</Badge>
      <Badge>Default</Badge>
      <Badge className="text-sm px-3 py-1">Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges in different sizes using custom styling'
      }
    }
  }
};