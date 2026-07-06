import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Check, Clock, FastForward, Play, Square } from 'lucide-react';
import { useStore } from '../lib/store';

export function FocusTab() {
  const { schedulerData, exams, fetchSchedulerData, activeSessionId, activeTopicId, startSession, stopSession, completeTopic } = useStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    fetchSchedulerData();
  }, [fetchSchedulerData]);

  useEffect(() => {
    let interval: number;
    if (activeSessionId) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSessionId]);

  if (!schedulerData) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-t-2 border-l-2 border-accent rounded-full"
        />
      </div>
    );
  }

  const { netTimeAvailable, timeAllocated, plan: topics } = schedulerData;

  const handleComplete = async (id: string) => {
    await completeTopic(id);
  };

  const handleToggleSession = async (id: string) => {
    if (activeTopicId === id && activeSessionId) {
      await stopSession();
    } else {
      await startSession(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <header className="mb-12 md:mb-20 flex flex-col md:flex-row justify-between items-end border-b border-border pb-8 gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">Focus<br/><span className="text-mutedFg">Queue</span></h1>
        </div>
        <div className="flex space-x-12 text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-mutedFg uppercase tracking-widest font-mono">Net Budget</span>
            <span className="text-4xl font-bold tracking-tighter text-fg">{netTimeAvailable}<span className="text-lg text-mutedFg ml-1">m</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-mutedFg uppercase tracking-widest font-mono">Allocated</span>
            <span className="text-4xl font-bold tracking-tighter text-accent">{Math.round(timeAllocated)}<span className="text-lg text-accent/50 ml-1">m</span></span>
          </div>
        </div>
      </header>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-border text-[10px] uppercase tracking-widest text-mutedFg font-mono">
          <div className="col-span-1">Stat</div>
          <div className="col-span-2">Context</div>
          <div className="col-span-5">Topic</div>
          <div className="col-span-1 text-center">Size</div>
          <div className="col-span-1 text-center">Session</div>
          <div className="col-span-2 text-right">Est. Time</div>
        </div>

        <AnimatePresence>
          {topics.map((topic: any, i: number) => {
            const isActiveSession = activeTopicId === topic.id && activeSessionId;
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={cn(
                  "grid grid-cols-12 gap-4 items-center px-4 py-4 border transition-all",
                  isActiveSession ? "border-accent bg-accent/5" : "border-border bg-bg hover:border-mutedFg group"
                )}
              >
                <div className="col-span-1">
                  <button 
                    onClick={() => handleComplete(topic.id)}
                    className="w-6 h-6 border border-border hover:border-accent flex items-center justify-center transition-colors bg-bg relative group/btn"
                  >
                    <Check className="w-4 h-4 text-transparent group-hover/btn:text-accent transition-colors" />
                  </button>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider transition-colors" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-mutedFg)' }}>
                    {topic.examName}
                  </span>
                  {topic.isSichtung && (
                    <span className="block text-[10px] uppercase tracking-widest mt-1" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>Sichtung</span>
                  )}
                </div>
                <div className="col-span-5 relative">
                  <h3 className={cn("text-lg md:text-xl font-bold tracking-tight", isActiveSession && "text-accent")} style={isActiveSession ? { color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' } : {}}>
                    {topic.title}
                  </h3>
                  {topic.status === 'IN_PROGRESS' && !isActiveSession && (
                    <span className="absolute -bottom-4 left-0 text-[9px] uppercase tracking-widest text-mutedFg">Paused</span>
                  )}
                  {isActiveSession && (
                    <span className="absolute -bottom-4 left-0 text-[9px] uppercase tracking-widest animate-pulse font-bold" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>Running</span>
                  )}
                </div>
                <div className="col-span-1 text-center font-mono font-bold text-lg" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>
                  {topic.size}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button 
                    onClick={() => handleToggleSession(topic.id)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center border transition-all", 
                      isActiveSession 
                        ? "bg-accent/10" 
                        : "border-border text-mutedFg hover:text-fg hover:border-fg"
                    )}
                    style={isActiveSession ? { borderColor: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)', color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' } : {}}
                  >
                    {isActiveSession ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
                <div className="col-span-2 text-right flex items-center justify-end font-mono text-sm text-mutedFg">
                  {isActiveSession ? (
                    <>
                      <Clock className="w-3 h-3 mr-2 animate-pulse" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }} />
                      <span className="font-bold" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>
                        {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-2" />
                      {Math.round(topic.scheduledMinutes || topic.expectedDurationMinutes || 60)}m
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {topics.length === 0 && (
          <div className="py-20 text-center border border-dashed border-border mt-8">
             <FastForward className="w-8 h-8 text-mutedFg mx-auto mb-4" />
             <p className="text-mutedFg uppercase tracking-widest text-sm font-bold">Queue Empty</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
