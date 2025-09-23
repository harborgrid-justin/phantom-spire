# Threat Actor Management Dashboard

## Overview
This directory contains the refactored Threat Actor Management Dashboard, broken down into smaller, more manageable files for better maintainability and code organization. The dashboard provides comprehensive threat actor profiling, tracking, and attribution capabilities.

## File Structure

```
src/app/phantom-cores/threat-actor/
├── page.tsx                               # Main dashboard component
├── types.ts                               # TypeScript interfaces and types
├── api.ts                                 # API functions for threat actor operations
├── components/
│   ├── index.ts                          # Component exports
│   ├── ThreatActorOverview.tsx           # System status and metrics overview
│   ├── ThreatActorProfilingPanel.tsx     # Actor profiling interface
│   └── ThreatActorOperationsPanel.tsx    # Operations execution panel
└── README.md                             # This file
```

## Components

### Main Dashboard (`page.tsx`)
- Contains the main layout and header
- Manages system status loading and error states
- Imports and orchestrates the three main components

### Types (`types.ts`)
- `ThreatActorStatus`: Interface for system status and metrics
- `ThreatActorProfile`: Interface for detailed actor profiles
- `ProfileThreatActorRequest`: Request parameters for actor profiling
- `CampaignTrackingRequest`: Request parameters for campaign tracking
- `AttributionAnalysisRequest`: Request parameters for attribution analysis
- `ThreatIntelligenceRequest`: Request parameters for intelligence generation
- `Operation`: Interface for operation definitions

### API Functions (`api.ts`)
- `fetchThreatActorStatus()`: Retrieves system status and metrics
- `profileThreatActor()`: Profiles threat actors based on criteria
- `trackCampaign()`: Tracks and analyzes threat campaigns
- `analyzeAttribution()`: Performs attribution analysis
- `generateThreatIntelligence()`: Generates intelligence reports

### Components

#### ThreatActorOverview (`components/ThreatActorOverview.tsx`)
- Displays system status and health metrics
- Shows attribution confidence with circular progress
- Displays counts of tracked actors and active campaigns
- Provides uptime information

#### ThreatActorProfilingPanel (`components/ThreatActorProfilingPanel.tsx`)
- Interactive threat actor profiling interface
- Dropdown selectors for actor type and target sector
- Displays comprehensive actor profiles including:
  - Actor information (name, aliases, type, motivation)
  - Threat assessment (level, confidence score)
  - Capabilities (skills, resources)
  - Target sectors and attack vectors

#### ThreatActorOperationsPanel (`components/ThreatActorOperationsPanel.tsx`)
- Executes various threat actor operations
- Provides three main operations:
  - **Campaign Tracking**: Monitor ongoing threat campaigns
  - **Attribution Analysis**: Analyze incident attribution
  - **Threat Intelligence**: Generate intelligence reports
- Displays operation results in expandable accordions

## Key Features

### Threat Actor Profiling
- Comprehensive actor analysis based on type and target sector
- Multi-source intelligence gathering (OSINT, malware analysis, infrastructure)
- Attribution methods: behavioral, technical, infrastructure
- Confidence scoring and threat level assessment

### Campaign Tracking
- Global scope campaign monitoring
- Actor indicator tracking (phishing, C2 infrastructure, malware signatures)
- 90-day analysis periods
- Enterprise-focused targeting analysis

### Attribution Analysis
- Attack pattern correlation
- Infrastructure IOC analysis
- Malware family attribution
- Confidence threshold configuration

### Intelligence Generation
- Threat actor landscape reports
- Enterprise threat focus
- 12-month historical analysis
- Comprehensive threat intelligence output

## Benefits of Refactoring

1. **Modularity**: Each component handles a specific aspect of threat actor management
2. **Reusability**: Components can be independently reused or tested
3. **Maintainability**: Changes to individual features don't affect others
4. **Type Safety**: Centralized type definitions ensure consistency
5. **Code Organization**: Related functionality is logically grouped
6. **Performance**: Smaller components load and render more efficiently

## Usage

The dashboard provides enterprise-level threat actor management capabilities:

1. **Monitor System Health**: View real-time status and metrics
2. **Profile Threat Actors**: Generate detailed actor profiles based on intelligence
3. **Track Campaigns**: Monitor and analyze ongoing threat campaigns
4. **Analyze Attribution**: Perform incident attribution analysis
5. **Generate Intelligence**: Create comprehensive threat intelligence reports

All operations integrate with the phantom-threat-actor-core backend system for enterprise-grade threat intelligence and attribution capabilities.
