'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, Alert, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Refresh, Assessment } from '@mui/icons-material';

import { BiasReport, FairnessAnalysis, AnalysisConfig } from './types';
import { BiasReportTable } from './components/BiasReportTable';
import { ReportDetails } from './components/ReportDetails';
import { BiasMetrics } from './components/BiasMetrics';
import { FairnessAnalysis as FairnessAnalysisComponent } from './components/FairnessAnalysis';
import { MitigationRecommendations } from './components/MitigationRecommendations';
import { RunAnalysisDialog } from './components/RunAnalysisDialog';
import { MockDataService } from './services/mockDataService';

export default function BiasDetectionClient() {
  const [biasReports, setBiasReports] = useState<BiasReport[]>([]);
  const [fairnessAnalysis, setFairnessAnalysis] = useState<FairnessAnalysis[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runAnalysisOpen, setRunAnalysisOpen] = useState(false);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    modelId: '',
    protectedAttributes: [],
    sensitivityLevel: 'medium'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const reportsData = MockDataService.generateBiasReports();
      const analysisData = MockDataService.generateFairnessAnalysis();
      
      setBiasReports(reportsData);
      setFairnessAnalysis(analysisData);
      
      if (reportsData.length > 0 && !selectedReportId) {
        setSelectedReportId(reportsData[0]?.id || null);
      }
    } catch (error) {
      console.error('Failed to load bias detection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async (config: AnalysisConfig) => {
    setAnalysisRunning(true);
    setRunAnalysisOpen(false);
    
    try {
      // Simulate analysis running
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadData();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalysisRunning(false);
    }
  };

  const handleConfigChange = (newConfig: AnalysisConfig) => {
    setAnalysisConfig(newConfig);
  };

  const selectedReport = biasReports.find(report => report.id === selectedReportId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" data-cy="page-loading">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }} data-cy="bias-detection-title">
          Bias Detection Engine
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Enterprise AI fairness and bias analysis dashboard
        </Typography>
        
        {analysisRunning && (
          <Alert severity="info" sx={{ mb: 2 }} data-cy="analysis-progress">
            <Box display="flex" alignItems="center" gap={2}>
              <LinearProgress sx={{ flexGrow: 1 }} />
              <Typography variant="body2">Running bias analysis...</Typography>
            </Box>
          </Alert>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Assessment />}
          onClick={() => setRunAnalysisOpen(true)}
          disabled={analysisRunning}
          sx={{ mr: 2 }}
          data-cy="analyze-model"
        >
          Run New Analysis
        </Button>
        <Button
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={loadData} 
          disabled={analysisRunning}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <BiasReportTable
            reports={biasReports}
            selectedReport={selectedReport || null}
            onReportSelect={(report) => setSelectedReportId(report.id)}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          {selectedReport ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ReportDetails report={selectedReport} />
              <BiasMetrics metrics={selectedReport.metrics} />
              
              {/* Bias Visualization */}
              <Card data-cy="bias-visualization">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bias Analysis Visualization
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
                    <svg width="280" height="200" viewBox="0 0 280 200" style={{ backgroundColor: '#f5f5f5' }}>
                      <rect x="20" y="20" width="40" height="120" fill="#2196f3" opacity="0.7" />
                      <rect x="80" y="60" width="40" height="80" fill="#ff9800" opacity="0.7" />
                      <rect x="140" y="40" width="40" height="100" fill="#4caf50" opacity="0.7" />
                      <rect x="200" y="80" width="40" height="60" fill="#f44336" opacity="0.7" />
                      <text x="140" y="180" textAnchor="middle" fontSize="12" fill="#666">
                        Bias Metrics Comparison
                      </text>
                    </svg>
                  </Box>
                </CardContent>
              </Card>
              
              <FairnessAnalysisComponent analysis={fairnessAnalysis} />
              <MitigationRecommendations report={selectedReport} />
              
              {/* Report Generation Section */}
              <Card data-cy="report-generation">
                <CardContent>
                  <Typography variant="h6" gutterBottom data-cy="generate-report">
                    Generate Bias Report
                  </Typography>
                  <Box sx={{ mb: 2 }} data-cy="report-options">
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Report Options:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <input type="checkbox" id="include-visualizations" data-cy="include-visualizations" defaultChecked />
                      <label htmlFor="include-visualizations" style={{ fontSize: '14px', marginRight: '16px' }}>
                        Include Visualizations
                      </label>
                      <input type="checkbox" id="include-recommendations" data-cy="include-recommendations" defaultChecked />
                      <label htmlFor="include-recommendations" style={{ fontSize: '14px' }}>
                        Include Recommendations
                      </label>
                    </Box>
                  </Box>
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      // Simulate report generation
                      setTimeout(() => {
                        const reportElement = document.querySelector('[data-cy="report-generated"]');
                        if (reportElement) {
                          (reportElement as HTMLElement).style.display = 'block';
                        }
                      }, 1000);
                    }}
                    data-cy="generate-bias-report"
                  >
                    Generate Report
                  </Button>
                  <Box sx={{ mt: 2, display: 'none' }} data-cy="report-generated">
                    <Alert severity="success">
                      <Typography variant="body2">
                        Bias report generated successfully! Check your downloads folder.
                      </Typography>
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Select a report to view details
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <RunAnalysisDialog
        open={runAnalysisOpen}
        config={analysisConfig}
        onClose={() => setRunAnalysisOpen(false)}
        onConfigChange={handleConfigChange}
        onRunAnalysis={() => handleRunAnalysis(analysisConfig)}
      />
    </Box>
  );
}
