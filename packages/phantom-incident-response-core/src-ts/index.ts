import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentCategory,
  ResponderRole,
  EvidenceType,
  PlaybookStatus,
  CommunicationChannel,
  TimelineEvent,
  Responder,
  Evidence,
  Task,
  Communication,
  ImpactAssessment,
  ContainmentAction,
  EradicationAction,
  RecoveryAction,
  LessonLearned,
  ExternalNotification,
  ResponsePlaybook,
  PlaybookStep,
  PlaybookExecution,
  StepExecution,
  ForensicInvestigation,
  ForensicFinding,
  Attribution,
  IncidentMetrics,
  IncidentSearchFilters,
  ResponderSearchFilters,
  PlaybookSearchFilters,
  EvidenceSearchFilters,
  IncidentDashboard,
  ResponseTeamMetrics,
  ForensicsReport,
  AutomationRule,
  EscalationRule,
  ChecklistItem,
  CustodyRecord,
  AnalysisResult,
  ActionItem
} from './types';

/**
 * Core Incident Response engine for comprehensive incident management,
 * response automation, forensic analysis, and recovery coordination
 */
export class IncidentResponseCore {
  private incidents: Map<string, any> = new Map();
  private responders: Map<string, any> = new Map();
  private playbooks: Map<string, any> = new Map();
  private executions: Map<string, any> = new Map();
  private investigations: Map<string, any> = new Map();
  private automationRules: Map<string, any> = new Map();
  private escalationRules: Map<string, any> = new Map();

  constructor() {
    this.loadSampleData();
  }

  // Incident Management
  createIncident(incident: Partial<Incident>): string {
    const newIncident = {
      ...incident,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date(),
      detected_at: incident.detected_at || new Date(),
      timeline: [],
      responders: [],
      evidence: [],
      tasks: [],
      communications: [],
      containment_actions: [],
      eradication_actions: [],
      recovery_actions: [],
      lessons_learned: [],
      external_notifications: [],
      metadata: {}
    };

    // Add initial timeline event
    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'incident_created',
      description: 'Incident created',
      actor: incident.reported_by || 'system',
      source: 'system',
      details: {},
      automated: true
    };
    newIncident.timeline.push(timelineEvent);

