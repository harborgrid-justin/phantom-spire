/**
 * Support Routes Configuration
 * Configures routing for all 49 support-related pages
 */

import { Router } from 'express';
import {
  customer_portal_dashboardRoutes,
  ticket_submission_wizardRoutes,
  case_status_trackerRoutes,
  customer_communication_centerRoutes,
  service_level_agreement_monitorRoutes,
  customer_satisfaction_feedbackRoutes,
  escalation_management_systemRoutes,
  customer_history_analyticsRoutes,
  priority_queue_managerRoutes,
  customer_onboarding_portalRoutes,
  billing_support_centerRoutes,
  customer_loyalty_programsRoutes,
  technical_diagnostics_centerRoutes,
  remote_support_platformRoutes,
  system_health_monitorRoutes,
  patch_management_centerRoutes,
  technical_documentation_hubRoutes,
  incident_response_toolkitRoutes,
  performance_optimization_suiteRoutes,
  security_vulnerability_scannerRoutes,
  backup_recovery_managerRoutes,
  network_troubleshooting_toolsRoutes,
  software_compatibility_checkerRoutes,
  technical_escalation_boardRoutes,
  help_desk_dashboardRoutes,
  ticket_management_consoleRoutes,
  agent_workbenchRoutes,
  chat_support_interfaceRoutes,
  call_center_integrationRoutes,
  queue_management_systemRoutes,
  agent_performance_analyticsRoutes,
  first_contact_resolution_trackerRoutes,
  multi_language_support_hubRoutes,
  shift_scheduling_systemRoutes,
  call_recording_analyticsRoutes,
  help_desk_reporting_suiteRoutes,
  knowledge_base_portalRoutes,
  article_authoring_systemRoutes,
  content_approval_workflowRoutes,
  knowledge_analytics_dashboardRoutes,
  expert_collaboration_platformRoutes,
  training_materials_managerRoutes,
  faq_management_systemRoutes,
  video_tutorial_platformRoutes,
  knowledge_gap_analyzerRoutes,
  content_versioning_systemRoutes,
  search_optimization_engineRoutes,
  community_forums_platformRoutes,
  knowledge_certification_systemRoutes
} from './support';

const router = Router();

// Customer Support Routes
router.use('/customer-portal-dashboard', customer_portal_dashboardRoutes);
router.use('/ticket-submission-wizard', ticket_submission_wizardRoutes);
router.use('/case-status-tracker', case_status_trackerRoutes);
router.use('/customer-communication-center', customer_communication_centerRoutes);
router.use('/service-level-agreement-monitor', service_level_agreement_monitorRoutes);
router.use('/customer-satisfaction-feedback', customer_satisfaction_feedbackRoutes);
router.use('/escalation-management-system', escalation_management_systemRoutes);
router.use('/customer-history-analytics', customer_history_analyticsRoutes);
router.use('/priority-queue-manager', priority_queue_managerRoutes);
router.use('/customer-onboarding-portal', customer_onboarding_portalRoutes);
router.use('/billing-support-center', billing_support_centerRoutes);
router.use('/customer-loyalty-programs', customer_loyalty_programsRoutes);

// Technical Support Routes
router.use('/technical-diagnostics-center', technical_diagnostics_centerRoutes);
router.use('/remote-support-platform', remote_support_platformRoutes);
router.use('/system-health-monitor', system_health_monitorRoutes);
router.use('/patch-management-center', patch_management_centerRoutes);
router.use('/technical-documentation-hub', technical_documentation_hubRoutes);
router.use('/incident-response-toolkit', incident_response_toolkitRoutes);
router.use('/performance-optimization-suite', performance_optimization_suiteRoutes);
router.use('/security-vulnerability-scanner', security_vulnerability_scannerRoutes);
router.use('/backup-recovery-manager', backup_recovery_managerRoutes);
router.use('/network-troubleshooting-tools', network_troubleshooting_toolsRoutes);
router.use('/software-compatibility-checker', software_compatibility_checkerRoutes);
router.use('/technical-escalation-board', technical_escalation_boardRoutes);

// Help Desk Routes
router.use('/help-desk-dashboard', help_desk_dashboardRoutes);
router.use('/ticket-management-console', ticket_management_consoleRoutes);
router.use('/agent-workbench', agent_workbenchRoutes);
router.use('/chat-support-interface', chat_support_interfaceRoutes);
router.use('/call-center-integration', call_center_integrationRoutes);
router.use('/queue-management-system', queue_management_systemRoutes);
router.use('/agent-performance-analytics', agent_performance_analyticsRoutes);
router.use('/first-contact-resolution-tracker', first_contact_resolution_trackerRoutes);
router.use('/multi-language-support-hub', multi_language_support_hubRoutes);
router.use('/shift-scheduling-system', shift_scheduling_systemRoutes);
router.use('/call-recording-analytics', call_recording_analyticsRoutes);
router.use('/help-desk-reporting-suite', help_desk_reporting_suiteRoutes);

// Knowledge Management Routes
router.use('/knowledge-base-portal', knowledge_base_portalRoutes);
router.use('/article-authoring-system', article_authoring_systemRoutes);
router.use('/content-approval-workflow', content_approval_workflowRoutes);
router.use('/knowledge-analytics-dashboard', knowledge_analytics_dashboardRoutes);
router.use('/expert-collaboration-platform', expert_collaboration_platformRoutes);
router.use('/training-materials-manager', training_materials_managerRoutes);
router.use('/faq-management-system', faq_management_systemRoutes);
router.use('/video-tutorial-platform', video_tutorial_platformRoutes);
router.use('/knowledge-gap-analyzer', knowledge_gap_analyzerRoutes);
router.use('/content-versioning-system', content_versioning_systemRoutes);
router.use('/search-optimization-engine', search_optimization_engineRoutes);
router.use('/community-forums-platform', community_forums_platformRoutes);
router.use('/knowledge-certification-system', knowledge_certification_systemRoutes);

// Health check endpoint for all support services
router.get('/health', async (req, res) => {
  res.json({
    success: true,
    message: 'Support services are operational',
    services: {
      customerSupport: 12,
      technicalSupport: 12,
      helpDesk: 12,
      knowledgeManagement: 13,
      total: 49
    },
    timestamp: new Date().toISOString()
  });
});

export default router;