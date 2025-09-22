export function validateConfig(config: any): string[] {
  const errors: string[] = [];
  
  // Basic validation rules
  if (!config.database?.host) {
    errors.push('Database host is required');
  }
  if (!config.database?.name) {
    errors.push('Database name is required');
  }
  
  return errors;
}
