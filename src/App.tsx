import React, { useState, useEffect } from 'react';
import { authService, UserProfile } from './services/auth.service';
import { taskService, Task } from './services/task.service';
import { logService, ActivityLog } from './services/log.service';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import { User as FirebaseUser } from 'firebase/auth';
import { Briefcase, Key, ShieldCheck, Mail, Activity, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [fUser, setFUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'logs' | 'employees'>('dashboard');

  useEffect(() => {
    const unsubAuth = authService.onAuthStateChange(async (user) => {
      setFUser(user);
      if (user) {
        const profile = await authService.getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (fUser && userProfile) {
      const filters = userProfile.role === 'employee' ? { assignedTo: userProfile.uid } : undefined;
      const unsubTasks = taskService.subscribeToTasks(setTasks, filters);
      const unsubLogs = logService.subscribeToRecentLogs(setLogs);

      return () => {
        unsubTasks();
        unsubLogs();
      };
    }
  }, [fUser, userProfile]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!fUser || !userProfile) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView tasks={tasks} logs={logs} role={userProfile.role} />;
      case 'tasks':
        return <TasksView tasks={tasks} user={userProfile} />;
      case 'logs':
        return <LogsView logs={logs} />;
      case 'employees':
        return <EmployeesView />;
      default:
        return <DashboardView tasks={tasks} logs={logs} role={userProfile.role} />;
    }
  };

  return (
    <Layout user={userProfile} activeView={activeView} setActiveView={setActiveView}>
      {renderContent()}
    </Layout>
  );
}

function LoginScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative z-10"
      >
        <div className="p-10 text-center border-b border-slate-50">
           <div className="w-12 h-12 bg-slate-900 rounded flex items-center justify-center mx-auto mb-6">
              <Briefcase size={24} className="text-white" />
           </div>
           <h1 className="text-xl font-bold text-slate-900 tracking-tight">AgencyFlow</h1>
           <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">Internal Task Protocol</p>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <FeatureItem icon={<ShieldCheck size={16} className="text-slate-400" />} text="Role-Based Protocol" />
            <FeatureItem icon={<Activity size={16} className="text-slate-400" />} text="Real-Time Logging" />
          </div>

          <button 
            onClick={() => authService.signIn()}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-3 rounded text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="Google" />
            Authenticate
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-500 font-medium text-xs">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function LogsView({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
       {logs.map((log) => (
         <div key={log.id} className="relative pl-8 before:absolute before:left-[3px] before:top-2 before:bottom-[-24px] before:w-px before:bg-slate-200 last:before:hidden">
            <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-200 z-10" />
            <div className="bg-white p-6 border border-slate-200 rounded-xl">
               <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{log.userName}</h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {log.timestamp?.toDate ? format(new Date(log.timestamp.toDate()), 'MMM dd, HH:mm') : 'Recently'}
                  </span>
               </div>
               <p className="text-sm text-slate-600">
                  {log.action} <span className="text-slate-400">"{log.details}"</span>
               </p>
            </div>
         </div>
       ))}
    </div>
  );
}

function EmployeesView() {
  const [employees, setEmployees] = useState<any[]>([]);
  
  useEffect(() => {
    taskService.getAllUsers().then(setEmployees);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map(emp => (
        <div key={emp.uid} className="bg-white p-6 border border-slate-200 rounded-xl flex items-center gap-4">
           <img src={emp.photoURL} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
           <div>
              <h3 className="text-sm font-bold text-slate-900">{emp.displayName}</h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                <Mail size={10} /> {emp.email}
              </p>
              <span className={`inline-block mt-2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                emp.role === 'admin' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-100'
              }`}>
                {emp.role}
              </span>
           </div>
        </div>
      ))}
    </div>
  );
}

// Digital Agency Internal Tool
