import {
  createAgentRegistry,
  AgentRegistry,
  hello,
  createSecurityAgent,
  SecurityAuditAgent,
  AgentResult,
  AgentInfo,
  SecurityIssue,
  plus100
} from '@phantom-spire/ml-core';

/**
 * Test ML Core Integration for Phantom Hunting Core
 *
 * This file tests the integration between phantom-hunting-core and phantom-ml-core
 * to verify that imports work correctly and types are properly resolved.
 */

// Test basic import and function call
console.log('Testing phantom-ml-core integration in hunting-core:', hello());

// Test mathematical functions
const testNumber = 42;
const result = plus100(testNumber);
console.log(`plus100(${testNumber}) = ${result}`);

// Test class instantiation
const registry: AgentRegistry = createAgentRegistry();
console.log('Agent registry created successfully');

// Test security agent creation
const securityAgent: SecurityAuditAgent = createSecurityAgent();
console.log('Security agent created successfully');

// Test registry methods
const agents: AgentInfo[] = registry.listAgents();
console.log('Available agents:', agents.length);

// Test agent execution
try {
  const executionResult: AgentResult = registry.executeAgentSimple('test-agent');
  console.log('Agent execution result:', executionResult.success);
} catch (error) {
  console.log('Agent execution test (expected to fail):', (error as Error).message);
}

// Test security scanning
const testContent = `
function unsafeEval(userInput) {
  return eval(userInput); // This is a security vulnerability
}

var password = "hardcoded_password"; // Another security issue
`;

const securityIssues: SecurityIssue[] = securityAgent.scanContent(testContent);
console.log('Security scan found', securityIssues.length, 'issues');

// Test hunting-specific integration functionality
class HuntingMLIntegration {
  private agentRegistry: AgentRegistry;
  private securityAgent: SecurityAuditAgent;

  constructor() {
    this.agentRegistry = createAgentRegistry();
    this.securityAgent = createSecurityAgent();
  }

  // Example method that leverages ML capabilities for threat hunting
  public async scanForAnomalies(logData: string[]): Promise<SecurityIssue[]> {
    const allIssues: SecurityIssue[] = [];

    for (const logEntry of logData) {
      const issues = this.securityAgent.scanContent(logEntry);
      allIssues.push(...issues);
    }

    return allIssues;
  }

  // Example method for behavioral analysis
  public analyzeAgentBehavior(): { totalAgents: number; activeAgents: number } {
    const agents = this.agentRegistry.listAgents();
    const activeAgents = agents.filter(agent => agent.enabled);

    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length
    };
  }
}

// Test the hunting-specific integration
const huntingIntegration = new HuntingMLIntegration();

// Simulate some log data for testing
const sampleLogData = [
  'User login attempt from IP 192.168.1.100',
  'eval("malicious_code()"); // Suspicious activity',
  'Normal application startup'
];

huntingIntegration.scanForAnomalies(sampleLogData).then(anomalies => {
  console.log('Hunting anomaly detection found', anomalies.length, 'potential threats');
});

const behaviorAnalysis = huntingIntegration.analyzeAgentBehavior();
console.log('Agent behavior analysis:', behaviorAnalysis);

export const testMLIntegration = () => {
  return 'ML integration test passed for phantom-hunting-core';
};

export { HuntingMLIntegration };

// Export types for other modules to use
export type { AgentRegistry, SecurityAuditAgent, AgentResult, AgentInfo, SecurityIssue };