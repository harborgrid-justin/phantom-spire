"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerType = exports.StepType = exports.WorkflowPriority = exports.WorkflowStatus = void 0;
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["PENDING"] = "pending";
    WorkflowStatus["RUNNING"] = "running";
    WorkflowStatus["PAUSED"] = "paused";
    WorkflowStatus["COMPLETED"] = "completed";
    WorkflowStatus["FAILED"] = "failed";
    WorkflowStatus["CANCELLED"] = "cancelled";
    WorkflowStatus["SUSPENDED"] = "suspended";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
var WorkflowPriority;
(function (WorkflowPriority) {
    WorkflowPriority["CRITICAL"] = "critical";
    WorkflowPriority["HIGH"] = "high";
    WorkflowPriority["MEDIUM"] = "medium";
    WorkflowPriority["LOW"] = "low";
})(WorkflowPriority || (exports.WorkflowPriority = WorkflowPriority = {}));
var StepType;
(function (StepType) {
    StepType["TASK"] = "task";
    StepType["DECISION"] = "decision";
    StepType["PARALLEL"] = "parallel";
    StepType["SEQUENTIAL"] = "sequential";
    StepType["SUBPROCESS"] = "subprocess";
    StepType["TIMER"] = "timer";
    StepType["MESSAGE"] = "message";
    StepType["SCRIPT"] = "script";
    StepType["HUMAN"] = "human";
})(StepType || (exports.StepType = StepType = {}));
var TriggerType;
(function (TriggerType) {
    TriggerType["EVENT"] = "event";
    TriggerType["SCHEDULE"] = "schedule";
    TriggerType["MANUAL"] = "manual";
    TriggerType["API"] = "api";
    TriggerType["MESSAGE"] = "message";
    TriggerType["TIMER"] = "timer";
})(TriggerType || (exports.TriggerType = TriggerType = {}));
//# sourceMappingURL=IWorkflowEngine.js.map