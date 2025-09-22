import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Input } from '../../../modernize/src/components/ui/Input';

const meta = {
  title: 'Modernize/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern input component with clean styling and focus states. Supports all standard HTML input types and attributes.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The type of input'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled'
    },
    value: {
      control: 'text',
      description: 'Input value'
    }
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn()
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Sample input text',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
    value: 'Cannot edit this',
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="w-full max-w-sm space-y-2">
      <label htmlFor="labeled-input" className="text-sm font-medium">
        Username
      </label>
      <Input id="labeled-input" {...args} />
      <p className="text-xs text-muted-foreground">
        Enter your username or email address
      </p>
    </div>
  ),
  args: {
    placeholder: 'john.doe',
  },
};

export const WithError: Story = {
  render: (args) => (
    <div className="w-full max-w-sm space-y-2">
      <label htmlFor="error-input" className="text-sm font-medium">
        Email Address
      </label>
      <Input
        id="error-input"
        className="border-red-500 focus-visible:ring-red-500"
        {...args}
      />
      <p className="text-xs text-red-500">
        Please enter a valid email address
      </p>
    </div>
  ),
  args: {
    type: 'email',
    value: 'invalid-email',
    placeholder: 'Enter email...',
  },
};