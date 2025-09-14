/**
 * Test Data Generators for AutoML Comprehensive Tests
 * Provides realistic datasets for security ML testing scenarios
 */

import { NetworkTrafficData, LogData, FileAnalysisData, UserBehaviorData, ThreatIntelligenceData } from '../../src/types/automl-types.js';

export class AutoMLTestDataGenerator {
  private randomSeed: number = 12345;

  // Seeded random number generator for reproducible tests
  private seededRandom(): number {
    this.randomSeed = (this.randomSeed * 9301 + 49297) % 233280;
    return this.randomSeed / 233280;
  }

  // Generate network traffic data for intrusion detection
  generateNetworkTrafficData(count: number, maliciousRatio: number = 0.1): NetworkTrafficData[] {
    const data: NetworkTrafficData[] = [];
    const maliciousCount = Math.floor(count * maliciousRatio);

    // Generate normal traffic
    for (let i = 0; i < count - maliciousCount; i++) {
      data.push({
        src_ip: this.generateRandomIP(),
        dst_ip: this.generateRandomIP(),
        protocol: this.randomChoice(['TCP', 'UDP', 'ICMP']),
        src_port: Math.floor(this.seededRandom() * 65535) + 1,
        dst_port: this.randomChoice([80, 443, 53, 22, 21, 25, 110, 143, 993, 995]),
        bytes_in: Math.floor(this.seededRandom() * 10000) + 100,
        bytes_out: Math.floor(this.seededRandom() * 50000) + 500,
        duration: this.seededRandom() * 30 + 0.1,
        timestamp: new Date(Date.now() - Math.floor(this.seededRandom() * 86400000)).toISOString()
      });
    }

    // Generate malicious traffic
    for (let i = 0; i < maliciousCount; i++) {
      data.push({
        src_ip: this.generateSuspiciousIP(),
        dst_ip: this.generateRandomIP(),
        protocol: this.randomChoice(['TCP', 'UDP']),
        src_port: Math.floor(this.seededRandom() * 65535) + 1,
        dst_port: this.randomChoice([1433, 3389, 23, 135, 139, 445]), // Suspicious ports
        bytes_in: Math.floor(this.seededRandom() * 100) + 10, // Small payloads
        bytes_out: Math.floor(this.seededRandom() * 1000000) + 10000, // Large responses
        duration: this.seededRandom() * 300 + 60, // Longer duration
        timestamp: new Date(Date.now() - Math.floor(this.seededRandom() * 86400000)).toISOString()
      });
    }

    return this.shuffleArray(data);
  }

  // Generate log data for anomaly detection
  generateLogData(count: number, anomalyRatio: number = 0.05): LogData[] {
    const data: LogData[] = [];
    const anomalyCount = Math.floor(count * anomalyRatio);
    
    const normalMessages = [
      'User logged in successfully',
      'File access granted',
      'Database connection established',
      'Request processed successfully',
      'Session created',
      'Authentication successful'
    ];

    const anomalousMessages = [
      'Multiple failed login attempts detected',
      'Unauthorized access attempt blocked',
      'Suspicious file modification detected',
      'Unusual database query pattern',
      'Potential privilege escalation detected',
      'Abnormal network activity detected'
    ];

    // Generate normal logs
    for (let i = 0; i < count - anomalyCount; i++) {
      const hour = Math.floor(this.seededRandom() * 16) + 6; // Business hours
      data.push({
        timestamp: new Date(Date.now() - Math.floor(this.seededRandom() * 86400000)).toISOString(),
        level: this.randomChoice(['INFO', 'DEBUG', 'WARN']),
        message: this.randomChoice(normalMessages),
        source: this.randomChoice(['auth_service', 'web_server', 'database', 'api_gateway']),
        ip_address: this.generateRandomIP(),
        user_id: `user_${Math.floor(this.seededRandom() * 1000) + 1}`
      });
    }

    // Generate anomalous logs
    for (let i = 0; i < anomalyCount; i++) {
      const hour = Math.floor(this.seededRandom() * 6) + 1; // Off hours
      data.push({
        timestamp: new Date(Date.now() - Math.floor(this.seededRandom() * 86400000)).toISOString(),
        level: this.randomChoice(['ERROR', 'CRITICAL', 'WARN']),
        message: this.randomChoice(anomalousMessages),
        source: this.randomChoice(['security_monitor', 'ids', 'firewall']),
        ip_address: this.generateSuspiciousIP(),
        user_id: this.randomChoice([`admin`, `root`, `system`, undefined])
      });
    }

    return this.shuffleArray(data);
  }

