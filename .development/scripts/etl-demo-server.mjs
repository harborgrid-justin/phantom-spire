#!/usr/bin/env node

/**
 * Simple ETL Demo Server
 * Demonstrates the ETL functionality
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

// Mock ETL data
const etlOperations = new Map();

// ETL API endpoints
app.get('/api/etl', (req, res) => {
  res.json({
    success: true,
    message: 'ETL Management Platform',
    categories: [
      { name: 'extraction', title: 'Data Extraction & Ingestion', pageCount: 12 },
      { name: 'transformation', title: 'Data Transformation & Processing', pageCount: 10 },
      { name: 'loading', title: 'Data Loading & Storage', pageCount: 8 },
      { name: 'pipeline', title: 'Pipeline Management & Orchestration', pageCount: 7 },
      { name: 'monitoring', title: 'Monitoring & Analytics', pageCount: 7 },
      { name: 'governance', title: 'Governance & Compliance', pageCount: 5 }
    ],
    totalPages: 49,
    timestamp: new Date().toISOString()
  });
});

// ETL category endpoints
const categories = ['extraction', 'transformation', 'loading', 'pipeline', 'monitoring', 'governance'];

categories.forEach(category => {
  app.get(`/api/etl/${category}`, (req, res) => {
    res.json({
      success: true,
      category,
      operations: Array.from(etlOperations.values()).filter(op => op.category === category),
      totalOperations: Array.from(etlOperations.values()).filter(op => op.category === category).length,
      timestamp: new Date().toISOString()
    });
  });

  app.post(`/api/etl/${category}/execute`, (req, res) => {
    const operationId = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operation = {
      id: operationId,
      category,
      type: req.body.type || 'default',
      status: 'running',
      progress: 0,
      startTime: new Date(),
      configuration: req.body.configuration || {}
    };

    etlOperations.set(operationId, operation);

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        operation.status = 'completed';
        operation.endTime = new Date();
        clearInterval(progressInterval);
      }
      operation.progress = progress;
    }, 1000);

    res.json({
      success: true,
      message: `ETL ${category} operation started`,
      operationId,
      operation
    });
  });

  app.get(`/api/etl/${category}/status`, (req, res) => {
    const categoryOps = Array.from(etlOperations.values()).filter(op => op.category === category);
    res.json({
      success: true,
      category,
      status: 'operational',
      activeOperations: categoryOps.filter(op => op.status === 'running').length,
      completedOperations: categoryOps.filter(op => op.status === 'completed').length,
      totalOperations: categoryOps.length,
      lastUpdate: new Date().toISOString()
    });
  });
});

// Individual operation status
app.get('/api/etl/operation/:id', (req, res) => {
  const operation = etlOperations.get(req.params.id);
  if (operation) {
    res.json({
      success: true,
      operation
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Operation not found'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    etlPlatform: 'operational',
    totalOperations: etlOperations.size
  });
});

// Demo HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ETL Management Platform Demo</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #1976d2; margin: 0; font-size: 2.5rem; }
        .header p { color: #666; margin: 10px 0 0 0; font-size: 1.1rem; }
        .categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .category { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1976d2; }
        .category h3 { margin: 0 0 10px 0; color: #1976d2; }
        .category p { margin: 0 0 10px 0; color: #666; }
        .category .count { font-weight: bold; color: #2e7d32; }
        .demo-section { margin: 30px 0; padding: 20px; background: #e3f2fd; border-radius: 8px; }
        .demo-section h3 { margin: 0 0 15px 0; color: #1565c0; }
        .button { background: #1976d2; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        .button:hover { background: #1565c0; }
        .status { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; border: 1px solid #ddd; }
        .success { color: #2e7d32; font-weight: bold; }
        .error { color: #d32f2f; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 ETL Management Platform</h1>
            <p>Comprehensive Extract, Transform, Load operations with 49 specialized pages</p>
        </div>

        <div class="categories">
            <div class="category">
                <h3>🔌 Data Extraction & Ingestion</h3>
                <p>Source connectors, real-time ingestion, batch extraction, change data capture, API integration, file processing, database replication, web scraping, message queues, cloud storage, streaming platforms, metadata harvesting</p>
                <div class="count">12 pages</div>
            </div>
            <div class="category">
                <h3>🎨 Data Transformation & Processing</h3>
                <p>Visual designer, data mapping, business rules, data enrichment, aggregation engine, format conversion, data cleansing, schema evolution, ML preprocessing, performance optimization</p>
                <div class="count">10 pages</div>
            </div>
            <div class="category">
                <h3>📚 Data Loading & Storage</h3>
                <p>Destination management, bulk loading, incremental loading, parallel processing, data partitioning, compression optimization, indexing strategy, conflict resolution</p>
                <div class="count">8 pages</div>
            </div>
            <div class="category">
                <h3>🎼 Pipeline Management & Orchestration</h3>
                <p>Workflow orchestration, scheduling engine, dependency management, error handling, parallel execution, version control, resource allocation</p>
                <div class="count">7 pages</div>
            </div>
            <div class="category">
                <h3>📊 Monitoring & Analytics</h3>
                <p>Real-time dashboard, performance analytics, alerting system, audit trail, data lineage tracking, quality metrics, cost optimization</p>
                <div class="count">7 pages</div>
            </div>
            <div class="category">
                <h3>🛡️ Governance & Compliance</h3>
                <p>Policy management, compliance monitoring, access control, data classification, retention policies</p>
                <div class="count">5 pages</div>
            </div>
        </div>

        <div class="demo-section">
            <h3>🚀 Live ETL Operations Demo</h3>
            <p>Test the ETL platform functionality by executing operations:</p>
            
            <button class="button" onclick="executeETLOperation('extraction', 'real-time-ingestion')">Execute Real-time Ingestion</button>
            <button class="button" onclick="executeETLOperation('transformation', 'data-mapping')">Execute Data Mapping</button>
            <button class="button" onclick="executeETLOperation('loading', 'bulk-loading')">Execute Bulk Loading</button>
            <button class="button" onclick="executeETLOperation('pipeline', 'workflow-orchestration')">Execute Workflow</button>
            <button class="button" onclick="executeETLOperation('monitoring', 'performance-analytics')">Execute Monitoring</button>
            <button class="button" onclick="executeETLOperation('governance', 'compliance-monitoring')">Execute Compliance Check</button>
            
            <button class="button" onclick="checkETLStatus()">Check Platform Status</button>
            
            <div id="status" class="status"></div>
        </div>

        <div class="demo-section">
            <h3>📈 Platform Statistics</h3>
            <div id="stats">Loading statistics...</div>
        </div>
    </div>

    <script>
        async function executeETLOperation(category, operation) {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = '<div>Executing ' + category + ' operation: ' + operation + '...</div>';
            
            try {
                const response = await fetch(\`/api/etl/\${category}/execute\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        type: operation,
                        configuration: { demo: true, timestamp: new Date().toISOString() }
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    statusDiv.innerHTML = \`
                        <div class="success">✅ Operation Started Successfully</div>
                        <div>Operation ID: \${result.operationId}</div>
                        <div>Category: \${result.operation.category}</div>
                        <div>Type: \${result.operation.type}</div>
                        <div>Status: \${result.operation.status}</div>
                        <div>Progress: \${Math.round(result.operation.progress)}%</div>
                    \`;
                    
                    // Monitor progress
                    monitorOperation(result.operationId);
                } else {
                    statusDiv.innerHTML = '<div class="error">❌ Operation Failed: ' + result.error + '</div>';
                }
            } catch (error) {
                statusDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            }
        }
        
        async function monitorOperation(operationId) {
            const statusDiv = document.getElementById('status');
            
            const monitor = setInterval(async () => {
                try {
                    const response = await fetch(\`/api/etl/operation/\${operationId}\`);
                    const result = await response.json();
                    
                    if (result.success) {
                        const op = result.operation;
                        statusDiv.innerHTML = \`
                            <div class="success">📊 Operation Progress</div>
                            <div>Operation ID: \${op.id}</div>
                            <div>Status: \${op.status}</div>
                            <div>Progress: \${Math.round(op.progress)}%</div>
                            <div>Started: \${new Date(op.startTime).toLocaleString()}</div>
                            \${op.endTime ? '<div>Completed: ' + new Date(op.endTime).toLocaleString() + '</div>' : ''}
                        \`;
                        
                        if (op.status === 'completed') {
                            clearInterval(monitor);
                            statusDiv.innerHTML += '<div class="success">🎉 Operation Completed Successfully!</div>';
                        }
                    }
                } catch (error) {
                    clearInterval(monitor);
                }
            }, 2000);
        }
        
        async function checkETLStatus() {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = '<div>Checking platform status...</div>';
            
            try {
                const response = await fetch('/api/etl');
                const result = await response.json();
                
                if (result.success) {
                    statusDiv.innerHTML = \`
                        <div class="success">✅ Platform Status: Operational</div>
                        <div>Total Categories: \${result.categories.length}</div>
                        <div>Total Pages: \${result.totalPages}</div>
                        <div>Last Check: \${new Date(result.timestamp).toLocaleString()}</div>
                    \`;
                } else {
                    statusDiv.innerHTML = '<div class="error">❌ Platform Status Check Failed</div>';
                }
            } catch (error) {
                statusDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            }
        }
        
        // Load initial stats
        window.onload = async function() {
            try {
                const response = await fetch('/api/etl');
                const result = await response.json();
                
                document.getElementById('stats').innerHTML = \`
                    <div><strong>Platform Status:</strong> Operational ✅</div>
                    <div><strong>Total Categories:</strong> \${result.categories.length}</div>
                    <div><strong>Total Pages:</strong> \${result.totalPages}</div>
                    <div><strong>Last Updated:</strong> \${new Date(result.timestamp).toLocaleString()}</div>
                \`;
            } catch (error) {
                document.getElementById('stats').innerHTML = '<div class="error">Failed to load statistics</div>';
            }
        };
    </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`🔄 ETL Demo Server running on port ${PORT}`);
  console.log(`📊 Access the demo at: http://localhost:${PORT}`);
  console.log(`🚀 API endpoints available at: http://localhost:${PORT}/api/etl`);
  console.log(`💻 Health check: http://localhost:${PORT}/health`);
});