/**
 * Vendor Risk Management Routes
 * Comprehensive routes for all 48 vendor risk management modules
 */

import { Router } from 'express';
import { VendorRiskController } from '../controllers/vendorRisk/vendorRiskController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * Vendor Assessment Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/vendor-assessment/risk-evaluation:
 *   get:
 *     summary: Get comprehensive vendor risk evaluation data
 *     tags: [Vendor Risk - Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Risk evaluation data retrieved successfully
 */
router.get(
  '/vendor-assessment/risk-evaluation',
  VendorRiskController.getRiskEvaluation
);

/**
 * @swagger
 * /api/v1/vendor-risk/vendor-assessment/security-assessment:
 *   get:
 *     summary: Get vendor security assessment results
 *     tags: [Vendor Risk - Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security assessment data retrieved successfully
 */
router.get(
  '/vendor-assessment/security-assessment',
  VendorRiskController.getSecurityAssessment
);

/**
 * @swagger
 * /api/v1/vendor-risk/vendor-assessment/compliance-review:
 *   get:
 *     summary: Get vendor compliance review status
 *     tags: [Vendor Risk - Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compliance review data retrieved successfully
 */
router.get(
  '/vendor-assessment/compliance-review',
  VendorRiskController.getComplianceReview
);

/**
 * @swagger
 * /api/v1/vendor-risk/vendor-assessment/due-diligence:
 *   get:
 *     summary: Get vendor due diligence information
 *     tags: [Vendor Risk - Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Due diligence data retrieved successfully
 */
router.get(
  '/vendor-assessment/due-diligence',
  VendorRiskController.getDueDiligence
);

/**
 * @swagger
 * /api/v1/vendor-risk/vendor-assessment/performance-metrics:
 *   get:
 *     summary: Get vendor performance metrics and KPIs
 *     tags: [Vendor Risk - Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
 */
router.get(
  '/vendor-assessment/performance-metrics',
  VendorRiskController.getPerformanceMetrics
);

/**
 * @swagger
 * /api/v1/vendor-risk/vendor-assessment/financial-stability:
 *   get:
 *     summary: Get vendor financial stability assessment
 *     tags: [Vendor Risk - Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial stability data retrieved successfully
 */
router.get(
  '/vendor-assessment/financial-stability',
  VendorRiskController.getFinancialStability
);

/**
 * Risk Monitoring Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/risk-monitoring/continuous-monitoring:
 *   get:
 *     summary: Get continuous risk monitoring data
 *     tags: [Vendor Risk - Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Continuous monitoring data retrieved successfully
 */
router.get(
  '/risk-monitoring/continuous-monitoring',
  VendorRiskController.getContinuousMonitoring
);

/**
 * @swagger
 * /api/v1/vendor-risk/risk-monitoring/risk-dashboards:
 *   get:
 *     summary: Get risk dashboard metrics and visualizations
 *     tags: [Vendor Risk - Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Risk dashboard data retrieved successfully
 */
router.get(
  '/risk-monitoring/risk-dashboards',
  VendorRiskController.getRiskDashboards
);

/**
 * @swagger
 * /api/v1/vendor-risk/risk-monitoring/alert-management:
 *   get:
 *     summary: Get risk alert management configuration
 *     tags: [Vendor Risk - Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert management data retrieved successfully
 */
router.get(
  '/risk-monitoring/alert-management',
  VendorRiskController.getAlertManagement
);

/**
 * @swagger
 * /api/v1/vendor-risk/risk-monitoring/threshold-configuration:
 *   get:
 *     summary: Get risk threshold configuration settings
 *     tags: [Vendor Risk - Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Threshold configuration retrieved successfully
 */
router.get(
  '/risk-monitoring/threshold-configuration',
  VendorRiskController.getThresholdConfiguration
);

/**
 * @swagger
 * /api/v1/vendor-risk/risk-monitoring/trend-analysis:
 *   get:
 *     summary: Get risk trend analysis and predictions
 *     tags: [Vendor Risk - Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trend analysis data retrieved successfully
 */
router.get(
  '/risk-monitoring/trend-analysis',
  VendorRiskController.getTrendAnalysis
);

/**
 * @swagger
 * /api/v1/vendor-risk/risk-monitoring/escalation-procedures:
 *   get:
 *     summary: Get risk escalation procedures and workflows
 *     tags: [Vendor Risk - Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Escalation procedures retrieved successfully
 */
router.get(
  '/risk-monitoring/escalation-procedures',
  VendorRiskController.getEscalationProcedures
);

/**
 * Contract Management Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/contract-management/contract-templates:
 *   get:
 *     summary: Get vendor contract templates and standards
 *     tags: [Vendor Risk - Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contract templates retrieved successfully
 */
router.get(
  '/contract-management/contract-templates',
  VendorRiskController.getContractTemplates
);

/**
 * @swagger
 * /api/v1/vendor-risk/contract-management/sla-management:
 *   get:
 *     summary: Get SLA management and monitoring data
 *     tags: [Vendor Risk - Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SLA management data retrieved successfully
 */
router.get(
  '/contract-management/sla-management',
  VendorRiskController.getSlaManagement
);

/**
 * @swagger
 * /api/v1/vendor-risk/contract-management/renewal-tracking:
 *   get:
 *     summary: Get contract renewal tracking information
 *     tags: [Vendor Risk - Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Renewal tracking data retrieved successfully
 */
router.get(
  '/contract-management/renewal-tracking',
  VendorRiskController.getRenewalTracking
);

/**
 * @swagger
 * /api/v1/vendor-risk/contract-management/compliance-terms:
 *   get:
 *     summary: Get contract compliance terms and requirements
 *     tags: [Vendor Risk - Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compliance terms retrieved successfully
 */
router.get(
  '/contract-management/compliance-terms',
  VendorRiskController.getComplianceTerms
);

/**
 * @swagger
 * /api/v1/vendor-risk/contract-management/liability-assessment:
 *   get:
 *     summary: Get liability assessment and insurance data
 *     tags: [Vendor Risk - Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liability assessment retrieved successfully
 */
router.get(
  '/contract-management/liability-assessment',
  VendorRiskController.getLiabilityAssessment
);

/**
 * @swagger
 * /api/v1/vendor-risk/contract-management/termination-procedures:
 *   get:
 *     summary: Get contract termination procedures and workflows
 *     tags: [Vendor Risk - Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Termination procedures retrieved successfully
 */
router.get(
  '/contract-management/termination-procedures',
  VendorRiskController.getTerminationProcedures
);

/**
 * Security Compliance Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/security-compliance/security-standards:
 *   get:
 *     summary: Get security standards compliance status
 *     tags: [Vendor Risk - Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security standards data retrieved successfully
 */
router.get(
  '/security-compliance/security-standards',
  VendorRiskController.getSecurityStandards
);

/**
 * @swagger
 * /api/v1/vendor-risk/security-compliance/audit-management:
 *   get:
 *     summary: Get security audit management information
 *     tags: [Vendor Risk - Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit management data retrieved successfully
 */
router.get(
  '/security-compliance/audit-management',
  VendorRiskController.getAuditManagement
);

/**
 * @swagger
 * /api/v1/vendor-risk/security-compliance/certification-tracking:
 *   get:
 *     summary: Get security certification tracking status
 *     tags: [Vendor Risk - Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certification tracking retrieved successfully
 */
router.get(
  '/security-compliance/certification-tracking',
  VendorRiskController.getCertificationTracking
);

/**
 * @swagger
 * /api/v1/vendor-risk/security-compliance/penetration-testing:
 *   get:
 *     summary: Get penetration testing results and schedules
 *     tags: [Vendor Risk - Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Penetration testing data retrieved successfully
 */
router.get(
  '/security-compliance/penetration-testing',
  VendorRiskController.getPenetrationTesting
);

/**
 * @swagger
 * /api/v1/vendor-risk/security-compliance/vulnerability-disclosure:
 *   get:
 *     summary: Get vulnerability disclosure management
 *     tags: [Vendor Risk - Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vulnerability disclosure data retrieved successfully
 */
router.get(
  '/security-compliance/vulnerability-disclosure',
  VendorRiskController.getVulnerabilityDisclosure
);

/**
 * @swagger
 * /api/v1/vendor-risk/security-compliance/incident-response:
 *   get:
 *     summary: Get security incident response procedures
 *     tags: [Vendor Risk - Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incident response data retrieved successfully
 */
router.get(
  '/security-compliance/incident-response',
  VendorRiskController.getIncidentResponse
);

/**
 * Performance Management Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/performance-management/kpi-tracking:
 *   get:
 *     summary: Get KPI tracking and performance metrics
 *     tags: [Vendor Risk - Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPI tracking data retrieved successfully
 */
router.get(
  '/performance-management/kpi-tracking',
  VendorRiskController.getKpiTracking
);

/**
 * @swagger
 * /api/v1/vendor-risk/performance-management/service-level-monitoring:
 *   get:
 *     summary: Get service level monitoring data
 *     tags: [Vendor Risk - Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service level monitoring retrieved successfully
 */
router.get(
  '/performance-management/service-level-monitoring',
  VendorRiskController.getServiceLevelMonitoring
);

/**
 * @swagger
 * /api/v1/vendor-risk/performance-management/performance-benchmarks:
 *   get:
 *     summary: Get performance benchmarks and comparisons
 *     tags: [Vendor Risk - Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance benchmarks retrieved successfully
 */
router.get(
  '/performance-management/performance-benchmarks',
  VendorRiskController.getPerformanceBenchmarks
);

/**
 * @swagger
 * /api/v1/vendor-risk/performance-management/capacity-planning:
 *   get:
 *     summary: Get capacity planning and scaling analysis
 *     tags: [Vendor Risk - Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Capacity planning data retrieved successfully
 */
router.get(
  '/performance-management/capacity-planning',
  VendorRiskController.getCapacityPlanning
);

/**
 * @swagger
 * /api/v1/vendor-risk/performance-management/availability-monitoring:
 *   get:
 *     summary: Get availability monitoring and uptime data
 *     tags: [Vendor Risk - Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability monitoring retrieved successfully
 */
router.get(
  '/performance-management/availability-monitoring',
  VendorRiskController.getAvailabilityMonitoring
);

/**
 * @swagger
 * /api/v1/vendor-risk/performance-management/quality-assurance:
 *   get:
 *     summary: Get quality assurance metrics and reports
 *     tags: [Vendor Risk - Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quality assurance data retrieved successfully
 */
router.get(
  '/performance-management/quality-assurance',
  VendorRiskController.getQualityAssurance
);

/**
 * Financial Risk Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/financial-risk/financial-analysis:
 *   get:
 *     summary: Get comprehensive financial risk analysis
 *     tags: [Vendor Risk - Financial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial analysis data retrieved successfully
 */
router.get(
  '/financial-risk/financial-analysis',
  VendorRiskController.getFinancialAnalysis
);

/**
 * @swagger
 * /api/v1/vendor-risk/financial-risk/cost-management:
 *   get:
 *     summary: Get cost management and optimization data
 *     tags: [Vendor Risk - Financial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cost management data retrieved successfully
 */
router.get(
  '/financial-risk/cost-management',
  VendorRiskController.getCostManagement
);

/**
 * @swagger
 * /api/v1/vendor-risk/financial-risk/budget-tracking:
 *   get:
 *     summary: Get budget tracking and allocation data
 *     tags: [Vendor Risk - Financial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget tracking data retrieved successfully
 */
router.get(
  '/financial-risk/budget-tracking',
  VendorRiskController.getBudgetTracking
);

/**
 * @swagger
 * /api/v1/vendor-risk/financial-risk/payment-monitoring:
 *   get:
 *     summary: Get payment monitoring and cash flow data
 *     tags: [Vendor Risk - Financial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment monitoring data retrieved successfully
 */
router.get(
  '/financial-risk/payment-monitoring',
  VendorRiskController.getPaymentMonitoring
);

/**
 * @swagger
 * /api/v1/vendor-risk/financial-risk/insurance-coverage:
 *   get:
 *     summary: Get insurance coverage and policy data
 *     tags: [Vendor Risk - Financial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insurance coverage data retrieved successfully
 */
router.get(
  '/financial-risk/insurance-coverage',
  VendorRiskController.getInsuranceCoverage
);

/**
 * @swagger
 * /api/v1/vendor-risk/financial-risk/business-continuity:
 *   get:
 *     summary: Get business continuity and resilience planning
 *     tags: [Vendor Risk - Financial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business continuity data retrieved successfully
 */
router.get(
  '/financial-risk/business-continuity',
  VendorRiskController.getBusinessContinuity
);

/**
 * Operational Risk Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/operational-risk/operational-assessments:
 *   get:
 *     summary: Get operational risk assessments
 *     tags: [Vendor Risk - Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operational assessments retrieved successfully
 */
router.get(
  '/operational-risk/operational-assessments',
  VendorRiskController.getOperationalAssessments
);

/**
 * @swagger
 * /api/v1/vendor-risk/operational-risk/business-impact-analysis:
 *   get:
 *     summary: Get business impact analysis reports
 *     tags: [Vendor Risk - Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business impact analysis retrieved successfully
 */
router.get(
  '/operational-risk/business-impact-analysis',
  VendorRiskController.getBusinessImpactAnalysis
);

/**
 * @swagger
 * /api/v1/vendor-risk/operational-risk/dependency-mapping:
 *   get:
 *     summary: Get vendor dependency mapping and analysis
 *     tags: [Vendor Risk - Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dependency mapping data retrieved successfully
 */
router.get(
  '/operational-risk/dependency-mapping',
  VendorRiskController.getDependencyMapping
);

/**
 * @swagger
 * /api/v1/vendor-risk/operational-risk/recovery-planning:
 *   get:
 *     summary: Get recovery planning and disaster response
 *     tags: [Vendor Risk - Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recovery planning data retrieved successfully
 */
router.get(
  '/operational-risk/recovery-planning',
  VendorRiskController.getRecoveryPlanning
);

/**
 * @swagger
 * /api/v1/vendor-risk/operational-risk/change-management:
 *   get:
 *     summary: Get change management processes and controls
 *     tags: [Vendor Risk - Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Change management data retrieved successfully
 */
router.get(
  '/operational-risk/change-management',
  VendorRiskController.getChangeManagement
);

/**
 * @swagger
 * /api/v1/vendor-risk/operational-risk/communication-protocols:
 *   get:
 *     summary: Get communication protocols and procedures
 *     tags: [Vendor Risk - Operational]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Communication protocols retrieved successfully
 */
router.get(
  '/operational-risk/communication-protocols',
  VendorRiskController.getCommunicationProtocols
);

/**
 * Governance Routes (6 endpoints)
 */

/**
 * @swagger
 * /api/v1/vendor-risk/governance/policy-management:
 *   get:
 *     summary: Get governance policy management
 *     tags: [Vendor Risk - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Policy management data retrieved successfully
 */
router.get(
  '/governance/policy-management',
  VendorRiskController.getPolicyManagement
);

/**
 * @swagger
 * /api/v1/vendor-risk/governance/approval-workflows:
 *   get:
 *     summary: Get approval workflows and processes
 *     tags: [Vendor Risk - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval workflows retrieved successfully
 */
router.get(
  '/governance/approval-workflows',
  VendorRiskController.getApprovalWorkflows
);

/**
 * @swagger
 * /api/v1/vendor-risk/governance/documentation-standards:
 *   get:
 *     summary: Get documentation standards and requirements
 *     tags: [Vendor Risk - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documentation standards retrieved successfully
 */
router.get(
  '/governance/documentation-standards',
  VendorRiskController.getDocumentationStandards
);

/**
 * @swagger
 * /api/v1/vendor-risk/governance/reporting-frameworks:
 *   get:
 *     summary: Get reporting frameworks and compliance
 *     tags: [Vendor Risk - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporting frameworks retrieved successfully
 */
router.get(
  '/governance/reporting-frameworks',
  VendorRiskController.getReportingFrameworks
);

/**
 * @swagger
 * /api/v1/vendor-risk/governance/stakeholder-management:
 *   get:
 *     summary: Get stakeholder management information
 *     tags: [Vendor Risk - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stakeholder management retrieved successfully
 */
router.get(
  '/governance/stakeholder-management',
  VendorRiskController.getStakeholderManagement
);

/**
 * @swagger
 * /api/v1/vendor-risk/governance/regulatory-compliance:
 *   get:
 *     summary: Get regulatory compliance status and requirements
 *     tags: [Vendor Risk - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regulatory compliance data retrieved successfully
 */
router.get(
  '/governance/regulatory-compliance',
  VendorRiskController.getRegulatoryCompliance
);

export default router;
