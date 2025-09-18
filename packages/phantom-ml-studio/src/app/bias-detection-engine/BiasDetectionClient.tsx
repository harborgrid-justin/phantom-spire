'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, Alert } from '@mui/material';
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
        setSelectedReportId(reportsData[0].id);
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

  const selectedReport = biasReports.find(report => report.id === selectedReportId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Bias Detection Engine
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Enterprise AI fairness and bias analysis dashboard
        </Typography>
        
        {analysisRunning && (
          <Alert severity="info" sx={{ mb: 2 }}>
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
            selectedReport={selectedReport}
            onReportSelect={(report) => setSelectedReportId(report.id)}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          {selectedReport ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ReportDetails report={selectedReport} />
              <BiasMetrics metrics={selectedReport.metrics} />
              <FairnessAnalysisComponent analysis={fairnessAnalysis} />
              <MitigationRecommendations report={selectedReport} />
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
        onClose={() => setRunAnalysisOpen(false)}
        onRunAnalysis={handleRunAnalysis}
      />
    </Box>
  );
}