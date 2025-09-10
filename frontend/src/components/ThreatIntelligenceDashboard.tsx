'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  AlertTriangle, 
  Shield, 
  Search, 
  Target, 
  Activity,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';

interface CVEAnalysisResult {
  cve: {
    id: string;
    description: string;
    cvss_metrics?: {
      base_score: number;
      severity: string;
    };
  };
  assessment: {
    risk_level: string;
    exploitability: number;
    exploit_available: boolean;
    recommendations: string[];
  };
  related_cves: string[];
  threat_actors: string[];
}

interface ThreatActor {
  id: string;
  name: string;
  actor_type: string;
  sophistication_level: string;
  confidence_score: number;
  last_activity: string;
}

interface XDRDashboardData {
  active_threats: number;
  resolved_threats_24h: number;
  overall_risk_score: number;
  detection_rate: number;
  top_threat_types: { [key: string]: number };
  recent_incidents: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    created_at: string;
  }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

export function ThreatIntelligenceDashboard() {
  const [cveAnalysis, setCveAnalysis] = useState<CVEAnalysisResult | null>(null);
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [xdrDashboard, setXdrDashboard] = useState<XDRDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cveId, setCveId] = useState('');

  // API client utility
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api/v1${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API call failed');
    }

    return data.data;
  };

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load XDR dashboard data
      const xdrData = await apiCall('/xdr/dashboard');
      setXdrDashboard(xdrData);

      // Load threat actors
      const actorsData = await apiCall('/threat-actor/search');
      setThreatActors(actorsData.results || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCVE = async () => {
    if (!cveId.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Create a mock CVE object for analysis
      const mockCVE = {
        id: cveId,
        description: `Security vulnerability ${cveId}`,
        published_date: new Date().toISOString(),
        last_modified_date: new Date().toISOString(),
        status: 'published',
        assigner: 'cve@mitre.org',
        tags: [],
        affected_products: [{
          vendor: 'Example Vendor',
          product: 'Example Product',
          version: '1.0.0'
        }],
        references: [],
        cvss_metrics: {
          version: '3.1',
          base_score: 7.5,
          severity: 'high',
          attack_vector: 'network',
          attack_complexity: 'low',
          privileges_required: 'none',
          user_interaction: 'none',
          scope: 'unchanged',
          confidentiality_impact: 'high',
          integrity_impact: 'high',
          availability_impact: 'high'
        }
      };

      const analysis = await apiCall('/cve/analyze', {
        method: 'POST',
        body: JSON.stringify({ cve: mockCVE }),
      });

      setCveAnalysis(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze CVE');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatThreatData = () => {
    if (!xdrDashboard) return [];
    return Object.entries(xdrDashboard.top_threat_types).map(([name, count]) => ({
      name,
      count,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive threat analysis with CVE processing, threat actor intelligence, and XDR capabilities
          </p>
        </div>
        <Button onClick={loadDashboardData} disabled={loading}>
          <Activity className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cve-analysis">CVE Analysis</TabsTrigger>
          <TabsTrigger value="threat-actors">Threat Actors</TabsTrigger>
          <TabsTrigger value="xdr-detection">XDR Detection</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {xdrDashboard && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{xdrDashboard.active_threats}</div>
                  <p className="text-xs text-muted-foreground">
                    {xdrDashboard.resolved_threats_24h} resolved in 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(xdrDashboard.overall_risk_score * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Risk assessment score
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(xdrDashboard.detection_rate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current detection efficiency
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Threat Actors</CardTitle>
                  <Users className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{threatActors.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active threat actors tracked
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Threat Type Distribution Chart */}
          {xdrDashboard && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Type Distribution</CardTitle>
                  <CardDescription>Current threat landscape breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formatThreatData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Incidents</CardTitle>
                  <CardDescription>Latest security events and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {xdrDashboard.recent_incidents.slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{incident.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(incident.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* CVE Analysis Tab */}
        <TabsContent value="cve-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CVE Analysis</CardTitle>
              <CardDescription>Analyze CVEs for threat intelligence and business impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter CVE ID (e.g., CVE-2024-1234)"
                  value={cveId}
                  onChange={(e) => setCveId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeCVE()}
                />
                <Button onClick={analyzeCVE} disabled={loading || !cveId.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </div>

              {cveAnalysis && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{cveAnalysis.cve.id}</CardTitle>
                        <CardDescription>{cveAnalysis.cve.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {cveAnalysis.cve.cvss_metrics && (
                            <div className="flex justify-between">
                              <span>CVSS Score:</span>
                              <Badge variant={getSeverityColor(cveAnalysis.cve.cvss_metrics.severity)}>
                                {cveAnalysis.cve.cvss_metrics.base_score} ({cveAnalysis.cve.cvss_metrics.severity})
                              </Badge>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Risk Level:</span>
                            <Badge variant={getSeverityColor(cveAnalysis.assessment.risk_level)}>
                              {cveAnalysis.assessment.risk_level}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Exploitability:</span>
                            <span>{(cveAnalysis.assessment.exploitability * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Exploit Available:</span>
                            <Badge variant={cveAnalysis.assessment.exploit_available ? 'destructive' : 'default'}>
                              {cveAnalysis.assessment.exploit_available ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {cveAnalysis.assessment.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <AlertTriangle className="mr-2 h-4 w-4 mt-0.5 text-yellow-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Related CVEs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {cveAnalysis.related_cves.slice(0, 5).map((cve) => (
                            <div key={cve} className="text-sm font-mono">{cve}</div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Associated Threat Actors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {cveAnalysis.threat_actors.map((actor) => (
                            <Badge key={actor} variant="outline">{actor}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Actors Tab */}
        <TabsContent value="threat-actors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Actor Intelligence</CardTitle>
              <CardDescription>Active threat actors and their capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatActors.map((actor) => (
                  <Card key={actor.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{actor.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {actor.actor_type} • {actor.sophistication_level} sophistication
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last activity: {new Date(actor.last_activity).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            Confidence: {(actor.confidence_score * 100).toFixed(0)}%
                          </div>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* XDR Detection Tab */}
        <TabsContent value="xdr-detection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>XDR Detection & Response</CardTitle>
              <CardDescription>Extended Detection and Response capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">XDR Integration Ready</h3>
                <p className="text-muted-foreground mb-4">
                  Real-time threat detection, behavioral analytics, and automated response capabilities
                </p>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div>✓ Threat Detection</div>
                  <div>✓ Behavioral Analytics</div>
                  <div>✓ Automated Response</div>
                  <div>✓ Threat Hunting</div>
                  <div>✓ Incident Correlation</div>
                  <div>✓ Real-time Dashboards</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}