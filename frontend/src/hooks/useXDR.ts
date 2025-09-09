// React hook for XDR functionality
import { useState, useCallback } from 'react';

interface XDRResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

interface ThreatIndicator {
  id: string;
  indicator_type: string;
  value: string;
  confidence: number;
  severity: string;
  source: string;
  timestamp: Date;
  tags: string[];
  context: {
    geolocation?: string;
    asn?: string;
    category?: string;
  };
}

interface AccessRequest {
  id: string;
  user_id: string;
  resource: string;
  action: string;
  timestamp: Date;
  context: {
    ip_address?: string;
    user_agent?: string;
    location?: {
      country?: string;
      city?: string;
      trusted?: boolean;
    };
    device_fingerprint?: string;
    session_id?: string;
    risk_factors: string[];
  };
}

interface NetworkTraffic {
  id: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  port: number;
  bytes_sent: number;
  bytes_received: number;
  timestamp: Date;
}

export function useXDR() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processThreatIndicator = useCallback(async (indicator: ThreatIndicator): Promise<XDRResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/xdr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'process_threat',
          data: indicator,
        }),
      });

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const evaluateAccess = useCallback(async (request: AccessRequest): Promise<XDRResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/xdr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'evaluate_access',
          data: request,
        }),
      });

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeTraffic = useCallback(async (traffic: NetworkTraffic): Promise<XDRResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/xdr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_traffic',
          data: traffic,
        }),
      });

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemStatus = useCallback(async (): Promise<XDRResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/xdr');
      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    processThreatIndicator,
    evaluateAccess,
    analyzeTraffic,
    getSystemStatus,
  };
}
