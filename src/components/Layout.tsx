import React, { ReactNode } from 'react';
import { 
  BarChart3, 
  CheckSquare, 
  History, 
  LayoutDashboard, 
  LogOut, 
  PlusCircle, 
  Users,
  Briefcase
} from 'lucide-react';
import { authService, UserProfile } from '../services/auth.service';
import { motion } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
  user: UserProfile;
  activeView: 'dashboard' | 'tasks' | 'logs' | 'employees';
  setActiveView: (view: any) => void;
}

export default function Layout({ children, user, activeView, setActiveView }: LayoutProps) {
  const isAdmin = user.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    ...(isAdmin ? [{ id: 'employees', label: 'Employees', icon: Users }] : []),
    { id: 'logs', label: 'Activity Logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-6 h-6 bg-slate-900 rounded-sm flex items-center justify-center">
              <Briefcase size={14} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-900">AgencyFlow</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                  activeView === item.id 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="w-8 h-8 rounded-full border border-slate-200"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.displayName}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
            </div>
            <button 
              onClick={() => authService.signOut()}
              className="text-slate-400 hover:text-slate-900 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {activeView} Overview
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={activeView}
            transition={{ duration: 0.2 }}
            className="p-8 h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
