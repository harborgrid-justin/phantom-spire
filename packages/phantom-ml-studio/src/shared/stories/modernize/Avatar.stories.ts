import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../modernize/src/components/ui/Avatar';

// Create a wrapper component for better story composition
const AvatarExample = (props: any) => React.createElement(
  Avatar,
  { className: props.size },
  props.src && React.createElement(AvatarImage, { src: props.src, alt: props.alt || 'Avatar' }),
  React.createElement(AvatarFallback, null, props.fallback || 'JD')
);

const meta = {
  title: 'Modernize/Avatar',
  component: AvatarExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern avatar component that displays user profile images with fallback text. Supports custom sizing and graceful fallback handling.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL'
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image'
    },
    fallback: {
      control: 'text',
      description: 'Fallback text when image fails to load'
    },
    size: {
      control: 'select',
      options: ['', 'h-8 w-8', 'h-12 w-12', 'h-16 w-16', 'h-20 w-20'],
      description: 'Avatar size'
    }
  },
} satisfies Meta<typeof AvatarExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fallback: 'JD',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    alt: 'User avatar',
    fallback: 'JD',
  },
};

export const Small: Story = {
  args: {
    size: 'h-8 w-8',
    fallback: 'SM',
  },
};

export const Medium: Story = {
  args: {
    size: 'h-12 w-12',
    fallback: 'MD',
  },
};

export const Large: Story = {
  args: {
    size: 'h-16 w-16',
    fallback: 'LG',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'h-20 w-20',
    fallback: 'XL',
  },
};

export const BrokenImage: Story = {
  args: {
    src: 'https://broken-image-url.jpg',
    alt: 'Broken image',
    fallback: 'BI',
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with a broken image URL, demonstrating fallback behavior'
      }
    }
  }
};

export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {React.createElement(Avatar, { className: 'border-2 border-white' },
        React.createElement(AvatarImage, { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' }),
        React.createElement(AvatarFallback, null, 'JD')
      )}
      {React.createElement(Avatar, { className: 'border-2 border-white' },
        React.createElement(AvatarImage, { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }),
        React.createElement(AvatarFallback, null, 'AB')
      )}
      {React.createElement(Avatar, { className: 'border-2 border-white' },
        React.createElement(AvatarImage, { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' }),
        React.createElement(AvatarFallback, null, 'CD')
      )}
      {React.createElement(Avatar, { className: 'border-2 border-white' },
        React.createElement(AvatarFallback, null, '+2')
      )}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple avatars arranged in an overlapping group layout'
      }
    }
  }
};

export const InitialsVariations: Story = {
  render: () => (
    <div className="flex gap-4">
      {React.createElement(Avatar, null, React.createElement(AvatarFallback, null, 'JD'))}
      {React.createElement(Avatar, null, React.createElement(AvatarFallback, null, 'AB'))}
      {React.createElement(Avatar, null, React.createElement(AvatarFallback, null, 'XY'))}
      {React.createElement(Avatar, null, React.createElement(AvatarFallback, null, '👤'))}
      {React.createElement(Avatar, null, React.createElement(AvatarFallback, null, '🚀'))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different fallback content including initials and emojis'
      }
    }
  }
};