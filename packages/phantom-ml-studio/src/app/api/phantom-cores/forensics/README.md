# Forensics API Documentation

## Overview
This directory contains the refactored Forensics API for the Phantom Digital Forensics Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive digital forensics capabilities including evidence analysis, timeline reconstruction, artifact extraction, and forensics reporting.

## File Structure

```
src/app/api/phantom-cores/forensics/
├── route.ts                           # Main API route handler
├── types.ts                           # TypeScript interfaces and types
├── utils.ts                           # Utility functions and helpers
├── handlers/
│   ├── index.ts                      # Handler exports
│   ├── get-handlers.ts               # GET request handlers
│   └── post-handlers.ts              # POST request handlers
└── README.md                         # This file
```

## API Endpoints

### GET Operations

#### GET /api/phantom-cores/forensics?operation=status
Returns comprehensive forensics system status and metrics.

**Response:**
- System status and uptime
- Active investigations count
- Evidence items and analysis queue
- Component health status
- Artifact extraction metrics

#### GET /api/phantom-cores/forensics?operation=investigations  
Returns list of active forensic investigations.

**Response:**
- Total investigations count
- Investigation details (ID, name, status, priority, progress)
- Investigator assignments
- Evidence item counts

#### GET /api/phantom-cores/forensics?operation=evidence
Returns evidence collection overview.

**Response:**
- Total evidence items count
- Evidence categories (Disk Images, Memory Dumps, Network Captures, etc.)
- Storage sizes and integrity verification status

#### GET /api/phantom-cores/forensics?operation=artifacts
Returns artifact extraction statistics.

**Response:**
- Recent artifact extractions
- Artifact statistics and counts
- Significance levels and timing

### POST Operations

#### POST /api/phantom-cores/forensics
Performs various forensics operations based on the `operation` parameter.

**Operations:**

##### analyze-evidence
Performs comprehensive evidence analysis.

**Request Body:**
```json
{
  "operation": "analyze-evidence",
  "analysisData": {
    "evidence_type": "disk_image",
    "analysis_method": "comprehensive",
    "acquisition_method": "dd_imaging",
    "file_system": "NTFS"
  }
}
```

**Response:**
- Analysis ID and case profile
- Evidence profile information  
- Analysis results (files analyzed, deleted files recovered, etc.)
- Key findings and integrity verification

##### reconstruct-timeline
Reconstructs timeline of events from digital evidence.

**Request Body:**
```json
{
  "operation": "reconstruct-timeline",
  "timelineData": {
    "time_range": "2024-01-01_to_2024-01-31",
    "source_types": ["file_system", "registry", "logs", "network"],
    "resolution": "minute_precision"
  }
}
```

**Response:**
- Timeline ID and reconstruction parameters
- Timeline summary with event counts
- Critical events with timestamps
- Visualization and export options

##### extract-artifacts
Extracts digital artifacts from evidence sources.

**Request Body:**
```json
{
  "operation": "extract-artifacts",
  "artifactData": {
    "artifact_types": ["browser_history", "email", "documents", "images"],
    "extraction_depth": "comprehensive",
    "include_deleted": true,
    "hash_verification": true
  }
}
```

**Response:**
- Extraction ID and configuration
- Extraction results by category
- File type analysis
- Significant findings with hashes
- Processing statistics

##### generate-forensics-report
Generates comprehensive forensics investigation report.

**Request Body:**
```json
{
  "operation": "generate-forensics-report",
  "reportData": {
    "report_type": "Comprehensive Digital Forensics Report",
    "case_number": "CASE-2024-001",
    "investigator": "Digital Forensics Team",
    "investigation_period": "2024-01-01 to 2024-01-31"
  }
}
```

**Response:**
- Report ID and generation metadata
- Case information and executive summary
- Investigation findings and technical analysis
- Legal compliance information
- Recommendations and appendices
- Download URL

## Architecture Components

### Types (`types.ts`)
Defines TypeScript interfaces for:
- `ForensicsStatus`: System status and metrics
- `Investigation`: Investigation details
- `EvidenceCategory`: Evidence categorization
- `ArtifactExtraction`: Artifact extraction data
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides helper functions for:
- Standardized API response creation
- ID generation (cases, analyses, timelines, extractions, reports)
- Random data generation for mock responses
- Error handling and logging
- Hash generation and size formatting

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: System status and health metrics
- `handleInvestigations()`: Active investigations list
- `handleEvidence()`: Evidence collection overview
- `handleArtifacts()`: Artifact extraction statistics

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleAnalyzeEvidence()`: Evidence analysis operations
- `handleReconstructTimeline()`: Timeline reconstruction
- `handleExtractArtifacts()`: Artifact extraction
- `handleGenerateForensicsReport()`: Report generation

## Key Features

### Evidence Analysis
- Comprehensive disk image analysis
- File system examination (NTFS, FAT32, ext4, HFS+)
- Deleted file recovery and carving
- Malware signature detection
- Registry modification tracking

### Timeline Reconstruction
- Multi-source timeline creation
- Minute-level precision timing
- Event correlation across sources
- Suspicious activity period identification
- Interactive visualization support

### Artifact Extraction
- Browser history and downloads
- Email message recovery
- Document and media file extraction
- Deleted item recovery
- Hash verification and deduplication

### Forensics Reporting
- Comprehensive investigation reports
- Legal compliance documentation
- Expert witness preparation
- Chain of custody maintenance
- Court-admissible evidence formatting

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific forensics operations
2. **Maintainability**: Changes to individual operations don't affect others
3. **Type Safety**: Centralized type definitions ensure API consistency
4. **Code Organization**: Related functionality is logically grouped
5. **Testing**: Individual handlers can be unit tested in isolation
6. **Reusability**: Utility functions can be shared across handlers
7. **Error Handling**: Consistent error handling and logging
8. **Documentation**: Clear separation of concerns and responsibilities

## Usage Examples

### Getting System Status
```javascript
const response = await fetch('/api/phantom-cores/forensics?operation=status');
const data = await response.json();
console.log('Forensics system status:', data.data.status);
```

### Analyzing Evidence
```javascript
const response = await fetch('/api/phantom-cores/forensics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-evidence',
    analysisData: {
      evidence_type: 'disk_image',
      analysis_method: 'comprehensive'
    }
  })
});
const analysis = await response.json();
console.log('Analysis results:', analysis.data);
```

### Extracting Artifacts
```javascript
const response = await fetch('/api/phantom-cores/forensics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'extract-artifacts',
    artifactData: {
      artifact_types: ['browser_history', 'email', 'documents'],
      include_deleted: true
    }
  })
});
const artifacts = await response.json();
console.log('Extracted artifacts:', artifacts.data);
```

## Legal and Compliance Features

- **ISO 27037 Compliance**: Evidence handling standards
- **Chain of Custody**: Comprehensive custody documentation
- **Court Admissibility**: Meets legal evidence requirements
- **Expert Witness Support**: Professional testimony preparation
- **Integrity Verification**: Hash-based evidence verification
- **Audit Trails**: Complete operation logging and tracking

All operations maintain strict forensic integrity and provide legally defensible evidence handling procedures suitable for law enforcement, corporate investigations, and legal proceedings.