  // Generate file analysis data for malware detection
  generateFileAnalysisData(count: number, malwareRatio: number = 0.2): FileAnalysisData[] {
    const data: FileAnalysisData[] = [];
    const malwareCount = Math.floor(count * malwareRatio);

    const legitExtensions = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'jpg', 'png'];
    const suspiciousExtensions = ['exe', 'scr', 'bat', 'cmd', 'pif', 'com'];

    // Generate legitimate files
    for (let i = 0; i < count - malwareCount; i++) {
      const ext = this.randomChoice(legitExtensions);
      data.push({
        filename: `document_${i}.${ext}`,
        size_bytes: Math.floor(this.seededRandom() * 10000000) + 1000,
        hash_md5: this.generateRandomHash(32),
        hash_sha256: this.generateRandomHash(64),
        file_type: ext,
        created_date: new Date(Date.now() - Math.floor(this.seededRandom() * 30 * 86400000)).toISOString(),
        entropy: this.seededRandom() * 0.3 + 0.4, // Lower entropy for normal files
        pe_sections: ext === 'exe' ? Math.floor(this.seededRandom() * 5) + 3 : undefined,
        imports: ext === 'exe' ? Math.floor(this.seededRandom() * 50) + 10 : undefined,
        strings_count: Math.floor(this.seededRandom() * 500) + 100,
        is_packed: false,
        digital_signature: this.seededRandom() > 0.3
      });
    }

    // Generate malware files
    for (let i = 0; i < malwareCount; i++) {
      const ext = this.randomChoice(suspiciousExtensions);
      data.push({
        filename: `${this.randomChoice(['update', 'installer', 'setup', 'temp'])}_${i}.${ext}`,
        size_bytes: Math.floor(this.seededRandom() * 1000000) + 10000,
        hash_md5: this.generateRandomHash(32),
        hash_sha256: this.generateRandomHash(64),
        file_type: ext,
        created_date: new Date(Date.now() - Math.floor(this.seededRandom() * 7 * 86400000)).toISOString(),
        entropy: this.seededRandom() * 0.3 + 0.7, // Higher entropy for packed/encrypted malware
        pe_sections: Math.floor(this.seededRandom() * 3) + 2, // Fewer sections
        imports: Math.floor(this.seededRandom() * 200) + 100, // More imports
        strings_count: Math.floor(this.seededRandom() * 50) + 5, // Fewer strings
        is_packed: this.seededRandom() > 0.4,
        digital_signature: this.seededRandom() > 0.8 // Rarely signed
      });
    }

