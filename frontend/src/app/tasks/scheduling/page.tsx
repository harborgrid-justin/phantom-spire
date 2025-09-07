'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../lib/business-logic';

interface ScheduledTask {
  id: string;
  taskId: string;
  taskName: string;
  schedule: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'cron';
    value: string;
    timezone: string;
  };
  nextRun: string;
  lastRun?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  executionCount: number;
}

export default function TaskSchedulingPage() {
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('task-scheduling');

  useEffect(() => {
    fetchScheduledTasks();
  }, []);

  const fetchScheduledTasks = async () => {
    try {
      setLoading(true);
      
      const mockScheduledTasks: ScheduledTask[] = [
        {
          id: '1',
          taskId: 'task-001',
          taskName: 'Daily IOC Collection',
          schedule: {
            type: 'daily',
            value: '06:00',
            timezone: 'UTC'
          },
          nextRun: new Date(Date.now() + 21600000).toISOString(), // 6 hours from now
          lastRun: new Date(Date.now() - 64800000).toISOString(), // 18 hours ago
          status: 'active',
          priority: 'high',
          createdAt: new Date().toISOString(),
          executionCount: 157
        },
        {
          id: '2',
          taskId: 'task-002',
          taskName: 'Weekly Threat Intelligence Report',
          schedule: {
            type: 'weekly',
            value: 'Monday 09:00',
            timezone: 'UTC'
          },
          nextRun: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
          lastRun: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          status: 'active',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          executionCount: 23
        },
        {
          id: '3',
          taskId: 'task-003',
          taskName: 'Emergency Response Drill',
          schedule: {
            type: 'once',
            value: '2024-02-15 14:00',
            timezone: 'UTC'
          },
          nextRun: new Date('2024-02-15 14:00').toISOString(),
          status: 'active',
          priority: 'critical',
          createdAt: new Date().toISOString(),
          executionCount: 0
        }
      ];

      setScheduledTasks(mockScheduledTasks);
      addNotification('success', 'Scheduled tasks loaded successfully');
    } catch (error) {
      addNotification('error', 'Failed to load scheduled tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeUntilNext = (nextRun: string) => {
    const now = new Date();
    const next = new Date(nextRun);
    const diffMs = next.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h`;
  };

  const filterTasksByTimeframe = (tasks: ScheduledTask[]) => {
    const now = new Date();
    const endDate = new Date();
    
    switch (selectedTimeframe) {
      case 'today':
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        endDate.setDate(now.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(now.getMonth() + 1);
        break;
    }
    
    return tasks.filter(task => {
      const nextRun = new Date(task.nextRun);
      return nextRun >= now && nextRun <= endDate;
    });
  };

  const filteredTasks = filterTasksByTimeframe(scheduledTasks);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading scheduled tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⏰ Task Scheduling
          </h1>
          <p className="text-gray-600">
            Schedule and manage automated task executions with advanced timing controls
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Schedule New Task
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{scheduledTasks.length}</div>
          <div className="text-sm text-gray-600">Total Scheduled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {scheduledTasks.filter(t => t.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Schedules</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {filteredTasks.length}
          </div>
          <div className="text-sm text-gray-600">Due {selectedTimeframe}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {scheduledTasks.reduce((sum, t) => sum + t.executionCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Executions</div>
        </div>
      </div>

      {/* Timeframe Filter */}
      <div className="flex space-x-4 mb-6">
        {['today', 'week', 'month'].map(timeframe => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedTimeframe === timeframe
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </button>
        ))}
      </div>

      {/* Scheduled Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.taskName}</h3>
                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {getTimeUntilNext(task.nextRun)}
                </div>
                <div className="text-xs text-gray-500">until next run</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Schedule Type:</span>
                  <div className="text-sm text-gray-700 capitalize">{task.schedule.type}</div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Schedule Value:</span>
                  <div className="text-sm text-gray-700">{task.schedule.value}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Next Run:</span>
                  <div className="text-sm text-gray-700">
                    {new Date(task.nextRun).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Last Run:</span>
                  <div className="text-sm text-gray-700">
                    {task.lastRun ? new Date(task.lastRun).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Timezone:</span>
                  <div className="text-sm text-gray-700">{task.schedule.timezone}</div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Executions:</span>
                  <div className="text-sm text-gray-700">{task.executionCount}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                  Run Now
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                  View History
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors">
                  {task.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No scheduled tasks found</div>
          <div className="text-gray-400 text-sm">
            No tasks are scheduled to run {selectedTimeframe === 'today' ? 'today' : `this ${selectedTimeframe}`}
          </div>
        </div>
      )}

      {/* Quick Schedule Form */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option>Select a task...</option>
              <option>IOC Collection</option>
              <option>Threat Analysis</option>
              <option>Report Generation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option>Once</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date/Time</label>
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
              Schedule Task
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <div key={notification.id} className="fixed bottom-4 right-4 z-40">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}