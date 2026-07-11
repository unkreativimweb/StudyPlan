import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Type, Sparkles, MonitorUp, Clock } from 'lucide-react';
import { useStore, API_URL } from '../lib/store';

export function SettingsTab({ theme, setTheme, layoutMode, setLayoutMode }: { theme: string, setTheme: (t: string) => void, layoutMode: string, setLayoutMode: (l: string) => void }) {
  const { fontSizeMultiplier, setFontSizeMultiplier } = useStore();
  const themes = [
    { id: 'theme-brutalist', label: 'BRUTALIST', desc: 'Syne / Dark / High Contrast', className: 'font-sans' },
    { id: 'theme-editorial', label: 'EDITORIAL', desc: 'Fraunces / Light / Journal', className: 'font-serif' },
    { id: 'theme-mono', label: 'TERMINAL', desc: 'JetBrains / Black / Green', className: 'font-mono' },
  ];

  const [maxDailyStudyMinutes, setMaxDailyStudyMinutes] = useState<number>(240);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.maxDailyStudyMinutes) setMaxDailyStudyMinutes(data.maxDailyStudyMinutes);
      })
      .catch(console.error);
  }, []);

  const updateMaxDaily = async (val: number) => {
    setMaxDailyStudyMinutes(val);
    try {
      await fetch(`${API_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDailyStudyMinutes: val }),
      });
      // Optionally trigger a scheduler refetch if needed
      useStore.getState().fetchSchedulerData();
    } catch (e) {
      console.error('Failed to update maxDailyStudyMinutes', e);
    }
  };

  const layouts = [
    { id: 'layout-industrial', label: 'INDUSTRIAL', desc: 'Hard borders / Dense / Monospaced' },
    { id: 'layout-elegant', label: 'PREMIUM ELEGANT', desc: 'Glassmorphism / Aurora / Smooth' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl"
    >
      <header className="mb-16 border-b border-border pb-8">
        <h1 className="text-5xl font-bold tracking-tighter uppercase">Configuration</h1>
      </header>

      <section className="border border-border bg-bg overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border bg-bg/50 flex items-center space-x-3">
          <Type className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Interface Theme</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {themes.map(t => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative text-left p-6 transition-all duration-300",
                  isActive ? "bg-accent/5" : "bg-bg hover:bg-accent/5",
                  t.className
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTheme" 
                    className="absolute inset-0 border-2 border-accent pointer-events-none" 
                  />
                )}
                <div className="flex flex-col h-full justify-between min-h-[120px]">
                  <div>
                    <h3 className={cn("text-2xl font-bold tracking-tight", isActive ? "text-accent" : "text-fg")}>{t.label}</h3>
                    <p className="text-[10px] text-mutedFg uppercase tracking-widest mt-2">{t.desc}</p>
                  </div>
                  <div className="mt-6 flex space-x-2">
                    <span className="w-4 h-4 bg-bg border border-border" />
                    <span className="w-4 h-4 bg-fg border border-border" />
                    <span className="w-4 h-4 bg-accent border border-border" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="border border-border bg-bg overflow-hidden mt-12">
        <div className="p-4 md:p-6 border-b border-border bg-bg/50 flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Interface Layout</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {layouts.map(l => {
            const isActive = layoutMode === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLayoutMode(l.id)}
                className={cn(
                  "relative text-left p-6 transition-all duration-300",
                  isActive ? "bg-accent/5" : "bg-bg hover:bg-accent/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeLayout" 
                    className="absolute inset-0 border-2 border-accent pointer-events-none" 
                  />
                )}
                <div className="flex flex-col h-full justify-between min-h-[80px]">
                  <div>
                    <h3 className={cn("text-2xl font-bold tracking-tight", isActive ? "text-accent" : "text-fg")}>{l.label}</h3>
                    <p className="text-[10px] text-mutedFg uppercase tracking-widest mt-2">{l.desc}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="border border-border bg-bg overflow-hidden mt-12">
        <div className="p-4 md:p-6 border-b border-border bg-bg/50 flex items-center space-x-3">
          <MonitorUp className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Global Font Scale</h2>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs uppercase tracking-widest text-mutedFg">Scale Multiplier</span>
            <span className="font-mono text-accent font-bold">{fontSizeMultiplier.toFixed(2)}x</span>
          </div>
          <input 
            type="range" 
            min="0.8" 
            max="1.5" 
            step="0.05" 
            value={fontSizeMultiplier} 
            onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] text-mutedFg mt-2 font-mono">
            <span>0.8x</span>
            <span>1.0x</span>
            <span>1.5x</span>
          </div>
        </div>
      </section>

      <section className="border border-border bg-bg overflow-hidden mt-12 mb-20">
        <div className="p-4 md:p-6 border-b border-border bg-bg/50 flex items-center space-x-3">
          <Clock className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Max Daily Study Minutes</h2>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs uppercase tracking-widest text-mutedFg">Maximum Scheduled Time Per Day</span>
            <span className="font-mono text-accent font-bold">{maxDailyStudyMinutes} min</span>
          </div>
          <input 
            type="range" 
            min="60" 
            max="600" 
            step="30" 
            value={maxDailyStudyMinutes} 
            onChange={(e) => updateMaxDaily(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] text-mutedFg mt-2 font-mono">
            <span>60m (1h)</span>
            <span>240m (4h)</span>
            <span>600m (10h)</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