    return this.shuffleArray(data);
  }

  // Generate user behavior data for insider threat detection
  generateUserBehaviorData(count: number, threatRatio: number = 0.03): UserBehaviorData[] {
    const data: UserBehaviorData[] = [];
    const threatCount = Math.floor(count * threatRatio);

    // Generate normal user behavior
    for (let i = 0; i < count - threatCount; i++) {
      data.push({
        user_id: `user_${Math.floor(this.seededRandom() * 500) + 1}`,
        login_time_hour: Math.floor(this.seededRandom() * 12) + 7, // 7 AM to 7 PM
        session_duration_minutes: Math.floor(this.seededRandom() * 480) + 120, // 2-10 hours
        pages_visited: Math.floor(this.seededRandom() * 50) + 10,
        files_accessed: Math.floor(this.seededRandom() * 20) + 2,
        emails_sent: Math.floor(this.seededRandom() * 15) + 1,
        unusual_locations: false,
        off_hours_activity: false,
        timestamp: new Date(Date.now() - Math.floor(this.seededRandom() * 30 * 86400000)).toISOString()
      });
    }

    // Generate insider threat behavior
    for (let i = 0; i < threatCount; i++) {
      data.push({
        user_id: `user_${Math.floor(this.seededRandom() * 100) + 1}`,
        login_time_hour: this.randomChoice([1, 2, 3, 22, 23, 0]), // Off hours
        session_duration_minutes: Math.floor(this.seededRandom() * 60) + 15, // Short sessions
        pages_visited: Math.floor(this.seededRandom() * 500) + 100, // Excessive browsing
        files_accessed: Math.floor(this.seededRandom() * 1000) + 200, // Excessive file access
        emails_sent: Math.floor(this.seededRandom() * 3), // Few or no emails
        unusual_locations: this.seededRandom() > 0.6,
        off_hours_activity: true,
        timestamp: new Date(Date.now() - Math.floor(this.seededRandom() * 7 * 86400000)).toISOString()
      });
    }

    return this.shuffleArray(data);
  }

  // Generate threat intelligence data
  generateThreatIntelligenceData(count: number): ThreatIntelligenceData[] {
    const data: ThreatIntelligenceData[] = [];
    
    const threatTypes = ['malware', 'phishing', 'c2', 'botnet', 'apt', 'ransomware'];
    const sources = ['virustotal', 'abuse_ch', 'malware_domains', 'spamhaus', 'emergingthreats'];

    for (let i = 0; i < count; i++) {
      const iocType = this.randomChoice(['ip', 'domain', 'hash', 'url', 'email']);
      let iocValue: string;

      switch (iocType) {
        case 'ip':
          iocValue = this.generateSuspiciousIP();
          break;
        case 'domain':
          iocValue = this.generateSuspiciousDomain();
          break;
        case 'hash':
          iocValue = this.generateRandomHash(64);
          break;
        case 'url':
          iocValue = `http://${this.generateSuspiciousDomain()}/${this.generateRandomString(10)}`;
          break;
        case 'email':
          iocValue = `${this.generateRandomString(8)}@${this.generateSuspiciousDomain()}`;
          break;
        default:
          iocValue = this.generateSuspiciousIP();
      }

      data.push({
        ioc_value: iocValue,
        ioc_type: iocType as any,
        threat_type: this.randomChoice(threatTypes),
        confidence_score: this.seededRandom() * 0.4 + 0.6, // High confidence
        first_seen: new Date(Date.now() - Math.floor(this.seededRandom() * 90 * 86400000)).toISOString(),
        last_seen: new Date(Date.now() - Math.floor(this.seededRandom() * 7 * 86400000)).toISOString(),
        source: this.randomChoice(sources)
      });
    }

    return data;
  }

  // Generate time series data for anomaly detection
  generateTimeSeriesData(count: number, anomalyRatio: number = 0.05): any[] {
    const data: any[] = [];
    const anomalyCount = Math.floor(count * anomalyRatio);
    const anomalyIndices = new Set<number>();

    // Select random indices for anomalies
    while (anomalyIndices.size < anomalyCount) {
      anomalyIndices.add(Math.floor(this.seededRandom() * count));
    }

    const startTime = Date.now() - (count * 60 * 1000); // 1 minute intervals

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(startTime + i * 60 * 1000);
      const isAnomaly = anomalyIndices.has(i);
      
      // Generate seasonal pattern with noise
      const hour = timestamp.getHours();
      const dayOfWeek = timestamp.getDay();
      
      let baseValue = 50;
      // Business hours pattern
      if (hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        baseValue = 80;
      }
      
      // Add some sine wave pattern
      baseValue += Math.sin(i / 10) * 10;
      
      // Add noise
      const noise = (this.seededRandom() - 0.5) * 20;
      let value = baseValue + noise;

      // Make anomalies
      if (isAnomaly) {
        value = value * (this.seededRandom() * 3 + 2); // 2-5x normal value
      }

      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.max(0, value),
        is_anomaly: isAnomaly ? 1 : 0,
        hour_of_day: hour,
        day_of_week: dayOfWeek,
        is_weekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }

    return data;
  }

  // Generate financial transaction data
  generateFinancialTransactionData(count: number, fraudRatio: number = 0.02): any[] {
    const data: any[] = [];
    const fraudCount = Math.floor(count * fraudRatio);

    const merchants = ['grocery', 'gas', 'restaurant', 'retail', 'online', 'pharmacy', 'entertainment'];
    const locations = ['US', 'CA', 'UK', 'FR', 'DE'];

    // Generate normal transactions
    for (let i = 0; i < count - fraudCount; i++) {
      const hour = Math.floor(this.seededRandom() * 16) + 6; // 6 AM to 10 PM
      data.push({
        transaction_id: `txn_${i}`,
        amount: this.seededRandom() * 500 + 10, // $10-$510
        merchant_category: this.randomChoice(merchants),
        transaction_time: new Date(Date.now() - Math.floor(this.seededRandom() * 30 * 86400000)).toISOString(),
        location: this.randomChoice(locations),
        card_type: this.randomChoice(['credit', 'debit']),
        hour_of_day: hour,
        is_weekend: false,
        velocity_1h: Math.floor(this.seededRandom() * 3) + 1,
        location_change: false,
        is_fraud: 0
      });
    }

    // Generate fraudulent transactions
    for (let i = 0; i < fraudCount; i++) {
      const hour = this.randomChoice([1, 2, 3, 22, 23, 0]); // Unusual hours
      data.push({
        transaction_id: `txn_fraud_${i}`,
        amount: this.seededRandom() * 10000 + 1000, // $1000-$11000
        merchant_category: this.randomChoice(['unknown', 'online']),
        transaction_time: new Date(Date.now() - Math.floor(this.seededRandom() * 7 * 86400000)).toISOString(),
        location: 'unknown',
        card_type: this.randomChoice(['credit', 'debit']),
        hour_of_day: hour,
        is_weekend: this.seededRandom() > 0.5,
        velocity_1h: Math.floor(this.seededRandom() * 20) + 5, // High velocity
        location_change: true,
        is_fraud: 1
      });
    }

    return this.shuffleArray(data);
  }

  // Utility methods
  private generateRandomIP(): string {
    // Generate private IP ranges mostly
    const ranges = [
      () => `192.168.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}`,
      () => `10.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}`,
      () => `172.${Math.floor(this.seededRandom() * 16) + 16}.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}`
    ];
    return this.randomChoice(ranges)();
  }

  private generateSuspiciousIP(): string {
    // Generate IPs from suspicious ranges
    const ranges = [
      () => `1.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}`,
      () => `185.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}`,
      () => `91.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}.${Math.floor(this.seededRandom() * 256)}`
    ];
    return this.randomChoice(ranges)();
  }

  private generateSuspiciousDomain(): string {
    const tlds = ['.tk', '.ml', '.ga', '.cf', '.info', '.biz'];
    const prefixes = ['secure', 'login', 'update', 'verify', 'account', 'banking'];
    const base = this.generateRandomString(8);
    return `${this.randomChoice(prefixes)}-${base}${this.randomChoice(tlds)}`;
  }

  private generateRandomHash(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(this.seededRandom() * chars.length));
    }
    return result;
  }

  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(this.seededRandom() * chars.length));
    }
    return result;
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(this.seededRandom() * array.length)];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Generate synthetic datasets for specific ML tasks
  generateClassificationDataset(samples: number, features: number, classes: number = 2): any[] {
    const data = [];
    
    for (let i = 0; i < samples; i++) {
      const record: any = {};
      
      // Generate features
      for (let j = 0; j < features; j++) {
        record[`feature_${j}`] = this.seededRandom() * 10 - 5; // Range -5 to 5
      }
      
      // Generate target based on simple linear combination
      let target = 0;
      for (let j = 0; j < Math.min(3, features); j++) {
        target += record[`feature_${j}`] * (j + 1);
      }
      
      // Add noise and convert to class
      target += (this.seededRandom() - 0.5) * 2;
      record.target = Math.floor(Math.abs(target) % classes);
      
      data.push(record);
    }
    
    return data;
  }

  generateRegressionDataset(samples: number, features: number): any[] {
    const data = [];
    
    for (let i = 0; i < samples; i++) {
      const record: any = {};
      
      // Generate features
      for (let j = 0; j < features; j++) {
        record[`feature_${j}`] = this.seededRandom() * 10 - 5;
      }
      
      // Generate target as linear combination with noise
      let target = 10; // base value
      for (let j = 0; j < features; j++) {
        target += record[`feature_${j}`] * (this.seededRandom() * 2 - 1);
      }
      target += (this.seededRandom() - 0.5) * 5; // noise
      
      record.target = target;
      data.push(record);
    }
    
    return data;
  }

  // Reset seed for reproducible tests
  resetSeed(seed: number = 12345): void {
    this.randomSeed = seed;
  }
}