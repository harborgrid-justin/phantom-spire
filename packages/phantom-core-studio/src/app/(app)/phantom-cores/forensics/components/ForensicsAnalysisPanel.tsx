// Forensics Analysis Panel Component

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Biotech as ForensicsIcon,
  Timeline as TimelineIcon,
  Fingerprint as ArtifactIcon,
  Folder as FileIcon,
  CheckCircle as CheckCircleIcon,
  Memory as MemoryIcon
} from '@mui/icons-material';
import { ForensicsAnalysis, EvidenceType, AnalysisMethod } from '../types';
import { analyzeEvidence } from '../api';

const ForensicsAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<ForensicsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('disk_image');
  const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod>('comprehensive');

  const evidenceTypes: EvidenceType[] = [
    'disk_image', 'memory_dump', 'network_capture', 'mobile_device', 'log_files',
    'registry_hives', 'file_system', 'database_files'
  ];

  const analysisMethods: AnalysisMethod[] = [
    'comprehensive', 'timeline_focused', 'artifact_extraction', 'signature_analysis',
    'hash_verification', 'metadata_analysis'
  ];

  const runForensicsAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeEvidence({
        evidence_type: evidenceType,
        analysis_method: analysisMethod,
        case_priority: 'high',
        preserve_chain_of_custody: true,
        include_deleted_files: true,
        deep_analysis: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Forensics analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Forensics Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Evidence Type</InputLabel>
              <Select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                label="Evidence Type"
              >
                {evidenceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Analysis Method</InputLabel>
              <Select
                value={analysisMethod}
                onChange={(e) => setAnalysisMethod(e.target.value as AnalysisMethod)}
                label="Analysis Method"
              >
                {analysisMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<ForensicsIcon />}
              onClick={runForensicsAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Case Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Case ID:</strong> {analysis.case_profile.case_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Evidence Type:</strong> {analysis.case_profile.evidence_type}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Analysis Method:</strong> {analysis.case_profile.analysis_method}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Level:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.case_profile.confidence_level * 100).toFixed(1)}%`}
                      color={analysis.case_profile.confidence_level >= 0.8 ? 'success' :
                             analysis.case_profile.confidence_level >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Key Findings</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ArtifactIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Suspicious executable artifacts discovered"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Timeline reconstruction shows data exfiltration"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FileIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Deleted files recovered and analyzed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MemoryIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Memory artifacts indicate persistence mechanisms"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Forensic Recommendations</Typography>
              <List dense>
                {analysis.recommendations?.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ForensicsAnalysisPanel;
