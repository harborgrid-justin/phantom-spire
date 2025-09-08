import { EventEmitter } from 'events';

interface ProcessInstanceMonitorItem {
  id: string;
  name: string;
  status: string;
  category: string;
  description: string;
  createdAt: string;
}

export class ProcessInstanceMonitorBusinessLogic extends EventEmitter {
  private items: Map<string, ProcessInstanceMonitorItem> = new Map();

  constructor() {
    super();
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleItem: ProcessInstanceMonitorItem = {
      id: '1',
      name: 'Sample Process Instance Monitor',
      status: 'active',
      category: 'execution',
      description: 'Real-time monitoring of workflow instances',
      createdAt: new Date().toISOString()
    };
    
    this.items.set(sampleItem.id, sampleItem);
  }

  async getItems(): Promise<ProcessInstanceMonitorItem[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<ProcessInstanceMonitorItem | null> {
    return this.items.get(id) || null;
  }

  async createItem(data: Partial<ProcessInstanceMonitorItem>): Promise<ProcessInstanceMonitorItem> {
    const item: ProcessInstanceMonitorItem = {
      id: Date.now().toString(),
      name: data.name || '',
      status: data.status || 'draft',
      category: 'execution',
      description: data.description || '',
      createdAt: new Date().toISOString()
    };

    this.items.set(item.id, item);
    this.emit('item:created', item);
    
    return item;
  }
}

export default ProcessInstanceMonitorBusinessLogic;