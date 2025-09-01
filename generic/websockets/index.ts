/**
 * Generic WebSocket Server - Revolutionary Plug-and-Play Module
 */

export * from './core/WebSocketServer';
export { WebSocketServer as default } from './core/WebSocketServer';

// Revolutionary zero-config entry points
export const createWebSocketServer = (config?: any) => {
  const { WebSocketServer } = require('./core/WebSocketServer');
  return new WebSocketServer(config || {});
};

export const autoWebSocketServer = () => {
  const { WebSocketServer } = require('./core/WebSocketServer');
  return new WebSocketServer({
    autoStart: true,
    autoChannels: true,
    port: process.env.WS_PORT || 8080
  });
};