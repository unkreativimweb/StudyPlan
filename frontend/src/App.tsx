import { useState, useEffect } from 'react';
import { FocusTab } from './components/FocusTab';
import { BacklogTab } from './components/BacklogTab';
import { SettingsTab } from './components/SettingsTab';
import { ManageTab } from './components/ManageTab';
import { Calendar as CalendarIcon, LayoutDashboard, Database, Settings2, PlusSquare } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarTab } from './components/CalendarTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('focus');
  const [theme, setTheme] = useState('');
  const [layoutMode, setLayoutMode] = useState('');

  // Hydrate theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'theme-brutalist';
    const savedLayout = localStorage.getItem('app-layout') || 'layout-industrial';
    setTheme(savedTheme);
    setLayoutMode(savedLayout);
  }, []);

  // Sync theme to body class
  useEffect(() => {
    if (theme && layoutMode) {
      document.body.className = `${theme} ${layoutMode}`;
    }
  }, [theme, layoutMode]);

  const tabs = [
    { id: 'focus', label: 'Focus Queue', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'backlog', label: 'Database', icon: Database },
    { id: 'manage', label: 'Manage Data', icon: PlusSquare },
    { id: 'settings', label: 'Config', icon: Settings2 },
  ];

  if (!theme) return null; // Wait for hydration

  return (
    <div className="flex h-screen w-screen overflow-hidden relative z-0">
      {/* Noise Background Overlay */}
      <div className="bg-grain fixed inset-0 pointer-events-none z-[-1]" />

      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-64 border-r border-border bg-bg/95 flex flex-col justify-between py-8 z-20 transition-all duration-300">
        <div className="px-4 md:px-8">
          <div className="w-8 h-8 bg-accent mb-12 hidden md:block" /> {/* Abstract Logo Block */}
          
          <ul className="space-y-4">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <li key={t.id} className="relative">
                  <button
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "flex items-center space-x-4 w-full text-left py-3 px-3 transition-colors",
                      "hover:text-accent group",
                      isActive ? "text-fg font-bold" : "text-mutedFg"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-mutedFg group-hover:text-accent transition-colors")} />
                    <span className="hidden md:inline uppercase tracking-widest text-[11px] font-bold">{t.label}</span>
                  </button>
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-accent"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="px-4 md:px-8 text-[10px] text-mutedFg uppercase tracking-widest hidden md:block font-mono">
          SYS_TIME: {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-12 lg:p-20">
        <AnimatePresence mode="wait">
          {activeTab === 'focus' && <FocusTab key="focus" />}
          {activeTab === 'calendar' && <CalendarTab key="calendar" />}
          {activeTab === 'backlog' && <BacklogTab key="backlog" />}
          {activeTab === 'manage' && <ManageTab key="manage" />}
          {activeTab === 'settings' && (
            <SettingsTab 
              key="settings" 
              theme={theme} 
              setTheme={(t: string) => { setTheme(t); localStorage.setItem('app-theme', t); }}
              layoutMode={layoutMode}
              setLayoutMode={(l: string) => { setLayoutMode(l); localStorage.setItem('app-layout', l); }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
