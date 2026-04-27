import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  AlertTriangle,
  User as UserIcon,
  X
} from 'lucide-react';
import { Task, taskService } from '../services/task.service';
import { logService } from '../services/log.service';
import { UserProfile } from '../services/auth.service';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface TasksViewProps {
  tasks: Task[];
  user: UserProfile;
}

export default function TasksView({ tasks, user }: TasksViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [users, setUsers] = useState<any[]>([]);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      taskService.getAllUsers().then(setUsers);
    }
  }, [isAdmin]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignedUser = users.find(u => u.uid === formData.get('assignedTo'));

    const newTaskData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: 'todo' as const,
      priority: formData.get('priority') as any,
      assignedTo: formData.get('assignedTo') as string,
      assignedToName: assignedUser?.displayName || 'Unknown',
      assignedBy: user.uid,
      deadline: formData.get('deadline') as string,
    };

    const taskId = await taskService.createTask(newTaskData);
    if (taskId) {
      await logService.addLog({
        userId: user.uid,
        userName: user.displayName,
        action: 'created task',
        targetId: taskId,
        details: newTaskData.title,
      });
      setIsModalOpen(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, title: string, newStatus: Task['status']) => {
    await taskService.updateTaskStatus(taskId, newStatus);
    await logService.addLog({
      userId: user.uid,
      userName: user.displayName,
      action: `updated status to ${newStatus.replace('-', ' ')}`,
      targetId: taskId,
      details: title,
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Filter tasks..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-slate-800 transition-all shadow-sm uppercase tracking-wider"
            >
              <Plus size={14} />
              Assign Task
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
              <th className="px-6 py-3">Task Detail</th>
              <th className="px-6 py-3">Team member</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Deadline</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredTasks.map(task => (
              <tr key={task.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{task.title}</span>
                    <span className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                        {task.assignedToName.charAt(0)}
                     </div>
                     <span className="text-slate-500">{task.assignedToName}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, task.title, e.target.value as any)}
                    className="bg-transparent border-none text-[10px] uppercase font-bold text-slate-600 focus:ring-0 p-0 cursor-pointer hover:text-slate-900"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right text-slate-400 text-xs font-medium">
                  {task.deadline ? format(new Date(task.deadline), 'MMM dd') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div className="py-20 text-center text-slate-400 italic">No tasks found.</div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assign Assignment</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Task Title</label>
                  <input required name="title" className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-900 outline-none" placeholder="Task summary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Brief Description</label>
                  <textarea required name="description" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-900 outline-none" placeholder="Provide context" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assign To</label>
                    <select required name="assignedTo" className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-900 outline-none bg-white">
                      {users.filter(u => u.role === 'employee').map(u => (
                        <option key={u.uid} value={u.uid}>{u.displayName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</label>
                    <input required type="date" name="deadline" className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-900 outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest">Cancel</button>
                   <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest">Confirm Assignment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
