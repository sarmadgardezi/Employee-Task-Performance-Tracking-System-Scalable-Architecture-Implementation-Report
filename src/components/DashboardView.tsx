import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { Task } from '../services/task.service';
import { ActivityLog } from '../services/log.service';

interface DashboardProps {
  tasks: Task[];
  logs: ActivityLog[];
  role: 'admin' | 'employee';
}

export default function DashboardView({ tasks, logs, role }: DashboardProps) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={stats.total} />
        <StatCard title="Completed" value={stats.completed} secondaryValue={`${completionRate}% rate`} />
        <StatCard title="Active Pending" value={stats.todo + stats.inProgress} />
        <StatCard title="Urgent High" value={stats.urgent} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Recent Tasks */}
        <div className="col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Assignments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="px-6 py-3">Task Name</th>
                  <th className="px-6 py-3">Assignee</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Due</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
                  <tr key={task.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                    <td className="px-6 py-4 text-slate-500">{task.assignedToName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        task.status === 'in-progress' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                    </td>
                  </tr>
                ))}
                {tasks.filter(t => t.status !== 'completed').length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No active assignments.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Logs</h3>
          </div>
          <div className="p-5 flex-1 space-y-5">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-200 shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-xs leading-relaxed text-slate-900">
                    <span className="font-bold">{log.userName}</span> {log.action} <span className="text-slate-500">{log.details}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                    {log.timestamp?.toDate ? new Date(log.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-50 bg-slate-50/30">
            <button className="w-full py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">View Full History</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, secondaryValue }: { title: string, value: string | number, secondaryValue?: string }) {
  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl transition-shadow hover:shadow-sm">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{title}</span>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-bold text-slate-900 leading-none">{value}</span>
        {secondaryValue && (
          <span className="text-[10px] text-slate-400 mb-0.5 font-medium">{secondaryValue}</span>
        )}
      </div>
    </div>
  );
}
