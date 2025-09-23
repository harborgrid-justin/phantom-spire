/**
 * ANIMATIONS CONSTANTS
 * 
 * Animation presets and utilities for enterprise applications
 */

import { AnimationProps } from '../types';

// Animation durations
export const durations = {
  fastest: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 750,
} as const;

// Animation easings
export const easings = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic-bezier easings
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  swift: 'cubic-bezier(0.4, 0, 0.2, 1)',
  swiftOut: 'cubic-bezier(0, 0, 0.2, 1)',
  swiftIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  // Material Design easings
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

// Base animation configurations
export const animations: Record<string, AnimationProps> = {
  // Fade animations
  fadeIn: {
    duration: durations.normal,
    easing: easings.easeOut,
    fillMode: 'forwards',
  },
  
  fadeOut: {
    duration: durations.fast,
    easing: easings.easeIn,
    fillMode: 'forwards',
  },
  
  fadeInUp: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  fadeInDown: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  // Slide animations
  slideIn: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  slideOut: {
    duration: durations.fast,
    easing: easings.swiftIn,
    fillMode: 'forwards',
  },
  
  slideInLeft: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  slideInRight: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  slideInUp: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  slideInDown: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  // Scale animations
  scaleIn: {
    duration: durations.fast,
    easing: easings.bounce,
    fillMode: 'forwards',
  },
  
  scaleOut: {
    duration: durations.fast,
    easing: easings.easeIn,
    fillMode: 'forwards',
  },
  
  pulse: {
    duration: durations.slow,
    easing: easings.easeInOut,
    fillMode: 'forwards',
  },
  
  // Rotation animations
  rotateIn: {
    duration: durations.normal,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  rotateOut: {
    duration: durations.fast,
    easing: easings.easeIn,
    fillMode: 'forwards',
  },
  
  // Flip animations
  flipIn: {
    duration: durations.slow,
    easing: easings.swift,
    fillMode: 'forwards',
  },
  
  flipOut: {
    duration: durations.normal,
    easing: easings.easeIn,
    fillMode: 'forwards',
  },
  
  // Bounce animations
  bounceIn: {
    duration: durations.slower,
    easing: easings.bounce,
    fillMode: 'forwards',
  },
  
  bounceOut: {
    duration: durations.normal,
    easing: easings.easeIn,
    fillMode: 'forwards',
  },
  
  // Elastic animations
  elasticIn: {
    duration: durations.slower,
    easing: easings.elastic,
    fillMode: 'forwards',
  },
  
  elasticOut: {
    duration: durations.slow,
    easing: easings.elastic,
    fillMode: 'forwards',
  },
  
  // Attention animations
  shake: {
    duration: durations.slow,
    easing: easings.easeInOut,
    fillMode: 'forwards',
  },
  
  wobble: {
    duration: durations.slower,
    easing: easings.easeInOut,
    fillMode: 'forwards',
  },
  
  jello: {
    duration: durations.slower,
    easing: easings.easeInOut,
    fillMode: 'forwards',
  },
  
  // Loading animations
  spin: {
    duration: durations.slower,
    easing: easings.linear,
    fillMode: 'none',
  },
  
  ping: {
    duration: durations.slower,
    easing: easings.easeInOut,
    fillMode: 'none',
  },
} as const;

// CSS keyframes for animations
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  
  fadeInUp: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translate3d(0, 100%, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  `,
  
  fadeInDown: `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translate3d(0, -100%, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  `,
  
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        transform: translate3d(-100%, 0, 0);
        visibility: visible;
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }
  `,
  
  slideInRight: `
    @keyframes slideInRight {
      from {
        transform: translate3d(100%, 0, 0);
        visibility: visible;
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }
  `,
  
  slideInUp: `
    @keyframes slideInUp {
      from {
        transform: translate3d(0, 100%, 0);
        visibility: visible;
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }
  `,
  
  slideInDown: `
    @keyframes slideInDown {
      from {
        transform: translate3d(0, -100%, 0);
        visibility: visible;
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }
  `,
  
  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale3d(0.3, 0.3, 0.3);
      }
      50% {
        opacity: 1;
      }
      to {
        opacity: 1;
        transform: scale3d(1, 1, 1);
      }
    }
  `,
  
  scaleOut: `
    @keyframes scaleOut {
      from {
        opacity: 1;
        transform: scale3d(1, 1, 1);
      }
      to {
        opacity: 0;
        transform: scale3d(0.3, 0.3, 0.3);
      }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0% {
        transform: scale3d(1, 1, 1);
      }
      50% {
        transform: scale3d(1.05, 1.05, 1.05);
      }
      100% {
        transform: scale3d(1, 1, 1);
      }
    }
  `,
  
  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
  
  ping: `
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `,
  
  shake: `
    @keyframes shake {
      0%, 100% {
        transform: translate3d(0, 0, 0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translate3d(-10px, 0, 0);
      }
      20%, 40%, 60%, 80% {
        transform: translate3d(10px, 0, 0);
      }
    }
  `,
  
  wobble: `
    @keyframes wobble {
      0% {
        transform: translate3d(0, 0, 0);
      }
      15% {
        transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
      }
      30% {
        transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
      }
      45% {
        transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
      }
      60% {
        transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
      }
      75% {
        transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
      }
      100% {
        transform: translate3d(0, 0, 0);
      }
    }
  `,
} as const;

// Animation utilities
export const animationUtils = {
  // Create animation string
  createAnimation: (
    name: keyof typeof animations,
    options?: Partial<AnimationProps>
  ): string => {
    const animation = animations[name];
    const config = { ...animation, ...options };
    
    return `${name} ${config.duration}ms ${config.easing} ${config.delay || 0}ms ${config.fillMode}`;
  },
  
  // Create transition string
  createTransition: (
    property: string | string[],
    duration: keyof typeof durations = 'normal',
    easing: keyof typeof easings = 'easeInOut',
    delay = 0
  ): string => {
    const properties = Array.isArray(property) ? property : [property];
    
    return properties
      .map(prop => `${prop} ${durations[duration]}ms ${easings[easing]} ${delay}ms`)
      .join(', ');
  },
  
  // Get duration value
  getDuration: (key: keyof typeof durations): number => durations[key],
  
  // Get easing value
  getEasing: (key: keyof typeof easings): string => easings[key],
  
  // Get animation config
  getAnimation: (key: keyof typeof animations): AnimationProps => {
    const animation = animations[key];
    if (!animation) {
      throw new Error(`Animation "${key}" not found`);
    }
    return animation;
  },
} as const;

// CSS custom properties for animations
export const animationCSSProperties = {
  '--duration-fastest': `${durations.fastest}ms`,
  '--duration-fast': `${durations.fast}ms`,
  '--duration-normal': `${durations.normal}ms`,
  '--duration-slow': `${durations.slow}ms`,
  '--duration-slower': `${durations.slower}ms`,
  '--duration-slowest': `${durations.slowest}ms`,
  
  '--easing-linear': easings.linear,
  '--easing-ease-in': easings.easeIn,
  '--easing-ease-out': easings.easeOut,
  '--easing-ease-in-out': easings.easeInOut,
  '--easing-bounce': easings.bounce,
  '--easing-elastic': easings.elastic,
  '--easing-swift': easings.swift,
} as const;

export type AnimationName = keyof typeof animations;
export type DurationKey = keyof typeof durations;
export type EasingKey = keyof typeof easings;
export type KeyframeName = keyof typeof keyframes;
