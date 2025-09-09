// Threat Intelligence Integration Service
// This service integrates with external threat intelligence feeds

interface ThreatFeed {
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
  lastUpdated?: Date;
}

interface ThreatIndicator {
  type: string;
  value: string;
  confidence: number;
  severity: string;
  source: string;
  description?: string;
  tags?: string[];
  firstSeen?: Date;
  lastSeen?: Date;
}

export class ThreatIntelligenceService {
  private feeds: ThreatFeed[] = [
    {
      name: 'AlienVault OTX',
      url: 'https://otx.alienvault.com/api/v1/indicators',
      enabled: true
    },
    {
      name: 'VirusTotal',
      url: 'https://www.virustotal.com/api/v3',
      enabled: true
    },
    {
      name: 'MISP',
      url: 'https://misp.example.com',
      enabled: false
    }
  ];

  // Fetch indicators from enabled threat feeds
  async fetchIndicators(types?: string[]): Promise<ThreatIndicator[]> {
    const indicators: ThreatIndicator[] = [];

    for (const feed of this.feeds) {
      if (!feed.enabled) continue;

      try {
        const feedIndicators = await this.fetchFromFeed(feed, types);
        indicators.push(...feedIndicators);
      } catch (error) {
        console.error(`Error fetching from ${feed.name}:`, error);
      }
    }

    return this.deduplicateIndicators(indicators);
  }

  // Fetch indicators from a specific feed
  private async fetchFromFeed(feed: ThreatFeed, types?: string[]): Promise<ThreatIndicator[]> {
    // Mock implementation - in production, this would make actual API calls
    const mockIndicators: ThreatIndicator[] = [];

    // Simulate different types of indicators based on feed
    switch (feed.name) {
      case 'AlienVault OTX':
        mockIndicators.push(
          {
            type: 'ip',
            value: '185.220.101.1',
            confidence: 0.9,
            severity: 'high',
            source: 'AlienVault OTX',
            description: 'Tor exit node',
            tags: ['tor', 'anonymization'],
            firstSeen: new Date('2024-01-01'),
            lastSeen: new Date()
          },
          {
            type: 'domain',
            value: 'malicious-site.ru',
            confidence: 0.85,
            severity: 'high',
            source: 'AlienVault OTX',
            description: 'Malware distribution domain',
            tags: ['malware', 'c2'],
            firstSeen: new Date('2024-02-01'),
            lastSeen: new Date()
          }
        );
        break;

      case 'VirusTotal':
        mockIndicators.push(
          {
            type: 'hash',
            value: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            confidence: 0.95,
            severity: 'critical',
            source: 'VirusTotal',
            description: 'Ransomware sample',
            tags: ['ransomware', 'crypto'],
            firstSeen: new Date('2024-03-01'),
            lastSeen: new Date()
          }
        );
        break;
    }

    // Filter by types if specified
    if (types && types.length > 0) {
      return mockIndicators.filter(indicator => types.includes(indicator.type));
    }

    return mockIndicators;
  }

  // Remove duplicate indicators
  private deduplicateIndicators(indicators: ThreatIndicator[]): ThreatIndicator[] {
    const seen = new Set<string>();
    const unique: ThreatIndicator[] = [];

    for (const indicator of indicators) {
      const key = `${indicator.type}:${indicator.value}:${indicator.source}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(indicator);
      }
    }

    return unique;
  }

  // Get threat intelligence summary
  async getThreatSummary(): Promise<any> {
    const indicators = await this.fetchIndicators();

    const summary = {
      totalIndicators: indicators.length,
      byType: indicators.reduce((acc: any, ind) => {
        acc[ind.type] = (acc[ind.type] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: indicators.reduce((acc: any, ind) => {
        acc[ind.severity] = (acc[ind.severity] || 0) + 1;
        return acc;
      }, {}),
      topSources: indicators.reduce((acc: any, ind) => {
        acc[ind.source] = (acc[ind.source] || 0) + 1;
        return acc;
      }, {}),
      recentActivity: indicators
        .filter(ind => ind.lastSeen && ind.lastSeen > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length
    };

    return summary;
  }

  // Search for specific indicators
  async searchIndicators(query: string, type?: string): Promise<ThreatIndicator[]> {
    const allIndicators = await this.fetchIndicators();
    let filtered = allIndicators;

    // Filter by type
    if (type) {
      filtered = filtered.filter(ind => ind.type === type);
    }

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(ind =>
        ind.value.toLowerCase().includes(lowerQuery) ||
        ind.description?.toLowerCase().includes(lowerQuery) ||
        ind.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }

  // Get trending threats
  async getTrendingThreats(): Promise<any> {
    const indicators = await this.fetchIndicators();

    // Group by tags and count occurrences
    const tagCounts: { [key: string]: number } = {};
    indicators.forEach(ind => {
      ind.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Get top trending tags
    const trendingTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      trendingTags,
      totalIndicators: indicators.length,
      lastUpdated: new Date()
    };
  }

  // Configure threat feeds
  configureFeed(feedName: string, config: Partial<ThreatFeed>): void {
    const feed = this.feeds.find(f => f.name === feedName);
    if (feed) {
      Object.assign(feed, config);
    }
  }

  // Get available feeds
  getFeeds(): ThreatFeed[] {
    return [...this.feeds];
  }

  // Enable/disable feeds
  setFeedEnabled(feedName: string, enabled: boolean): void {
    const feed = this.feeds.find(f => f.name === feedName);
    if (feed) {
      feed.enabled = enabled;
    }
  }
}

// Export singleton instance
export const threatIntelligence = new ThreatIntelligenceService();
