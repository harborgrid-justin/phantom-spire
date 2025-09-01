import { IIOC } from '../models/IOC.js';
import { logger } from '../utils/logger.js';

export interface EnrichmentResult {
  success: boolean;
  metadata: Record<string, any>;
  sources: string[];
  errors: string[];
  confidence: number;
  enrichedAt: Date;
}

export interface GeolocationData {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  organization?: string;
  asn?: string;
  timezone?: string;
}

export interface DomainInfo {
  registrar?: string;
  registrationDate?: Date;
  expirationDate?: Date;
  nameservers?: string[];
  whoisData?: Record<string, any>;
  subdomains?: string[];
  relatedDomains?: string[];
}

export interface HashReputation {
  malicious: boolean;
  detectionRatio?: string;
  scanDate?: Date;
  engines?: {
    name: string;
    result: string;
    detected: boolean;
  }[];
  fileInfo?: {
    size?: number;
    type?: string;
    names?: string[];
  };
}

/**
 * IOC Enrichment Service - Automatic metadata enrichment and reputation scoring
 */
export class IOCEnrichmentService {
  /**
   * Enrich IOC with additional metadata
   */
  static async enrichIOC(ioc: IIOC): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      metadata: {},
      sources: [],
      errors: [],
      confidence: 0,
      enrichedAt: new Date(),
    };

    try {
      // Perform type-specific enrichment
      switch (ioc.type) {
        case 'ip':
          await this.enrichIPAddress(ioc, result);
          break;
        case 'domain':
          await this.enrichDomain(ioc, result);
          break;
        case 'url':
          await this.enrichURL(ioc, result);
          break;
        case 'hash':
          await this.enrichHash(ioc, result);
          break;
        case 'email':
          await this.enrichEmail(ioc, result);
          break;
        default:
          result.errors.push('Unsupported IOC type for enrichment');
      }

      // Calculate enrichment confidence
      result.confidence = this.calculateEnrichmentConfidence(result);
      result.success = result.errors.length === 0 || result.sources.length > 0;

      logger.info(`IOC enrichment completed for ${ioc.type}: ${ioc.value}`, {
        success: result.success,
        sourcesCount: result.sources.length,
        errorsCount: result.errors.length,
      });
    } catch (error) {
      result.errors.push(
        `Enrichment failed: ${error instanceof Error ? error.message : String(error)}`
      );
      logger.error(`IOC enrichment error for ${ioc.value}`, error);
    }

    return result;
  }

  /**
   * Enrich IP address with geolocation and reputation data
   */
  private static async enrichIPAddress(
    ioc: IIOC,
    result: EnrichmentResult
  ): Promise<void> {
    const ipAddress = ioc.value;

    try {
      // Check if it's a private IP
      if (this.isPrivateIP(ipAddress)) {
        result.metadata.isPrivate = true;
        result.metadata.scope = 'private';
        result.sources.push('local_analysis');
        return;
      }

      // Simulate geolocation lookup (in production, use real APIs like MaxMind, ipapi.co)
      const geoData = await this.mockGeolocationLookup(ipAddress);
      if (geoData) {
        result.metadata.geolocation = geoData;
        result.sources.push('geolocation_service');
      }

      // Simulate reputation lookup
      const reputation = await this.mockIPReputationLookup(ipAddress);
      if (reputation) {
        result.metadata.reputation = reputation;
        result.sources.push('reputation_service');
      }

      // ASN and ISP information
      const asnInfo = this.mockASNLookup(ipAddress);
      if (asnInfo) {
        result.metadata.asn = asnInfo;
        result.sources.push('asn_database');
      }

      // Check for known threat intelligence
      const threatIntel = await this.mockThreatIntelLookup(ipAddress, 'ip');
      if (threatIntel) {
        result.metadata.threatIntelligence = threatIntel;
        result.sources.push('threat_intelligence');
      }
    } catch (error) {
      result.errors.push(
        `IP enrichment failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Enrich domain with WHOIS and DNS information
   */
  private static async enrichDomain(
    ioc: IIOC,
    result: EnrichmentResult
  ): Promise<void> {
    const domain = ioc.value;

    try {
      // Simulate WHOIS lookup
      const whoisData = await this.mockWhoisLookup(domain);
      if (whoisData) {
        result.metadata.whois = whoisData;
        result.sources.push('whois_service');
      }

      // Simulate DNS information
      const dnsInfo = await this.mockDNSLookup(domain);
      if (dnsInfo) {
        result.metadata.dns = dnsInfo;
        result.sources.push('dns_service');
      }

      // Check for subdomains
      const subdomains = await this.mockSubdomainLookup(domain);
      if (subdomains && subdomains.length > 0) {
        result.metadata.subdomains = subdomains;
        result.sources.push('subdomain_enumeration');
      }

      // Domain reputation
      const reputation = await this.mockDomainReputationLookup(domain);
      if (reputation) {
        result.metadata.reputation = reputation;
        result.sources.push('domain_reputation');
      }

      // Threat intelligence
      const threatIntel = await this.mockThreatIntelLookup(domain, 'domain');
      if (threatIntel) {
        result.metadata.threatIntelligence = threatIntel;
        result.sources.push('threat_intelligence');
      }
    } catch (error) {
      result.errors.push(
        `Domain enrichment failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Enrich URL with content analysis and reputation
   */
  private static async enrichURL(
    ioc: IIOC,
    result: EnrichmentResult
  ): Promise<void> {
    const url = ioc.value;

    try {
      // Parse URL components
      const urlObj = new URL(url);
      result.metadata.urlComponents = {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
      };
      result.sources.push('url_parsing');

      // Enrich the domain part
      if (urlObj.hostname) {
        const domainResult: EnrichmentResult = {
          success: false,
          metadata: {},
          sources: [],
          errors: [],
          confidence: 0,
          enrichedAt: new Date(),
        };

        await this.enrichDomain(
          { value: urlObj.hostname, type: 'domain' } as IIOC,
          domainResult
        );

        if (domainResult.success) {
          result.metadata.domainInfo = domainResult.metadata;
          result.sources.push(...domainResult.sources.map(s => `domain_${s}`));
        }
      }

      // Simulate URL reputation lookup
      const reputation = await this.mockURLReputationLookup(url);
      if (reputation) {
        result.metadata.reputation = reputation;
        result.sources.push('url_reputation');
      }

      // Analyze URL for suspicious patterns
      const suspiciousPatterns = this.analyzeURLPatterns(url);
      if (suspiciousPatterns.length > 0) {
        result.metadata.suspiciousPatterns = suspiciousPatterns;
        result.sources.push('pattern_analysis');
      }
    } catch (error) {
      result.errors.push(
        `URL enrichment failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Enrich hash with malware analysis
   */
  private static async enrichHash(
    ioc: IIOC,
    result: EnrichmentResult
  ): Promise<void> {
    const hash = ioc.value;

    try {
      // Determine hash type if not already known
      if (!ioc.metadata?.hashType) {
        const hashType = this.detectHashType(hash);
        result.metadata.hashType = hashType;
        result.sources.push('hash_analysis');
      }

      // Simulate malware analysis lookup (like VirusTotal)
      const malwareAnalysis = await this.mockMalwareAnalysisLookup(hash);
      if (malwareAnalysis) {
        result.metadata.malwareAnalysis = malwareAnalysis;
        result.sources.push('malware_analysis');
      }

      // File reputation lookup
      const fileReputation = await this.mockFileReputationLookup(hash);
      if (fileReputation) {
        result.metadata.fileReputation = fileReputation;
        result.sources.push('file_reputation');
      }

      // Threat intelligence for hash
      const threatIntel = await this.mockThreatIntelLookup(hash, 'hash');
      if (threatIntel) {
        result.metadata.threatIntelligence = threatIntel;
        result.sources.push('threat_intelligence');
      }
    } catch (error) {
      result.errors.push(
        `Hash enrichment failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Enrich email address with domain and reputation analysis
   */
  private static async enrichEmail(
    ioc: IIOC,
    result: EnrichmentResult
  ): Promise<void> {
    const email = ioc.value;

    try {
      // Parse email components
      const [localPart, domain] = email.split('@');
      result.metadata.emailComponents = {
        localPart,
        domain,
      };
      result.sources.push('email_parsing');

      // Enrich the domain part
      if (domain) {
        const domainResult: EnrichmentResult = {
          success: false,
          metadata: {},
          sources: [],
          errors: [],
          confidence: 0,
          enrichedAt: new Date(),
        };

        await this.enrichDomain(
          { value: domain, type: 'domain' } as IIOC,
          domainResult
        );

        if (domainResult.success) {
          result.metadata.domainInfo = domainResult.metadata;
          result.sources.push(
            ...domainResult.sources.map(s => `email_domain_${s}`)
          );
        }
      }

      // Check for disposable email services
      if (domain) {
        const isDisposable = this.checkDisposableEmail(domain);
        if (isDisposable) {
          result.metadata.isDisposable = true;
          result.metadata.emailType = 'disposable';
          result.sources.push('disposable_email_check');
        }
      }

      // Email reputation
      const reputation = await this.mockEmailReputationLookup(email);
      if (reputation) {
        result.metadata.reputation = reputation;
        result.sources.push('email_reputation');
      }
    } catch (error) {
      result.errors.push(
        `Email enrichment failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Calculate enrichment confidence based on sources and data quality
   */
  private static calculateEnrichmentConfidence(
    result: EnrichmentResult
  ): number {
    let confidence = 0;
    const maxConfidence = 100;

    // Base confidence for successful enrichment
    if (result.sources.length > 0) {
      confidence += 30;
    }

    // Add confidence for each reliable source
    const reliableSources = [
      'geolocation_service',
      'reputation_service',
      'threat_intelligence',
      'malware_analysis',
    ];
    const reliableSourceCount = result.sources.filter(s =>
      reliableSources.some(rs => s.includes(rs))
    ).length;
    confidence += Math.min(50, reliableSourceCount * 15);

    // Reduce confidence for errors
    confidence -= result.errors.length * 10;

    // Add confidence for rich metadata
    const metadataKeys = Object.keys(result.metadata);
    confidence += Math.min(20, metadataKeys.length * 5);

    return Math.max(0, Math.min(maxConfidence, confidence));
  }

  /**
   * Batch enrichment for multiple IOCs
   */
  static async batchEnrichIOCs(
    iocs: IIOC[]
  ): Promise<Map<string, EnrichmentResult>> {
    const results = new Map<string, EnrichmentResult>();

    // Process IOCs in parallel but with rate limiting
    const batchSize = 5;
    for (let i = 0; i < iocs.length; i += batchSize) {
      const batch = iocs.slice(i, i + batchSize);
      const batchPromises = batch.map(async ioc => {
        const result = await this.enrichIOC(ioc);
        results.set(ioc._id?.toString() || ioc.value, result);
      });

      await Promise.all(batchPromises);

      // Rate limiting delay
      if (i + batchSize < iocs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`Batch enrichment completed for ${iocs.length} IOCs`, {
      successCount: Array.from(results.values()).filter(r => r.success).length,
      errorCount: Array.from(results.values()).filter(r => !r.success).length,
    });

    return results;
  }

  // Private helper methods for mock API calls
  // In production, these would call real external APIs

  private static isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return false;

    return (
      parts[0] === 10 ||
      (parts[0] === 172 &&
        parts[1] !== undefined &&
        parts[1] >= 16 &&
        parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127
    );
  }

  private static async mockGeolocationLookup(
    ip: string
  ): Promise<GeolocationData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock data based on IP pattern
    const hash = ip.split('.').reduce((sum, octet) => sum + parseInt(octet), 0);
    const countries = ['US', 'CN', 'RU', 'DE', 'GB', 'FR', 'JP', 'IN'];
    const countryCode = countries[hash % countries.length];

    if (!countryCode) {
      return null;
    }

    return {
      country: countryCode === 'US' ? 'United States' : countryCode,
      countryCode: countryCode,
      city: 'Unknown',
      isp: 'Example ISP',
      asn: `AS${12345 + (hash % 10000)}`,
    };
  }

  private static async mockIPReputationLookup(ip: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = ip.split('.').reduce((sum, octet) => sum + parseInt(octet), 0);
    const isMalicious = hash % 10 < 3; // 30% chance of being malicious

    return {
      isMalicious,
      riskScore: isMalicious ? 85 : 15,
      categories: isMalicious ? ['malware', 'botnet'] : ['benign'],
      lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    };
  }

  private static mockASNLookup(ip: string): any {
    const hash = ip.split('.').reduce((sum, octet) => sum + parseInt(octet), 0);
    return {
      asn: `AS${12345 + (hash % 10000)}`,
      organization: 'Example Hosting Provider',
      country: 'US',
    };
  }

  private static async mockThreatIntelLookup(
    value: string,
    _type: string
  ): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash = value
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const hasIntel = hash % 5 === 0; // 20% chance of having threat intel

    if (!hasIntel) return null;

    return {
      threatTypes: ['malware', 'phishing'],
      campaigns: [`Campaign-${hash % 1000}`],
      firstSeen: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
      ),
      confidence: 75 + (hash % 25),
    };
  }

  private static async mockWhoisLookup(
    _domain: string
  ): Promise<DomainInfo | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      registrar: 'Example Registrar Inc.',
      registrationDate: new Date(
        Date.now() - Math.random() * 365 * 5 * 24 * 60 * 60 * 1000
      ),
      expirationDate: new Date(
        Date.now() + Math.random() * 365 * 2 * 24 * 60 * 60 * 1000
      ),
      nameservers: ['ns1.example.com', 'ns2.example.com'],
    };
  }

  private static async mockDNSLookup(domain: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      aRecords: ['192.168.1.100', '192.168.1.101'],
      mxRecords: [`mail.${domain}`],
      nsRecords: [`ns1.${domain}`, `ns2.${domain}`],
      txtRecords: ['v=spf1 include:_spf.google.com ~all'],
    };
  }

  private static async mockSubdomainLookup(domain: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 250));

    return [`www.${domain}`, `mail.${domain}`, `api.${domain}`];
  }

  private static async mockDomainReputationLookup(
    domain: string
  ): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = domain
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const isMalicious = hash % 8 < 2; // 25% chance of being malicious

    return {
      isMalicious,
      riskScore: isMalicious ? 80 : 20,
      categories: isMalicious ? ['phishing', 'malware'] : ['benign'],
    };
  }

  private static async mockURLReputationLookup(url: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash = url
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const isMalicious = hash % 6 < 2; // 33% chance of being malicious

    return {
      isMalicious,
      riskScore: isMalicious ? 90 : 10,
      categories: isMalicious
        ? ['phishing', 'malware distribution']
        : ['benign'],
    };
  }

  private static analyzeURLPatterns(url: string): string[] {
    const patterns: string[] = [];

    if (
      url.includes('bit.ly') ||
      url.includes('tinyurl') ||
      url.includes('t.co')
    ) {
      patterns.push('URL shortener');
    }

    if (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(url)) {
      patterns.push('Uses IP address');
    }

    if (url.includes('%') && url.includes('2e')) {
      patterns.push('URL encoding detected');
    }

    if (url.split('/').length > 6) {
      patterns.push('Deeply nested path');
    }

    return patterns;
  }

  private static detectHashType(hash: string): string {
    switch (hash.length) {
      case 32:
        return 'MD5';
      case 40:
        return 'SHA1';
      case 64:
        return 'SHA256';
      case 128:
        return 'SHA512';
      default:
        return 'Unknown';
    }
  }

  private static async mockMalwareAnalysisLookup(
    hash: string
  ): Promise<HashReputation | null> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const hashNum = parseInt(hash.substring(0, 8), 16);
    const isMalicious = hashNum % 7 < 3; // ~43% chance of being malicious

    if (!isMalicious) return null;

    return {
      malicious: true,
      detectionRatio: '15/68',
      scanDate: new Date(),
      engines: [
        { name: 'Avira', result: 'TR/Malware.Gen', detected: true },
        { name: 'Kaspersky', result: 'Trojan.Win32.Malware', detected: true },
        { name: 'McAfee', result: 'Artemis!Malware', detected: true },
      ],
      fileInfo: {
        size: 156000 + (hashNum % 50000),
        type: 'Win32 EXE',
        names: ['malware.exe', 'suspicious.exe'],
      },
    };
  }

  private static async mockFileReputationLookup(hash: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const hashNum = parseInt(hash.substring(0, 8), 16);
    return {
      prevalence: hashNum % 1000,
      firstSeen: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ),
      submissionNames: ['suspicious_file.exe', 'malware_sample.bin'],
    };
  }

  private static checkDisposableEmail(domain: string): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'temp-mail.org',
    ];
    return disposableDomains.some(d => domain.toLowerCase().includes(d));
  }

  private static async mockEmailReputationLookup(email: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = email
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const isMalicious = hash % 10 < 2; // 20% chance of being malicious

    return {
      isMalicious,
      riskScore: isMalicious ? 75 : 25,
      categories: isMalicious ? ['spam', 'phishing'] : ['benign'],
    };
  }
}