    this.incidents.set(newIncident.id, newIncident);
    return newIncident.id;
  }

  getIncident(id: string): any {
    return this.incidents.get(id) || null;
  }

  getAllIncidents(): any[] {
    return Array.from(this.incidents.values());
  }

  updateIncident(id: string, updates: Partial<Incident>): boolean {
    const incident = this.incidents.get(id);
    if (!incident) return false;

    Object.assign(incident, updates);
    incident.updated_at = new Date();

    // Add timeline event
    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'incident_updated',
      description: 'Incident updated',
      actor: 'system',
      source: 'api',
      details: Object.keys(updates).reduce((acc, key) => {
        acc[key] = String(updates[key as keyof Incident]);
        return acc;
      }, {} as Record<string, string>),
      automated: true
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(id, incident);
    return true;
  }

  assignIncident(incidentId: string, responderId: string): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    incident.assigned_to = responderId;
    incident.status = IncidentStatus.Assigned;
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'incident_assigned',
      description: `Incident assigned to ${responderId}`,
      actor: 'system',
      source: 'assignment',
      details: { assignee: responderId },
      automated: true
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return true;
  }

  escalateIncident(incidentId: string, newSeverity: IncidentSeverity, reason: string): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    const oldSeverity = incident.severity;
    incident.severity = newSeverity;
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'incident_escalated',
      description: `Incident escalated from ${oldSeverity} to ${newSeverity}: ${reason}`,
      actor: 'system',
      source: 'escalation',
      details: {
        old_severity: oldSeverity,
        new_severity: newSeverity,
        reason: reason
      },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return true;
  }

  closeIncident(incidentId: string, resolutionNotes: string): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    incident.status = IncidentStatus.Closed;
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'incident_closed',
      description: `Incident closed: ${resolutionNotes}`,
      actor: 'system',
      source: 'closure',
      details: { resolution_notes: resolutionNotes },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return true;
  }

  searchIncidents(query: string): any[] {
    return Array.from(this.incidents.values()).filter(incident =>
      incident.title.toLowerCase().includes(query.toLowerCase()) ||
      incident.description.toLowerCase().includes(query.toLowerCase()) ||
      incident.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  filterIncidents(filters: IncidentSearchFilters): any[] {
    let results = Array.from(this.incidents.values());

    if (filters.severity) {
      results = results.filter(incident => incident.severity === filters.severity);
    }

    if (filters.status) {
      results = results.filter(incident => incident.status === filters.status);
    }

    if (filters.category) {
      results = results.filter(incident => incident.category === filters.category);
    }

    if (filters.assigned_to) {
      results = results.filter(incident => incident.assigned_to === filters.assigned_to);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(incident =>
        filters.tags!.some(tag => incident.tags.includes(tag))
      );
    }

    if (filters.date_range) {
      results = results.filter(incident => {
        const createdAt = new Date(incident.created_at);
        return createdAt >= filters.date_range!.start && createdAt <= filters.date_range!.end;
      });
    }

    return results;
  }

  getIncidentsByStatus(status: IncidentStatus): any[] {
    return Array.from(this.incidents.values()).filter(incident => incident.status === status);
  }

  getIncidentsBySeverity(severity: IncidentSeverity): any[] {
    return Array.from(this.incidents.values()).filter(incident => incident.severity === severity);
  }

  // Evidence Management
  addEvidence(incidentId: string, evidence: Partial<Evidence>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const newEvidence = {
      ...evidence,
      id: this.generateId(),
      collected_at: new Date(),
      chain_of_custody: [],
      analysis_results: [],
      tags: evidence.tags || [],
      metadata: evidence.metadata || {}
    };

    incident.evidence.push(newEvidence);
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'evidence_added',
      description: `Evidence added: ${newEvidence.name}`,
      actor: evidence.collected_by || 'forensics',
      source: 'evidence_collection',
      details: { evidence_id: newEvidence.id },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return newEvidence.id;
  }

  addCustodyRecord(incidentId: string, evidenceId: string, custodyRecord: Partial<CustodyRecord>): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    const evidence = incident.evidence.find((e: any) => e.id === evidenceId);
    if (!evidence) return false;

    const newRecord = {
      ...custodyRecord,
      timestamp: new Date()
    };

    evidence.chain_of_custody.push(newRecord);
    incident.updated_at = new Date();

    this.incidents.set(incidentId, incident);
    return true;
  }

  addAnalysisResult(incidentId: string, evidenceId: string, analysisResult: Partial<AnalysisResult>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const evidence = incident.evidence.find((e: any) => e.id === evidenceId);
    if (!evidence) return '';

    const newResult = {
      ...analysisResult,
      id: this.generateId(),
      timestamp: new Date()
    };

    evidence.analysis_results.push(newResult);
    incident.updated_at = new Date();

    this.incidents.set(incidentId, incident);
    return newResult.id;
  }

  // Task Management
  addTask(incidentId: string, task: Partial<Task>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const newTask = {
      ...task,
      id: this.generateId(),
      created_at: new Date(),
      checklist: task.checklist || [],
      dependencies: task.dependencies || [],
      notes: task.notes || ''
    };

    incident.tasks.push(newTask);
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'task_added',
      description: `Task added: ${newTask.title}`,
      actor: 'system',
      source: 'task_management',
      details: { task_id: newTask.id },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return newTask.id;
  }

  updateTaskStatus(incidentId: string, taskId: string, status: string, completedBy?: string): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    const task = incident.tasks.find((t: any) => t.id === taskId);
    if (!task) return false;

    task.status = status;
    if (status === 'completed') {
      task.completed_at = new Date();
      if (completedBy) {
        task.completed_by = completedBy;
      }
    }

    incident.updated_at = new Date();
    this.incidents.set(incidentId, incident);
    return true;
  }

  addChecklistItem(incidentId: string, taskId: string, item: Partial<ChecklistItem>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const task = incident.tasks.find((t: any) => t.id === taskId);
    if (!task) return '';

    const newItem = {
      ...item,
      id: this.generateId(),
      completed: false
    };

    task.checklist.push(newItem);
    incident.updated_at = new Date();

    this.incidents.set(incidentId, incident);
    return newItem.id;
  }

  // Responder Management
  addResponder(responder: Partial<Responder>): string {
    const newResponder = {
      ...responder,
      id: this.generateId(),
      assigned_at: new Date(),
      active: responder.active !== undefined ? responder.active : true,
      skills: responder.skills || []
    };

    this.responders.set(newResponder.id, newResponder);
    return newResponder.id;
  }

  getResponder(id: string): any {
    return this.responders.get(id) || null;
  }

  getAllResponders(): any[] {
    return Array.from(this.responders.values());
  }

  searchResponders(filters: ResponderSearchFilters): any[] {
    let results = Array.from(this.responders.values());

    if (filters.role) {
      results = results.filter(responder => responder.role === filters.role);
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(responder =>
        filters.skills!.some(skill => responder.skills.includes(skill))
      );
    }

    if (filters.active_only) {
      results = results.filter(responder => responder.active);
    }

    return results;
  }

  assignResponderToIncident(incidentId: string, responderId: string): boolean {
    const incident = this.incidents.get(incidentId);
    const responder = this.responders.get(responderId);
    
    if (!incident || !responder) return false;

    if (!incident.responders.find((r: any) => r.id === responderId)) {
      incident.responders.push(responder);
      incident.updated_at = new Date();

      const timelineEvent: TimelineEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        event_type: 'responder_assigned',
        description: `Responder ${responder.name} assigned to incident`,
        actor: 'system',
        source: 'team_management',
        details: { responder_id: responderId, responder_name: responder.name },
        automated: false
      };
      incident.timeline.push(timelineEvent);

      this.incidents.set(incidentId, incident);
    }

    return true;
  }

  // Playbook Management
  createPlaybook(playbook: Partial<ResponsePlaybook>): string {
    const newPlaybook = {
      ...playbook,
      id: this.generateId(),
      created_at: new Date(),
      steps: playbook.steps || [],
      required_roles: playbook.required_roles || [],
      prerequisites: playbook.prerequisites || [],
      success_criteria: playbook.success_criteria || [],
      active: playbook.active !== undefined ? playbook.active : true
    };

    this.playbooks.set(newPlaybook.id, newPlaybook);
    return newPlaybook.id;
  }

  getPlaybook(id: string): any {
    return this.playbooks.get(id) || null;
  }

  getAllPlaybooks(): any[] {
    return Array.from(this.playbooks.values());
  }

  searchPlaybooks(filters: PlaybookSearchFilters): any[] {
    let results = Array.from(this.playbooks.values());

    if (filters.category) {
      results = results.filter(playbook => playbook.category === filters.category);
    }

    if (filters.severity_threshold) {
      results = results.filter(playbook => playbook.severity_threshold === filters.severity_threshold);
    }

    if (filters.active_only) {
      results = results.filter(playbook => playbook.active);
    }

    return results;
  }

  executePlaybook(incidentId: string, playbookId: string, executor: string): string | null {
    const incident = this.incidents.get(incidentId);
    const playbook = this.playbooks.get(playbookId);

    if (!incident || !playbook) return null;

    const executionId = this.generateId();
    const execution: PlaybookExecution = {
      id: executionId,
      incident_id: incidentId,
      playbook_id: playbookId,
      started_by: executor,
      started_at: new Date(),
      status: PlaybookStatus.InProgress,
      step_executions: playbook.steps.map((step: any) => ({
        step_id: step.id,
        executed_by: '',
        started_at: new Date(),
        status: PlaybookStatus.NotStarted,
        notes: '',
        output: {}
      })),
      notes: ''
    };

    this.executions.set(executionId, execution);

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'playbook_started',
      description: `Started playbook: ${playbook.name}`,
      actor: executor,
      source: 'playbook_execution',
      details: {
        playbook_id: playbookId,
        execution_id: executionId
      },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return executionId;
  }

  updateStepExecution(executionId: string, stepId: string, updates: Partial<StepExecution>): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    const stepExecution = execution.step_executions.find((se: any) => se.step_id === stepId);
    if (!stepExecution) return false;

    Object.assign(stepExecution, updates);
    if (updates.status === PlaybookStatus.Completed) {
      stepExecution.completed_at = new Date();
    }

    this.executions.set(executionId, execution);
    return true;
  }

  // Forensic Investigation Management
  startInvestigation(incidentId: string, investigator: string, scope: string): string | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const investigationId = this.generateId();
    const investigation: ForensicInvestigation = {
      id: investigationId,
      incident_id: incidentId,
      investigator: investigator,
      started_at: new Date(),
      scope: scope,
      methodology: 'Standard forensic methodology',
      tools_used: ['EnCase', 'Volatility', 'Wireshark'],
      evidence_collected: [],
      findings: [],
      timeline_reconstruction: [],
      attribution: undefined,
      report_path: undefined
    };

    this.investigations.set(investigationId, investigation);

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'investigation_started',
      description: 'Forensic investigation started',
      actor: investigator,
      source: 'forensics',
      details: {
        investigation_id: investigationId,
        scope: scope
      },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return investigationId;
  }

  addForensicFinding(investigationId: string, finding: Partial<ForensicFinding>): string {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return '';

    const newFinding = {
      ...finding,
      id: this.generateId(),
      evidence_references: finding.evidence_references || [],
      recommendations: finding.recommendations || []
    };

    investigation.findings.push(newFinding);
    this.investigations.set(investigationId, investigation);
    return newFinding.id;
  }

  completeInvestigation(investigationId: string, reportPath?: string): boolean {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return false;

    investigation.completed_at = new Date();
    if (reportPath) {
      investigation.report_path = reportPath;
    }

    this.investigations.set(investigationId, investigation);
    return true;
  }

  // Communication Management
  addCommunication(incidentId: string, communication: Partial<Communication>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const newCommunication = {
      ...communication,
      id: this.generateId(),
      timestamp: new Date(),
      recipients: communication.recipients || [],
      attachments: communication.attachments || []
    };

    incident.communications.push(newCommunication);
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'communication_sent',
      description: `Communication sent: ${newCommunication.subject}`,
      actor: newCommunication.sender,
      source: 'communications',
      details: {
        communication_id: newCommunication.id,
        channel: newCommunication.channel
      },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return newCommunication.id;
  }

  // Action Management
  addContainmentAction(incidentId: string, action: Partial<ContainmentAction>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const newAction = {
      ...action,
      id: this.generateId(),
      implemented_at: new Date(),
      side_effects: action.side_effects || []
    };

    incident.containment_actions.push(newAction);
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'containment_action',
      description: `Containment action: ${newAction.action}`,
      actor: newAction.implemented_by,
      source: 'containment',
      details: { action_id: newAction.id },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return newAction.id;
  }

  addEradicationAction(incidentId: string, action: Partial<EradicationAction>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const newAction = {
      ...action,
      id: this.generateId(),
      implemented_at: new Date(),
      target_systems: action.target_systems || []
    };

    incident.eradication_actions.push(newAction);
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'eradication_action',
      description: `Eradication action: ${newAction.action}`,
      actor: newAction.implemented_by,
      source: 'eradication',
      details: { action_id: newAction.id },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return newAction.id;
  }

  addRecoveryAction(incidentId: string, action: Partial<RecoveryAction>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const newAction = {
      ...action,
      id: this.generateId(),
      implemented_at: new Date(),
      systems_restored: action.systems_restored || [],
      validation_tests: action.validation_tests || []
    };

    incident.recovery_actions.push(newAction);
    incident.updated_at = new Date();

    const timelineEvent: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      event_type: 'recovery_action',
      description: `Recovery action: ${newAction.action}`,
      actor: newAction.implemented_by,
      source: 'recovery',
      details: { action_id: newAction.id },
      automated: false
    };
    incident.timeline.push(timelineEvent);

    this.incidents.set(incidentId, incident);
    return newAction.id;
  }

  // Lessons Learned Management
  addLessonLearned(incidentId: string, lesson: Partial<LessonLearned>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const newLesson = {
      ...lesson,
      id: this.generateId(),
      recommendations: lesson.recommendations || [],
      action_items: lesson.action_items || []
    };

    incident.lessons_learned.push(newLesson);
    incident.updated_at = new Date();

    this.incidents.set(incidentId, incident);
    return newLesson.id;
  }

  addActionItem(incidentId: string, lessonId: string, actionItem: Partial<ActionItem>): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) return '';

    const lesson = incident.lessons_learned.find((l: any) => l.id === lessonId);
    if (!lesson) return '';

    const newActionItem = {
      ...actionItem,
      id: this.generateId()
    };

    lesson.action_items.push(newActionItem);
    incident.updated_at = new Date();

    this.incidents.set(incidentId, incident);
    return newActionItem.id;
  }

  // Metrics and Analytics
  generateIncidentMetrics(): IncidentMetrics {
    const incidents = Array.from(this.incidents.values());
    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter(i => 
      ![IncidentStatus.Closed, IncidentStatus.Resolved].includes(i.status)
    ).length;
    const closedIncidents = totalIncidents - openIncidents;

    const incidentsBySeverity: Record<string, number> = {};
    const incidentsByCategory: Record<string, number> = {};
    const incidentsByStatus: Record<string, number> = {};
    let totalCost = 0;
    const resolutionTimes: number[] = [];

    incidents.forEach(incident => {
      // Count by severity
      incidentsBySeverity[incident.severity] = (incidentsBySeverity[incident.severity] || 0) + 1;
      
      // Count by category
      incidentsByCategory[incident.category] = (incidentsByCategory[incident.category] || 0) + 1;
      
      // Count by status
      incidentsByStatus[incident.status] = (incidentsByStatus[incident.status] || 0) + 1;
      
      // Calculate costs and resolution times
      totalCost += incident.cost_estimate || 0;
      
      if ([IncidentStatus.Closed, IncidentStatus.Resolved].includes(incident.status)) {
        const resolutionTime = new Date(incident.updated_at).getTime() - new Date(incident.created_at).getTime();
        resolutionTimes.push(resolutionTime / (1000 * 60 * 60)); // Convert to hours
      }
    });

    const averageResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
      : 0;

    const costPerIncident = totalIncidents > 0 ? totalCost / totalIncidents : 0;

    return {
      total_incidents: totalIncidents,
      open_incidents: openIncidents,
      closed_incidents: closedIncidents,
      average_resolution_time: averageResolutionTime,
      incidents_by_severity: incidentsBySeverity,
      incidents_by_category: incidentsByCategory,
      incidents_by_status: incidentsByStatus,
      sla_compliance_rate: 95.0, // Placeholder
      cost_per_incident: costPerIncident,
      total_cost: totalCost,
      top_affected_systems: ['web-server-01', 'database-01'],
      response_team_utilization: {
        'security_analysts': 85.0,
        'forensics_team': 70.0
      }
    };
  }

  generateIncidentDashboard(): IncidentDashboard {
    const incidents = Array.from(this.incidents.values());
    const openIncidents = incidents.filter(i => 
      ![IncidentStatus.Closed, IncidentStatus.Resolved].includes(i.status)
    );
    const criticalIncidents = incidents.filter(i => i.severity === IncidentSeverity.Critical);
    const slaBreaches = incidents.filter(i => i.sla_breach).length;

    const severityDistribution = Object.values(IncidentSeverity).reduce((acc, severity) => {
      acc[severity] = incidents.filter(i => i.severity === severity).length;
      return acc;
    }, {} as Record<IncidentSeverity, number>);

    const categoryDistribution = Object.values(IncidentCategory).reduce((acc, category) => {
      acc[category] = incidents.filter(i => i.category === category).length;
      return acc;
    }, {} as Record<IncidentCategory, number>);

    const statusDistribution = Object.values(IncidentStatus).reduce((acc, status) => {
      acc[status] = incidents.filter(i => i.status === status).length;
      return acc;
    }, {} as Record<IncidentStatus, number>);

    // Get upcoming task deadlines
    const upcomingDeadlines: Task[] = [];
    incidents.forEach(incident => {
      incident.tasks.forEach((task: any) => {
        if (task.due_date && new Date(task.due_date) > new Date() && task.status !== 'completed') {
          upcomingDeadlines.push(task);
        }
      });
    });

    return {
      summary: {
        total_incidents: incidents.length,
        open_incidents: openIncidents.length,
        critical_incidents: criticalIncidents.length,
        sla_breaches: slaBreaches,
        average_resolution_time: this.generateIncidentMetrics().average_resolution_time
      },
      recent_incidents: incidents.slice(-10),
      severity_distribution: severityDistribution,
      category_distribution: categoryDistribution,
      status_distribution: statusDistribution,
      team_workload: {
        'incident_commanders': 3,
        'security_analysts': 8,
        'forensics_specialists': 4,
        'communications_lead': 2
      },
      trending_indicators: ['malware_increase', 'phishing_campaigns'],
      upcoming_deadlines: upcomingDeadlines.slice(0, 10)
    };
  }

  generateResponseTeamMetrics(): ResponseTeamMetrics {
    const responders = Array.from(this.responders.values());
    const incidents = Array.from(this.incidents.values());

    const utilizationByRole: Record<string, number> = {};
    Object.values(ResponderRole).forEach(role => {
      const roleResponders = responders.filter(r => r.role === role);
      const activeIncidents = incidents.filter(i => 
        ![IncidentStatus.Closed, IncidentStatus.Resolved].includes(i.status) &&
        i.responders.some((resp: any) => resp.role === role)
      );
      utilizationByRole[role] = roleResponders.length > 0 ? 
        (activeIncidents.length / roleResponders.length) * 100 : 0;
    });

    const workloadDistribution: Record<string, number> = {};
    responders.forEach(responder => {
      const assignedIncidents = incidents.filter(i => 
        i.assigned_to === responder.id || 
        i.responders.some((r: any) => r.id === responder.id)
      ).length;
      workloadDistribution[responder.name] = assignedIncidents;
    });

    return {
      team_size: responders.length,
      active_responders: responders.filter(r => r.active).length,
      average_response_time: 15.5, // Placeholder
      workload_distribution: Object.values(ResponderRole).reduce((acc, role) => {
        acc[role] = incidents.filter(i => 
          i.responders.some((r: any) => r.role === role)
        ).length;
        return acc;
      }, {} as Record<ResponderRole, number>),
      skill_coverage: {
        'incident_management': 85,
        'forensics': 70,
        'malware_analysis': 90
      },
      availability_status: {
        'available': '60%',
        'busy': '30%',
        'unavailable': '10%'
      },
      performance_metrics: {
        'response_time': 15.5,
        'resolution_rate': 95.2,
        'escalation_rate': 12.3
      }
    };
  }

  generateForensicsReport(investigationId: string): ForensicsReport | null {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return null;

    const incident = this.incidents.get(investigation.incident_id);
    if (!incident) return null;

    return {
      investigation_id: investigationId,
      incident_id: investigation.incident_id,
      executive_summary: `Forensic investigation of incident ${incident.title}`,
      methodology: investigation.methodology,
      timeline_analysis: investigation.timeline_reconstruction,
      key_findings: investigation.findings,
      evidence_summary: incident.evidence,
      attribution_analysis: investigation.attribution,
      technical_details: 'Detailed technical analysis of the incident',
      recommendations: investigation.findings.flatMap((f: any) => f.recommendations || []),
      appendices: ['Evidence catalog', 'Tool outputs', 'Chain of custody records'],
      generated_date: new Date(),
      investigator: investigation.investigator,
      review_status: 'draft'
    };
  }

  // Automation and Rules
  createAutomationRule(rule: Partial<AutomationRule>): string {
    const newRule = {
      ...rule,
      id: this.generateId(),
      created_at: new Date(),
      enabled: rule.enabled !== undefined ? rule.enabled : true,
      execution_count: 0,
      last_triggered: undefined
    };

    this.automationRules.set(newRule.id, newRule);
    return newRule.id;
  }

  createEscalationRule(rule: Partial<EscalationRule>): string {
    const newRule = {
      ...rule,
      id: this.generateId(),
      created_at: new Date(),
      enabled: rule.enabled !== undefined ? rule.enabled : true
    };

    this.escalationRules.set(newRule.id, newRule);
    return newRule.id;
  }

  evaluateAutomationRules(incidentId: string): void {
    const incident = this.incidents.get(incidentId);
    if (!incident) return;

    Array.from(this.automationRules.values()).forEach(rule => {
      if (!rule.active) return;

      // Simple rule evaluation logic
      let shouldExecute = false;
      
      if (rule.trigger_conditions.severity && incident.severity === rule.trigger_conditions.severity) {
        shouldExecute = true;
      }
      
      if (rule.trigger_conditions.category && incident.category === rule.trigger_conditions.category) {
        shouldExecute = true;
      }

      if (shouldExecute) {
        this.executeAutomationRule(rule.id, incidentId);
      }
    });
  }

  executeAutomationRule(ruleId: string, incidentId: string): boolean {
    const rule = this.automationRules.get(ruleId);
    const incident = this.incidents.get(incidentId);
    
    if (!rule || !incident) return false;

    // Execute actions based on rule
    rule.actions.forEach(action => {
      switch (action.type) {
        case 'assign_responder':
          if (action.parameters.responder_id) {
            this.assignResponderToIncident(incidentId, action.parameters.responder_id);
          }
          break;
        case 'execute_playbook':
          if (action.parameters.playbook_id) {
            this.executePlaybook(incidentId, action.parameters.playbook_id, 'automation');
          }
          break;
        case 'send_notification':
          if (action.parameters.message && action.parameters.channel) {
            this.addCommunication(incidentId, {
              subject: 'Automated Notification',
              content: action.parameters.message,
              channel: action.parameters.channel as CommunicationChannel,
              sender: 'automation'
            });
          }
          break;
      }
    });

    rule.execution_count++;
    rule.last_executed = new Date();
    this.automationRules.set(ruleId, rule);

    return true;
  }

  // Utility Methods
  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  private loadSampleData(): void {
    // Load sample responders
    const sampleResponders = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        role: ResponderRole.IncidentCommander,
        skills: ['incident_management', 'crisis_communication', 'team_coordination'],
        contact_info: { phone: '+1-555-0101', slack: '@alice.johnson' }
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@company.com',
        role: ResponderRole.SecurityAnalyst,
        skills: ['malware_analysis', 'network_forensics', 'threat_hunting'],
        contact_info: { phone: '+1-555-0102', slack: '@bob.smith' }
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@company.com',
        role: ResponderRole.ForensicsSpecialist,
        skills: ['digital_forensics', 'evidence_collection', 'timeline_analysis'],
        contact_info: { phone: '+1-555-0103', slack: '@carol.davis' }
      }
    ];

    sampleResponders.forEach(responder => {
      this.addResponder(responder);
    });

    // Load sample playbooks
    const samplePlaybooks = [
      {
        name: 'Malware Incident Response',
        description: 'Standard response playbook for malware incidents',
        category: IncidentCategory.Malware,
        severity_threshold: IncidentSeverity.Medium,
        steps: [
          {
            id: this.generateId(),
            name: 'Initial Assessment',
            description: 'Assess the scope and impact of the malware incident',
            order: 1,
            estimated_duration: 30,
            required_role: ResponderRole.SecurityAnalyst,
            instructions: 'Perform initial triage and impact assessment',
            automation_script: undefined
          },
          {
            id: this.generateId(),
            name: 'Containment',
            description: 'Contain the malware spread',
            order: 2,
            estimated_duration: 60,
            required_role: ResponderRole.SecurityAnalyst,
            instructions: 'Isolate affected systems and prevent further spread',
            automation_script: undefined
          }
        ]
      },
      {
        name: 'Data Breach Response',
        description: 'Comprehensive response playbook for data breach incidents',
        category: IncidentCategory.DataBreach,
        severity_threshold: IncidentSeverity.High,
        steps: [
          {
            id: this.generateId(),
            name: 'Breach Assessment',
            description: 'Assess the scope and nature of the data breach',
            order: 1,
            estimated_duration: 45,
            required_role: ResponderRole.IncidentCommander,
            instructions: 'Determine what data was accessed and by whom',
            automation_script: undefined
          }
        ]
      }
    ];

    samplePlaybooks.forEach(playbook => {
      this.createPlaybook(playbook);
    });

    // Load sample automation rules
    const sampleAutomationRules = [
      {
        name: 'Critical Incident Auto-Assignment',
        description: 'Automatically assign critical incidents to senior analysts',
        trigger_conditions: {
          severity: IncidentSeverity.Critical
        },
        actions: [
          {
            type: 'assign_responder',
            parameters: { responder_id: Array.from(this.responders.keys())[0] }
          }
        ]
      }
    ];

    sampleAutomationRules.forEach(rule => {
      this.createAutomationRule(rule);
    });
  }
}

export default IncidentResponseCore;
