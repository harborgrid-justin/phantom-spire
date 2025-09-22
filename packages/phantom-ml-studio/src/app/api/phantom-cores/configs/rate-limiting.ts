export interface RateLimitingConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}
