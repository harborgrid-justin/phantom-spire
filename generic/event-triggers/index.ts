/**
 * Generic Event Triggers - Revolutionary Plug-and-Play Module
 */

export * from './core/EventTriggers';
export { EventTriggers as default } from './core/EventTriggers';

// Revolutionary zero-config entry points
export const createEventTriggers = (config?: any) => {
  const { EventTriggers } = require('./core/EventTriggers');
  return new EventTriggers(config || {});
};

export const autoEventTriggers = () => {
  const { EventTriggers } = require('./core/EventTriggers');
  return new EventTriggers({
    autoCreateTriggers: true,
    monitorSystem: true,
    autoLink: true
  });
};

// Global event system
let globalEventTriggers: any = null;

export const getGlobalEventTriggers = () => {
  if (!globalEventTriggers) {
    globalEventTriggers = autoEventTriggers();
  }
  return globalEventTriggers;
};

export const fireGlobalEvent = (eventName: string, data?: any) => {
  return getGlobalEventTriggers().fireEvent(eventName, data);
};