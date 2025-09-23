export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  format: 'json' | 'text';
  enableConsole: boolean;
  enableFile: boolean;
  enableSyslog: boolean;
  filePath?: string;
  maxFileSize: string;
  maxFiles: number;
  enableAuditLog: boolean;
}
