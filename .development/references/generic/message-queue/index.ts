/**
 * Generic Message Queue - Revolutionary Plug-and-Play Module
 */

export * from './interfaces/IMessageQueue';
export { MessageQueue } from './core/MessageQueue';
export { MessageQueue as default } from './core/MessageQueue';

// Revolutionary zero-config entry points
export const createMessageQueue = (config?: any) => {
  const { MessageQueue } = require('./core/MessageQueue');
  return new MessageQueue(config || {});
};

export const createAutoQueue = (useCase?: string) => {
  const { MessageQueue } = require('./core/MessageQueue');
  const config = useCase ? { name: `${useCase}-queue`, autoCreate: true } : { autoCreate: true };
  return new MessageQueue(config);
};