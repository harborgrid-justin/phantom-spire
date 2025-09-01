"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoWorkflowRepository = exports.InMemoryWorkflowRepository = exports.WorkflowEngineCore = exports.TriggerType = exports.StepType = exports.WorkflowPriority = exports.WorkflowStatus = exports.default = exports.WorkflowBPMOrchestrator = void 0;
__exportStar(require("./interfaces/IWorkflowEngine"), exports);
__exportStar(require("./core/WorkflowEngine"), exports);
__exportStar(require("./repository/InMemoryWorkflowRepository"), exports);
__exportStar(require("./repository/MongoWorkflowRepository"), exports);
var WorkflowBPMOrchestrator_1 = require("./WorkflowBPMOrchestrator");
Object.defineProperty(exports, "WorkflowBPMOrchestrator", { enumerable: true, get: function () { return WorkflowBPMOrchestrator_1.WorkflowBPMOrchestrator; } });
var WorkflowBPMOrchestrator_2 = require("./WorkflowBPMOrchestrator");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return WorkflowBPMOrchestrator_2.WorkflowBPMOrchestrator; } });
var IWorkflowEngine_1 = require("./interfaces/IWorkflowEngine");
Object.defineProperty(exports, "WorkflowStatus", { enumerable: true, get: function () { return IWorkflowEngine_1.WorkflowStatus; } });
Object.defineProperty(exports, "WorkflowPriority", { enumerable: true, get: function () { return IWorkflowEngine_1.WorkflowPriority; } });
Object.defineProperty(exports, "StepType", { enumerable: true, get: function () { return IWorkflowEngine_1.StepType; } });
Object.defineProperty(exports, "TriggerType", { enumerable: true, get: function () { return IWorkflowEngine_1.TriggerType; } });
var WorkflowEngine_1 = require("./core/WorkflowEngine");
Object.defineProperty(exports, "WorkflowEngineCore", { enumerable: true, get: function () { return WorkflowEngine_1.WorkflowEngineCore; } });
var InMemoryWorkflowRepository_1 = require("./repository/InMemoryWorkflowRepository");
Object.defineProperty(exports, "InMemoryWorkflowRepository", { enumerable: true, get: function () { return InMemoryWorkflowRepository_1.InMemoryWorkflowRepository; } });
var MongoWorkflowRepository_1 = require("./repository/MongoWorkflowRepository");
Object.defineProperty(exports, "MongoWorkflowRepository", { enumerable: true, get: function () { return MongoWorkflowRepository_1.MongoWorkflowRepository; } });
//# sourceMappingURL=index.js.map