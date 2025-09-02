/**
 * Simple In-Memory Workflow Repository Implementation
 * For demonstration and testing purposes
 */

// Re-export the generic implementation
// Temporarily use in-memory implementation until generic reference is fixed
export class InMemoryWorkflowRepository {
  private workflows = new Map();

  async save(workflow: any): Promise<any> {
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async findById(id: string): Promise<any | null> {
    return this.workflows.get(id) || null;
  }

  async findAll(): Promise<any[]> {
    return Array.from(this.workflows.values());
  }

  async delete(id: string): Promise<void> {
    this.workflows.delete(id);
  }
}
