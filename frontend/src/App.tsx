import { useState, useEffect } from 'react';
import { FocusTab } from './components/FocusTab';
import { BacklogTab } from './components/BacklogTab';
import { SettingsTab } from './components/SettingsTab';
import { ManageTab } from './components/ManageTab';
import { Calendar as CalendarIcon, LayoutDashboard, Database, Settings2, PlusSquare } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarTab } from './components/CalendarTab';
import { useStore } from './lib/store';

export default function App() {
  const [activeTab, setActiveTab] = useState('focus');
  const [theme, setTheme] = useState('');
  const [layoutMode, setLayoutMode] = useState('');
  const [sysTime, setSysTime] = useState(new Date());
  const [isIdle, setIsIdle] = useState(false);
  
  const { fontSizeMultiplier, activeSessionId } = useStore();

  // Hydrate theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'theme-brutalist';
    const savedLayout = localStorage.getItem('app-layout') || 'layout-industrial';
    setTheme(savedTheme);
    setLayoutMode(savedLayout);
  }, []);

  // System clock
  useEffect(() => {
    const timer = setInterval(() => setSysTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Idle detection for Zen Mode
  useEffect(() => {
    let timeout: any;
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      if (activeSessionId) {
        timeout = setTimeout(() => setIsIdle(true), 3000);
      }
    };
    
    // Initial setup if a session is already active
    if (activeSessionId) {
      timeout = setTimeout(() => setIsIdle(true), 3000);
    } else {
      setIsIdle(false);
    }

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [activeSessionId]);

  // Sync theme to body class
  useEffect(() => {
    if (theme && layoutMode) {
      document.body.className = `${theme} ${layoutMode}`;
    }
  }, [theme, layoutMode]);

  // Sync font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * (fontSizeMultiplier || 1.0)}px`;
  }, [fontSizeMultiplier]);

  const tabs = [
    { id: 'focus', label: 'Focus Queue', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'backlog', label: 'Database', icon: Database },
    { id: 'manage', label: 'Manage Data', icon: PlusSquare },
    { id: 'settings', label: 'Config', icon: Settings2 },
  ];

  if (!theme) return null; // Wait for hydration

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-screen overflow-hidden relative z-0">
      {/* Noise Background Overlay */}
      <div className="bg-grain fixed inset-0 pointer-events-none z-[-1]" />

      {/* Sidebar Navigation */}
      <nav className={cn(
        "border-t md:border-t-0 md:border-r border-border bg-bg/95 flex md:flex-col justify-around md:justify-between py-2 md:py-8 z-20 transition-all duration-700 ease-in-out shrink-0 w-full md:w-64",
        activeSessionId && isIdle ? "h-0 md:h-auto md:w-0 opacity-0 translate-y-full md:translate-y-0 md:-translate-x-full overflow-hidden border-t-0 md:border-r-0 py-0" : "h-16 md:h-full opacity-100 translate-y-0"
      )}>
        <div className="px-2 md:px-8 w-full md:min-w-[256px] flex md:block items-center justify-center h-full">
          <div className="w-8 h-8 bg-accent mb-12 hidden md:block" /> {/* Abstract Logo Block */}
          
          <ul className="flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-4 w-full justify-around md:justify-start">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <li key={t.id} className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-4 w-full text-center md:text-left py-1 md:py-3 px-1 md:px-3 transition-colors",
                      "hover:text-accent group",
                      isActive ? "text-fg font-bold" : "text-mutedFg"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 md:w-5 md:h-5", isActive ? "text-accent" : "text-mutedFg group-hover:text-accent transition-colors")} />
                    <span className="hidden md:inline uppercase tracking-widest text-[11px] font-bold whitespace-nowrap">{t.label}</span>
                  </button>
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute top-0 md:left-0 md:top-0 h-[2px] md:h-auto w-full md:w-1 md:bottom-0 bg-accent"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="px-4 md:px-8 text-[10px] text-mutedFg uppercase tracking-widest hidden md:block font-mono md:min-w-[256px]">
          SYS_TIME: {sysTime.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 overflow-y-auto relative z-10 transition-all duration-700 ease-in-out",
        activeSessionId && isIdle ? "p-0 md:p-0 lg:p-0" : "p-4 md:p-12 lg:p-20 pb-20 md:pb-12"
      )}>
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
