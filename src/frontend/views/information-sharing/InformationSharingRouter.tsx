/**
 * Information Sharing Router
 * Routing configuration for all information sharing components
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Core Sharing Infrastructure
import { ThreatIntelligenceExchangeHub } from './core/ThreatIntelligenceExchangeHub';
import { PartnerCollaborationPortal } from './core/PartnerCollaborationPortal';
import { CommunityThreatFeedManager } from './core/CommunityThreatFeedManager';
import { STIXTAXIIIntegrationCenter } from './core/STIXTAXIIIntegrationCenter';
import { ThreatDataMarketplace } from './core/ThreatDataMarketplace';
import { InformationSharingAgreements } from './core/InformationSharingAgreements';
import { CollaborativeAnalysisWorkbench } from './core/CollaborativeAnalysisWorkbench';
import { SharedIOCDatabase } from './core/SharedIOCDatabase';

// Inter-organizational Collaboration
import { CrossOrganizationalDashboard } from './collaboration/CrossOrganizationalDashboard';
import { JointIncidentResponse } from './collaboration/JointIncidentResponse';
import { SharedThreatHunting } from './collaboration/SharedThreatHunting';

// Community and Public Sharing
import { PublicThreatFeedDirectory } from './community/PublicThreatFeedDirectory';
import { CommunityContributions } from './community/CommunityContributions';
import { OpenSourceIntelligence } from './community/OpenSourceIntelligence';

// Compliance and Governance
import { DataPrivacyControls } from './governance/DataPrivacyControls';
import { RegulatoryComplianceCenter } from './governance/RegulatoryComplianceCenter';
import { SharingAuditTrail } from './governance/SharingAuditTrail';

export const InformationSharingRouter: React.FC = () => {
  return (
    <Routes>
      {/* Default route redirects to exchange hub */}
      <Route path="/" element={<Navigate to="/exchange-hub" replace />} />
      
      {/* Core Sharing Infrastructure Routes */}
      <Route path="/exchange-hub" element={<ThreatIntelligenceExchangeHub />} />
      <Route path="/partner-portal" element={<PartnerCollaborationPortal />} />
      <Route path="/community-feeds" element={<CommunityThreatFeedManager />} />
      <Route path="/stix-taxii" element={<STIXTAXIIIntegrationCenter />} />
      <Route path="/marketplace" element={<ThreatDataMarketplace />} />
      <Route path="/agreements" element={<InformationSharingAgreements />} />
      <Route path="/collaborative-analysis" element={<CollaborativeAnalysisWorkbench />} />
      <Route path="/shared-ioc-database" element={<SharedIOCDatabase />} />
      
      {/* Inter-organizational Collaboration Routes */}
      <Route path="/cross-org-dashboard" element={<CrossOrganizationalDashboard />} />
      <Route path="/joint-incident-response" element={<JointIncidentResponse />} />
      <Route path="/shared-threat-hunting" element={<SharedThreatHunting />} />
      
      {/* Community and Public Sharing Routes */}
      <Route path="/public-feeds" element={<PublicThreatFeedDirectory />} />
      <Route path="/community-contributions" element={<CommunityContributions />} />
      <Route path="/osint-integration" element={<OpenSourceIntelligence />} />
      
      {/* Compliance and Governance Routes */}
      <Route path="/privacy-controls" element={<DataPrivacyControls />} />
      <Route path="/compliance-center" element={<RegulatoryComplianceCenter />} />
      <Route path="/audit-trail" element={<SharingAuditTrail />} />
      
      {/* Placeholder routes for remaining components to be implemented */}
      <Route path="/partner-api-gateway" element={<div>Partner API Gateway - Coming Soon</div>} />
      <Route path="/collaborative-investigations" element={<div>Collaborative Investigations - Coming Soon</div>} />
      <Route path="/threat-actor-sharing" element={<div>Threat Actor Sharing Network - Coming Soon</div>} />
      <Route path="/vulnerability-exchange" element={<div>Vulnerability Intelligence Exchange - Coming Soon</div>} />
      <Route path="/cyber-threat-alliance" element={<div>Cyber Threat Alliance - Coming Soon</div>} />
      <Route path="/threat-commons" element={<div>Threat Intelligence Commons - Coming Soon</div>} />
      <Route path="/crowdsourced-detection" element={<div>Crowdsourced Threat Detection - Coming Soon</div>} />
      <Route path="/public-private-partnership" element={<div>Public Private Partnership - Coming Soon</div>} />
      <Route path="/academic-portal" element={<div>Academic Research Portal - Coming Soon</div>} />
      <Route path="/industry-sharing" element={<div>Industry Sharing Initiatives - Coming Soon</div>} />
      <Route path="/classification-center" element={<div>Information Classification Center - Coming Soon</div>} />
      <Route path="/access-control-matrix" element={<div>Access Control Matrix - Coming Soon</div>} />
      <Route path="/retention-policies" element={<div>Data Retention Policies - Coming Soon</div>} />
      <Route path="/compliance-reporting" element={<div>Compliance Reporting - Coming Soon</div>} />
      <Route path="/governance-dashboard" element={<div>Information Governance Dashboard - Coming Soon</div>} />
    </Routes>
  );
};