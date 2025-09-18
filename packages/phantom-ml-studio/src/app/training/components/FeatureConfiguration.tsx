/**
 * Feature Configuration Step Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  FormControlLabel,
  Switch,
  Checkbox,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Info as InfoIcon,
  AutoAwesome as AutoFeatureIcon,
  Tune as TuneIcon,
  Analytics as AnalyticsIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Dataset, Feature, FeatureEngineering } from '../types';

interface FeatureConfigurationProps {
  selectedDataset: Dataset | null;
  features: Feature[];
  selectedFeatures: string[];
  onFeatureToggle: (featureId: string) => void;
  featureEngineering: FeatureEngineering;
  onFeatureEngineeringChange: (config: Partial<FeatureEngineering>) => void;
  autoFeatureSelection: boolean;
  onAutoFeatureSelectionToggle: (enabled: boolean) => void;
}

const getFeatureTypeColor = (type: Feature['type']) => {
  switch (type) {
    case 'numeric': return 'primary';
    case 'categorical': return 'secondary';
    case 'boolean': return 'success';
    case 'datetime': return 'warning';
    case 'text': return 'info';
    default: return 'default';
  }
};

const getImportanceColor = (importance: Feature['importance']) => {
  if (importance >= 0.8) return 'success';
  if (importance >= 0.5) return 'warning';
  return 'error';
};

export default function FeatureConfiguration({
  selectedDataset,
  features,
  selectedFeatures,
  onFeatureToggle,
  featureEngineering,
  onFeatureEngineeringChange,
  autoFeatureSelection,
  onAutoFeatureSelectionToggle
}: FeatureConfigurationProps) {
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('features');

  const featureStats = useMemo(() => {
    const selected = features.filter(f => selectedFeatures.includes(f.id));
    const byType = selected.reduce((acc, feature) => {
      acc[feature.type] = (acc[feature.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgImportance = selected.length > 0 
      ? selected.reduce((sum, f) => sum + f.importance, 0) / selected.length 
      : 0;

    return {
      total: selected.length,
      byType,
      avgImportance: Math.round(avgImportance * 100) / 100
    };
  }, [features, selectedFeatures]);

  if (!selectedDataset) {
    return (
      <Alert severity="warning">
        Please select a dataset first to configure features.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Features
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select and engineer features for your model. Feature selection significantly impacts model performance.
      </Typography>

      {/* Feature Selection Summary */}
      <Card sx={{ mb: 3 }} data-cy="feature-summary-card">
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {featureStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Features Selected
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {featureStats.avgImportance}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Importance
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {Object.entries(featureStats.byType).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${count} ${type}`}
                    color={getFeatureTypeColor(type as Feature['type'])}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Auto Feature Selection */}
      <Card sx={{ mb: 3 }} data-cy="auto-feature-card">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoFeatureIcon />
              <Typography variant="h6">
                Automatic Feature Selection
              </Typography>
            </Box>
            <Switch
              checked={autoFeatureSelection}
              onChange={(e) => onAutoFeatureSelectionToggle(e.target.checked)}
              data-cy="auto-feature-toggle"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Automatically select the most important features based on statistical analysis and correlation.
          </Typography>
          {autoFeatureSelection && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Auto feature selection is enabled. The system will select optimal features automatically.
            </Alert>
          )}
        </CardContent>
      </Card>

      {!autoFeatureSelection && (
        <>
          {/* Feature List */}
          <Accordion 
            expanded={expandedAccordion === 'features'}
            onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? 'features' : false)}
            sx={{ mb: 2 }}
            data-cy="features-accordion"
          >
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon />
                <Typography variant="h6">
                  Feature Selection ({features.length} available)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Select</TableCell>
                      <TableCell>Feature</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Importance</TableCell>
                      <TableCell>Missing %</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {features.map((feature) => (
                      <TableRow 
                        key={feature.id}
                        sx={{ 
                          backgroundColor: selectedFeatures.includes(feature.id) 
                            ? 'action.selected' 
                            : 'transparent' 
                        }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedFeatures.includes(feature.id)}
                            onChange={() => onFeatureToggle(feature.id)}
                            data-cy={`feature-checkbox-${feature.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {feature.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {feature.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={feature.type}
                            color={getFeatureTypeColor(feature.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={feature.importance * 100}
                              color={getImportanceColor(feature.importance)}
                              sx={{ width: 60, height: 6 }}
                            />
                            <Typography variant="caption">
                              {Math.round(feature.importance * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {Math.round(feature.missingPercentage * 100)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Feature Details">
                            <IconButton size="small">
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* Feature Engineering */}
          <Accordion 
            expanded={expandedAccordion === 'engineering'}
            onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? 'engineering' : false)}
            sx={{ mb: 2 }}
            data-cy="feature-engineering-accordion"
          >
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon />
                <Typography variant="h6">
                  Feature Engineering
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={featureEngineering.scaling}
                        onChange={(e) => onFeatureEngineeringChange({ scaling: e.target.checked })}
                      />
                    }
                    label="Feature Scaling"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Normalize numerical features to improve model performance
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Scaling Method</InputLabel>
                    <Select
                      value={featureEngineering.scalingMethod}
                      label="Scaling Method"
                      onChange={(e) => onFeatureEngineeringChange({ 
                        scalingMethod: e.target.value as FeatureEngineering['scalingMethod']
                      })}
                      disabled={!featureEngineering.scaling}
                    >
                      <MenuItem value="standard">Standard (Z-score)</MenuItem>
                      <MenuItem value="minmax">Min-Max</MenuItem>
                      <MenuItem value="robust">Robust</MenuItem>
                      <MenuItem value="normalizer">Normalizer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={featureEngineering.encoding}
                        onChange={(e) => onFeatureEngineeringChange({ encoding: e.target.checked })}
                      />
                    }
                    label="Categorical Encoding"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Encode categorical variables for machine learning
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Encoding Method</InputLabel>
                    <Select
                      value={featureEngineering.encodingMethod}
                      label="Encoding Method"
                      onChange={(e) => onFeatureEngineeringChange({ 
                        encodingMethod: e.target.value as FeatureEngineering['encodingMethod']
                      })}
                      disabled={!featureEngineering.encoding}
                    >
                      <MenuItem value="onehot">One-Hot</MenuItem>
                      <MenuItem value="label">Label</MenuItem>
                      <MenuItem value="target">Target</MenuItem>
                      <MenuItem value="ordinal">Ordinal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={featureEngineering.polynomialFeatures}
                        onChange={(e) => onFeatureEngineeringChange({ polynomialFeatures: e.target.checked })}
                      />
                    }
                    label="Polynomial Features"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Generate polynomial and interaction features
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Polynomial Degree"
                    value={featureEngineering.polynomialDegree}
                    onChange={(e) => onFeatureEngineeringChange({ polynomialDegree: parseInt(e.target.value) })}
                    disabled={!featureEngineering.polynomialFeatures}
                    inputProps={{ min: 2, max: 5 }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={featureEngineering.pca}
                        onChange={(e) => onFeatureEngineeringChange({ pca: e.target.checked })}
                      />
                    }
                    label="Principal Component Analysis (PCA)"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Reduce dimensionality while preserving most important information
                  </Typography>
                  {featureEngineering.pca && (
                    <TextField
                      sx={{ mt: 1 }}
                      type="number"
                      label="Components (% variance to preserve)"
                      value={featureEngineering.pcaComponents}
                      onChange={(e) => onFeatureEngineeringChange({ pcaComponents: parseFloat(e.target.value) })}
                      inputProps={{ min: 0.5, max: 0.99, step: 0.01 }}
                      helperText="0.95 = preserve 95% of variance"
                    />
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Feature Analysis */}
          <Accordion 
            expanded={expandedAccordion === 'analysis'}
            onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? 'analysis' : false)}
            data-cy="feature-analysis-accordion"
          >
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon />
                <Typography variant="h6">
                  Feature Analysis
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                Feature correlation analysis and importance ranking will be performed during training.
              </Alert>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        High Importance Features
                      </Typography>
                      {features
                        .filter(f => f.importance >= 0.7)
                        .slice(0, 5)
                        .map(feature => (
                          <Box key={feature.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{feature.name}</Typography>
                            <Typography variant="body2" color="success.main">
                              {Math.round(feature.importance * 100)}%
                            </Typography>
                          </Box>
                        ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Features with Missing Data
                      </Typography>
                      {features
                        .filter(f => f.missingPercentage > 0)
                        .slice(0, 5)
                        .map(feature => (
                          <Box key={feature.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{feature.name}</Typography>
                            <Typography variant="body2" color="warning.main">
                              {Math.round(feature.missingPercentage * 100)}%
                            </Typography>
                          </Box>
                        ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Box>
  );
}