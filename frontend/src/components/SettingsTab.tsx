import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Type, Sparkles, MonitorUp } from 'lucide-react';
import { useStore } from '../lib/store';

export function SettingsTab({ theme, setTheme, layoutMode, setLayoutMode }: { theme: string, setTheme: (t: string) => void, layoutMode: string, setLayoutMode: (l: string) => void }) {
  const { fontSizeMultiplier, setFontSizeMultiplier } = useStore();
  const themes = [
    { id: 'theme-brutalist', label: 'BRUTALIST', desc: 'Syne / Dark / High Contrast', className: 'font-sans' },
    { id: 'theme-editorial', label: 'EDITORIAL', desc: 'Fraunces / Light / Journal', className: 'font-serif' },
    { id: 'theme-mono', label: 'TERMINAL', desc: 'JetBrains / Black / Green', className: 'font-mono' },
  ];

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

      <section className="space-y-8">
        <div className="flex items-center space-x-3 mb-6">
          <Type className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Interface Theme</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map(t => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative text-left p-6 border transition-all duration-300",
                  isActive ? "border-accent bg-accent/5" : "border-border bg-bg hover:border-mutedFg",
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

      <section className="space-y-8 mt-16">
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Interface Layout</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {layouts.map(l => {
            const isActive = layoutMode === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLayoutMode(l.id)}
                className={cn(
                  "relative text-left p-6 border transition-all duration-300",
                  isActive ? "border-accent bg-accent/5" : "border-border bg-bg hover:border-mutedFg"
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

      <section className="space-y-8 mt-16">
        <div className="flex items-center space-x-3 mb-6">
          <MonitorUp className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Global Font Scale</h2>
        </div>
        <div className="border border-border bg-bg p-6 max-w-md">
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
    </motion.div>
  );
}
