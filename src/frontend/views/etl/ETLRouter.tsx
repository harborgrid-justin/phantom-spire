import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import components
import { SourceConnectors } from './extraction';
import { RealTimeIngestion } from './extraction';
import { BatchExtraction } from './extraction';
import { ChangeDataCapture } from './extraction';
import { ApiIntegration } from './extraction';
import { FileProcessing } from './extraction';
import { DatabaseReplication } from './extraction';
import { WebScraping } from './extraction';
import { MessageQueueIntegration } from './extraction';
import { CloudStorageSync } from './extraction';
import { StreamingPlatforms } from './extraction';
import { MetadataHarvesting } from './extraction';
import { VisualDesigner } from './transformation';
import { DataMapping } from './transformation';
import { BusinessRules } from './transformation';
import { DataEnrichment } from './transformation';
import { AggregationEngine } from './transformation';
import { FormatConversion } from './transformation';
import { DataCleansing } from './transformation';
import { SchemaEvolution } from './transformation';
import { MlPreprocessing } from './transformation';
import { PerformanceOptimization } from './transformation';
import { DestinationManagement } from './loading';
import { BulkLoading } from './loading';
import { IncrementalLoading } from './loading';
import { ParallelProcessing } from './loading';
import { DataPartitioning } from './loading';
import { CompressionOptimization } from './loading';
import { IndexingStrategy } from './loading';
import { ConflictResolution } from './loading';
import { WorkflowOrchestration } from './pipeline';
import { SchedulingEngine } from './pipeline';
import { DependencyManagement } from './pipeline';
import { ErrorHandling } from './pipeline';
import { ParallelExecution } from './pipeline';
import { VersionControl } from './pipeline';
import { ResourceAllocation } from './pipeline';
import { RealTimeDashboard } from './monitoring';
import { PerformanceAnalytics } from './monitoring';
import { AlertingSystem } from './monitoring';
import { AuditTrail } from './monitoring';
import { DataLineage } from './monitoring';
import { QualityMetrics } from './monitoring';
import { CostOptimization } from './monitoring';
import { PolicyManagement } from './governance';
import { ComplianceMonitoring } from './governance';
import { AccessControl } from './governance';
import { DataClassification } from './governance';
import { RetentionPolicies } from './governance';

const ETLDashboard: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'extraction',
      title: 'Extraction',
      description: 'Manage extraction operations',
      icon: '🔌',
      count: 12
    },
    {
      name: 'transformation',
      title: 'Transformation',
      description: 'Manage transformation operations',
      icon: '🎨',
      count: 10
    },
    {
      name: 'loading',
      title: 'Loading',
      description: 'Manage loading operations',
      icon: '🎯',
      count: 8
    },
    {
      name: 'pipeline',
      title: 'Pipeline',
      description: 'Manage pipeline operations',
      icon: '🎼',
      count: 7
    },
    {
      name: 'monitoring',
      title: 'Monitoring',
      description: 'Manage monitoring operations',
      icon: '📊',
      count: 7
    },
    {
      name: 'governance',
      title: 'Governance',
      description: 'Manage governance operations',
      icon: '📜',
      count: 5
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        🔄 ETL Management Platform
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Comprehensive Extract, Transform, Load operations management with 49 specialized pages.
      </Typography>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.name}>
            <Card sx={{ height: '100%', cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                  {category.icon} {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Typography variant="caption" color="primary">
                  {category.count} pages available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const ETLRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ETLDashboard />} />
      <Route path="/extraction/source-connectors" element={<SourceConnectors />} />
      <Route path="/extraction/real-time-ingestion" element={<RealTimeIngestion />} />
      <Route path="/extraction/batch-extraction" element={<BatchExtraction />} />
      <Route path="/extraction/change-data-capture" element={<ChangeDataCapture />} />
      <Route path="/extraction/api-integration" element={<ApiIntegration />} />
      <Route path="/extraction/file-processing" element={<FileProcessing />} />
      <Route path="/extraction/database-replication" element={<DatabaseReplication />} />
      <Route path="/extraction/web-scraping" element={<WebScraping />} />
      <Route path="/extraction/message-queue-integration" element={<MessageQueueIntegration />} />
      <Route path="/extraction/cloud-storage-sync" element={<CloudStorageSync />} />
      <Route path="/extraction/streaming-platforms" element={<StreamingPlatforms />} />
      <Route path="/extraction/metadata-harvesting" element={<MetadataHarvesting />} />
      <Route path="/transformation/visual-designer" element={<VisualDesigner />} />
      <Route path="/transformation/data-mapping" element={<DataMapping />} />
      <Route path="/transformation/business-rules" element={<BusinessRules />} />
      <Route path="/transformation/data-enrichment" element={<DataEnrichment />} />
      <Route path="/transformation/aggregation-engine" element={<AggregationEngine />} />
      <Route path="/transformation/format-conversion" element={<FormatConversion />} />
      <Route path="/transformation/data-cleansing" element={<DataCleansing />} />
      <Route path="/transformation/schema-evolution" element={<SchemaEvolution />} />
      <Route path="/transformation/ml-preprocessing" element={<MlPreprocessing />} />
      <Route path="/transformation/performance-optimization" element={<PerformanceOptimization />} />
      <Route path="/loading/destination-management" element={<DestinationManagement />} />
      <Route path="/loading/bulk-loading" element={<BulkLoading />} />
      <Route path="/loading/incremental-loading" element={<IncrementalLoading />} />
      <Route path="/loading/parallel-processing" element={<ParallelProcessing />} />
      <Route path="/loading/data-partitioning" element={<DataPartitioning />} />
      <Route path="/loading/compression-optimization" element={<CompressionOptimization />} />
      <Route path="/loading/indexing-strategy" element={<IndexingStrategy />} />
      <Route path="/loading/conflict-resolution" element={<ConflictResolution />} />
      <Route path="/pipeline/workflow-orchestration" element={<WorkflowOrchestration />} />
      <Route path="/pipeline/scheduling-engine" element={<SchedulingEngine />} />
      <Route path="/pipeline/dependency-management" element={<DependencyManagement />} />
      <Route path="/pipeline/error-handling" element={<ErrorHandling />} />
      <Route path="/pipeline/parallel-execution" element={<ParallelExecution />} />
      <Route path="/pipeline/version-control" element={<VersionControl />} />
      <Route path="/pipeline/resource-allocation" element={<ResourceAllocation />} />
      <Route path="/monitoring/real-time-dashboard" element={<RealTimeDashboard />} />
      <Route path="/monitoring/performance-analytics" element={<PerformanceAnalytics />} />
      <Route path="/monitoring/alerting-system" element={<AlertingSystem />} />
      <Route path="/monitoring/audit-trail" element={<AuditTrail />} />
      <Route path="/monitoring/data-lineage" element={<DataLineage />} />
      <Route path="/monitoring/quality-metrics" element={<QualityMetrics />} />
      <Route path="/monitoring/cost-optimization" element={<CostOptimization />} />
      <Route path="/governance/policy-management" element={<PolicyManagement />} />
      <Route path="/governance/compliance-monitoring" element={<ComplianceMonitoring />} />
      <Route path="/governance/access-control" element={<AccessControl />} />
      <Route path="/governance/data-classification" element={<DataClassification />} />
      <Route path="/governance/retention-policies" element={<RetentionPolicies />} />
    </Routes>
  );
};

export default ETLRouter;