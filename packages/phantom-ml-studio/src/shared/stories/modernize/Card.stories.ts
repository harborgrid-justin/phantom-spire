import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../../modernize/src/components/ui/Card';
import { Button } from '..\..\..\..\modernize\src\components\ui\Button';

// Create a wrapper component for better story composition
const CardExample = (props: any) => React.createElement(
  Card,
  { className: 'w-[350px]', ...props.cardProps },
  React.createElement(
    CardHeader,
    null,
    React.createElement(CardTitle, null, props.title || 'Card Title'),
    props.description && React.createElement(CardDescription, null, props.description)
  ),
  React.createElement(
    CardContent,
    null,
    React.createElement('p', null, props.content || 'Card content goes here. This is where you would put the main information or components.')
  ),
  props.showFooter && React.createElement(
    CardFooter,
    { className: 'flex justify-between' },
    React.createElement(Button, { variant: 'outline' }, 'Cancel'),
    React.createElement(Button, null, 'Save')
  )
);

const meta = {
  title: 'Modernize/Card',
  component: CardExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern card component with header, content, and footer sections. Perfect for displaying grouped information with a clean, elevated design.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title text'
    },
    description: {
      control: 'text',
      description: 'Card description text'
    },
    content: {
      control: 'text',
      description: 'Main card content'
    },
    showFooter: {
      control: 'boolean',
      description: 'Whether to show the footer with buttons'
    }
  },
} satisfies Meta<typeof CardExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Default Card',
    description: 'This is a description for the card component',
    content: 'This is the main content area of the card. You can put any content here.',
    showFooter: true
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Simple Card',
    content: 'A card without a description, just title and content.',
    showFooter: false
  },
};

export const WithoutFooter: Story = {
  args: {
    title: 'Content Only',
    description: 'This card has no footer buttons',
    content: 'Just the main content without any action buttons.',
    showFooter: false
  },
};

export const LongContent: Story = {
  args: {
    title: 'Card with Long Content',
    description: 'This demonstrates how the card handles longer content',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    showFooter: true
  },
};

export const Minimal: Story = {
  args: {
    title: 'Minimal Card',
    content: 'Just the essentials.',
    showFooter: false
  },
};