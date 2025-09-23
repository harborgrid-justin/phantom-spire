// Feeds Core Utilities - Helper functions and constants

export function createApiResponse<T>(success: boolean, data?: T, message?: string) {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
    source: 'phantom-feeds-core'
  };
}

export function handleError(error: any) {
  console.error('Feeds API Error:', error);
  return createApiResponse(false, undefined, 'Feeds operation failed');
}

export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const FEED_TYPES = [
  'malware', 'network', 'email', 'url', 'domain', 'reputation', 'vulnerability'
] as const;

export const FEED_SOURCES = [
  'AlienVault OTX', 'MISP', 'ThreatConnect', 'Recorded Future', 'Anomali', 'IBM X-Force'
] as const;