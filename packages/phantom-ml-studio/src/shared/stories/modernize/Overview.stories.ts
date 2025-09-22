import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Button } from '..\..\..\..\modernize\src\components\ui\Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '..\..\..\..\modernize\src\components\ui\Card';
import { Input } from '..\..\..\..\modernize\src\components\ui\Input';
import { Badge } from '..\..\..\..\modernize\src\components\ui\Badge';
import { Avatar, AvatarFallback, AvatarImage } from '..\..\..\..\modernize\src\components\ui\Avatar';

// Create a comprehensive overview component
const ModernizeOverview = () => React.createElement(
  'div',
  { className: 'p-8 space-y-8 max-w-4xl mx-auto' },

  // Header
  React.createElement(
    'div',
    { className: 'text-center space-y-4' },
    React.createElement('h1', { className: 'text-4xl font-bold' }, 'Modernize UI Components'),
    React.createElement('p', { className: 'text-lg text-muted-foreground' },
      'A modern, accessible component library built with React, TypeScript, and Tailwind CSS'
    )
  ),

  // Button Section
  React.createElement(
    Card,
    null,
    React.createElement(
      CardHeader,
      null,
      React.createElement(CardTitle, null, 'Buttons'),
      React.createElement(CardDescription, null, 'Various button variants and sizes')
    ),
    React.createElement(
      CardContent,
      null,
      React.createElement(
        'div',
        { className: 'flex flex-wrap gap-2' },
        React.createElement(Button, null, 'Default'),
        React.createElement(Button, { variant: 'secondary' }, 'Secondary'),
        React.createElement(Button, { variant: 'outline' }, 'Outline'),
        React.createElement(Button, { variant: 'destructive' }, 'Destructive'),
        React.createElement(Button, { variant: 'ghost' }, 'Ghost'),
        React.createElement(Button, { variant: 'link' }, 'Link')
      )
    )
  ),

  // Form Section
  React.createElement(
    Card,
    null,
    React.createElement(
      CardHeader,
      null,
      React.createElement(CardTitle, null, 'Form Components'),
      React.createElement(CardDescription, null, 'Inputs and form elements')
    ),
    React.createElement(
      CardContent,
      { className: 'space-y-4' },
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('label', { className: 'text-sm font-medium' }, 'Email'),
        React.createElement(Input, { type: 'email', placeholder: 'Enter your email...' })
      ),
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('label', { className: 'text-sm font-medium' }, 'Password'),
        React.createElement(Input, { type: 'password', placeholder: 'Enter password...' })
      )
    ),
    React.createElement(
      CardFooter,
      null,
      React.createElement(Button, { className: 'w-full' }, 'Sign In')
    )
  ),

  // Badge and Avatar Section
  React.createElement(
    Card,
    null,
    React.createElement(
      CardHeader,
      null,
      React.createElement(CardTitle, null, 'Status & Identity'),
      React.createElement(CardDescription, null, 'Badges and avatars for user interfaces')
    ),
    React.createElement(
      CardContent,
      { className: 'space-y-6' },
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('h4', { className: 'text-sm font-medium' }, 'Status Badges'),
        React.createElement(
          'div',
          { className: 'flex gap-2 flex-wrap' },
          React.createElement(Badge, null, 'Active'),
          React.createElement(Badge, { variant: 'secondary' }, 'Pending'),
          React.createElement(Badge, { variant: 'destructive' }, 'Error'),
          React.createElement(Badge, { variant: 'outline' }, 'Draft')
        )
      ),
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('h4', { className: 'text-sm font-medium' }, 'User Avatars'),
        React.createElement(
          'div',
          { className: 'flex gap-2' },
          React.createElement(
            Avatar,
            null,
            React.createElement(AvatarImage, { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' }),
            React.createElement(AvatarFallback, null, 'JD')
          ),
          React.createElement(
            Avatar,
            null,
            React.createElement(AvatarFallback, null, 'AB')
          ),
          React.createElement(
            Avatar,
            null,
            React.createElement(AvatarFallback, null, 'XY')
          )
        )
      )
    )
  ),

  // Component Grid
  React.createElement(
    'div',
    { className: 'grid md:grid-cols-2 gap-6' },
    React.createElement(
      Card,
      null,
      React.createElement(
        CardHeader,
        null,
        React.createElement(CardTitle, { className: 'text-lg' }, 'Design Principles'),
        React.createElement(CardDescription, null, 'Modern UI/UX guidelines')
      ),
      React.createElement(
        CardContent,
        { className: 'space-y-2' },
        React.createElement('ul', { className: 'text-sm space-y-1' },
          React.createElement('li', null, '• Accessibility-first design'),
          React.createElement('li', null, '• Consistent spacing and typography'),
          React.createElement('li', null, '• Responsive and mobile-friendly'),
          React.createElement('li', null, '• Dark mode ready'),
          React.createElement('li', null, '• Keyboard navigation support')
        )
      )
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        CardHeader,
        null,
        React.createElement(CardTitle, { className: 'text-lg' }, 'Technology Stack'),
        React.createElement(CardDescription, null, 'Built with modern tools')
      ),
      React.createElement(
        CardContent,
        { className: 'space-y-2' },
        React.createElement(
          'div',
          { className: 'flex flex-wrap gap-1' },
          React.createElement(Badge, { variant: 'outline' }, 'React'),
          React.createElement(Badge, { variant: 'outline' }, 'TypeScript'),
          React.createElement(Badge, { variant: 'outline' }, 'Tailwind CSS'),
          React.createElement(Badge, { variant: 'outline' }, 'Radix UI'),
          React.createElement(Badge, { variant: 'outline' }, 'Storybook')
        )
      )
    )
  )
);

const meta = {
  title: 'Modernize/Overview',
  component: ModernizeOverview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive overview of the Modernize component library showcasing all available components in action.'
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModernizeOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComponentShowcase: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A complete showcase of all Modernize components working together in a realistic interface.'
      }
    }
  }
};