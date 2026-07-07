import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '../lib/utils';
import { Check, Clock, FastForward, Play, Square } from 'lucide-react';
import { useStore, API_URL } from '../lib/store';

export function FocusTab() {
  const { weeklyPlan, exams, fetchSchedulerData, fetchWeeklyPlan, fetchExams, activeSessionId, activeTopicId, startSession, stopSession, completeTopic } = useStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    fetchSchedulerData();
    fetchWeeklyPlan();
    fetchExams();
  }, [fetchSchedulerData, fetchWeeklyPlan, fetchExams]);

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

  if (!weeklyPlan || weeklyPlan.length === 0) {
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

  const todayData = weeklyPlan[0];
  const tomorrowData = weeklyPlan[1];

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

  const onReorderTopics = async (newOrder: any[]) => {
    const promises = newOrder.map((t, index) => {
      if (t.order !== index + 1) {
        return fetch(`${API_URL}/topics/${t.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: index + 1 }),
        });
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
    fetchExams();
    fetchWeeklyPlan();
    fetchSchedulerData();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <header className={cn(
        "flex flex-col md:flex-row justify-between items-end border-b border-border pb-8 gap-8 transition-all duration-700",
        activeSessionId ? "opacity-0 h-0 mb-0 pb-0 overflow-hidden" : "mb-12 md:mb-20 opacity-100 h-auto"
      )}>
        <div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">Focus<br/><span className="text-mutedFg">Queue</span></h1>
        </div>
        <div className="flex space-x-12 text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-mutedFg uppercase tracking-widest font-mono">Net Budget</span>
            <span className="text-4xl font-bold tracking-tighter text-fg">{todayData?.netTimeAvailable || 0}<span className="text-lg text-mutedFg ml-1">m</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-mutedFg uppercase tracking-widest font-mono">Allocated</span>
            <span className="text-4xl font-bold tracking-tighter text-accent">{Math.round(todayData?.timeAllocated || 0)}<span className="text-lg text-accent/50 ml-1">m</span></span>
          </div>
        </div>
      </header>

      {/* TODAY SECTION */}
      <div className="space-y-6">
        {!activeSessionId && (
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-2xl font-bold uppercase tracking-widest">Today</h2>
            <span className="text-[10px] uppercase tracking-widest text-mutedFg font-mono">{new Date(todayData?.date).toLocaleDateString()}</span>
          </div>
        )}

        {!activeSessionId && (
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 pb-2 border-b border-border text-[10px] uppercase tracking-widest text-mutedFg font-mono">
            <div className="col-span-1">Stat</div>
            <div className="col-span-2">Context</div>
            <div className="col-span-5">Topic</div>
            <div className="col-span-1 text-center">Size</div>
            <div className="col-span-1 text-center">Session</div>
            <div className="col-span-2 text-right">Est. Time</div>
          </div>
        )}

        <Reorder.Group axis="y" values={todayData?.plan || []} onReorder={onReorderTopics} className="space-y-2">
          <AnimatePresence>
            {(todayData?.plan || []).map((topic: any, i: number) => {
              const isActiveSession = activeTopicId === topic.id && activeSessionId;
              
              // In Zen mode, ONLY render the active topic
              if (activeSessionId && !isActiveSession) return null;

              return (
                <Reorder.Item
                  key={topic.id}
                  value={topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={cn(
                    "flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center px-4 py-4 border transition-all",
                    isActiveSession ? "border-accent bg-bg" : "border-border bg-bg hover:border-mutedFg group cursor-grab active:cursor-grabbing",
                    activeSessionId && isActiveSession && "h-[60vh] text-center flex flex-col justify-center gap-12 rounded-[20px] shadow-2xl border-2"
                  )}
                  style={isActiveSession ? { borderColor: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' } : {}}
                >
                  {/* Zen Mode Layout */}
                  {activeSessionId && isActiveSession ? (
                    <div className="col-span-12 flex flex-col items-center justify-center space-y-8 w-full">
                      <div className="space-y-4 text-center">
                        <span className="text-sm font-bold uppercase tracking-widest" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-mutedFg)' }}>
                          {topic.examName}
                        </span>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-fg" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>
                          {topic.title}
                        </h2>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-6xl md:text-8xl font-mono font-bold" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>
                        <span>
                          {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleToggleSession(topic.id)}
                        className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-accent text-accent hover:bg-accent/10 transition-colors mt-8"
                        style={{ borderColor: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)', color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}
                      >
                        <Square className="w-8 h-8" />
                      </button>
                    </div>
                  ) : (
                  
                  /* Standard List Layout */
                  <>
                    <div className="flex items-start md:items-center justify-between md:contents w-full">
                      <div className="flex items-center space-x-2 md:col-span-1">
                        <div className="w-2 h-8 flex flex-col justify-center space-y-[2px] opacity-20 group-hover:opacity-100 transition-opacity mr-2 hidden md:flex">
                          <div className="w-1 h-1 bg-fg rounded-full"></div>
                          <div className="w-1 h-1 bg-fg rounded-full"></div>
                          <div className="w-1 h-1 bg-fg rounded-full"></div>
                        </div>
                        <button 
                          onClick={() => handleComplete(topic.id)}
                          className="w-6 h-6 border border-border hover:border-accent flex items-center justify-center transition-colors bg-bg relative group/btn"
                        >
                          <Check className="w-4 h-4 text-transparent group-hover/btn:text-accent transition-colors" />
                        </button>
                      </div>

                      {/* Mobile Only: Time and Session Button at the top right */}
                      <div className="flex md:hidden items-center space-x-3">
                        <div className="font-mono text-sm text-mutedFg flex items-center">
                           <Clock className="w-3 h-3 mr-1" />
                           {Math.round(topic.scheduledMinutes || topic.expectedDurationMinutes || 60)}m
                        </div>
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
                    </div>

                    <div className="md:col-span-2 mt-2 md:mt-0">
                      <span className="text-xs font-bold uppercase tracking-wider transition-colors" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-mutedFg)' }}>
                        {topic.examName}
                      </span>
                      {topic.isSichtung && (
                        <span className="inline-block md:block ml-2 md:ml-0 text-[10px] uppercase tracking-widest mt-1" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>Sichtung</span>
                      )}
                    </div>
                    
                    <div className="md:col-span-5 relative mt-1 md:mt-0">
                      <h3 className={cn("text-lg md:text-xl font-bold tracking-tight", isActiveSession && "text-accent")} style={isActiveSession ? { color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' } : {}}>
                        {topic.title}
                      </h3>
                      {topic.status === 'IN_PROGRESS' && !isActiveSession && (
                        <span className="relative md:absolute md:-bottom-4 left-0 text-[9px] uppercase tracking-widest text-mutedFg block mt-1 md:mt-0">Paused</span>
                      )}
                      {isActiveSession && (
                        <span className="relative md:absolute md:-bottom-4 left-0 text-[9px] uppercase tracking-widest animate-pulse font-bold block mt-1 md:mt-0" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>Running</span>
                      )}
                    </div>
                    
                    {/* Desktop Only: Size, Session, Time */}
                    <div className="hidden md:block md:col-span-1 text-center font-mono font-bold text-lg" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>
                      {topic.size}
                    </div>
                    <div className="hidden md:flex md:col-span-1 justify-center">
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
                    <div className="hidden md:flex md:col-span-2 text-right items-center justify-end font-mono text-sm text-mutedFg">
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
                  </>
                  )}
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
        
        {(!todayData?.plan || todayData.plan.length === 0) && !activeSessionId && (
          <div className="py-12 text-center border border-dashed border-border mt-4">
             <FastForward className="w-8 h-8 text-mutedFg mx-auto mb-4" />
             <p className="text-mutedFg uppercase tracking-widest text-sm font-bold">Queue Empty</p>
          </div>
        )}
      </div>

      {/* TOMORROW SECTION */}
      {!activeSessionId && tomorrowData?.plan?.length > 0 && (
        <div className="space-y-6 mt-16 pt-8 border-t border-border opacity-70 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-2xl font-bold uppercase tracking-widest">Tomorrow</h2>
            <span className="text-[10px] uppercase tracking-widest text-mutedFg font-mono">{new Date(tomorrowData?.date).toLocaleDateString()}</span>
          </div>

          <Reorder.Group axis="y" values={tomorrowData?.plan || []} onReorder={onReorderTopics} className="space-y-2">
            <AnimatePresence>
              {(tomorrowData?.plan || []).map((topic: any, i: number) => {
                return (
                  <Reorder.Item
                    key={topic.id}
                    value={topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center px-4 py-3 border border-border bg-bg/50 hover:bg-bg hover:border-mutedFg group cursor-grab active:cursor-grabbing transition-all"
                  >
                    <div className="flex items-start md:items-center justify-between md:contents w-full">
                      <div className="flex items-center space-x-2 md:col-span-1">
                        <div className="w-2 h-8 flex flex-col justify-center space-y-[2px] opacity-20 group-hover:opacity-100 transition-opacity mr-2 hidden md:flex">
                          <div className="w-1 h-1 bg-fg rounded-full"></div>
                          <div className="w-1 h-1 bg-fg rounded-full"></div>
                          <div className="w-1 h-1 bg-fg rounded-full"></div>
                        </div>
                        <button 
                          onClick={() => handleComplete(topic.id)}
                          className="w-5 h-5 border border-border hover:border-accent flex items-center justify-center transition-colors bg-bg relative group/btn"
                        >
                          <Check className="w-3 h-3 text-transparent group-hover/btn:text-accent transition-colors" />
                        </button>
                      </div>
                      
                      {/* Mobile Time */}
                      <div className="flex md:hidden text-right items-center justify-end font-mono text-xs text-mutedFg">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.round(topic.scheduledMinutes || topic.expectedDurationMinutes || 60)}m
                      </div>
                    </div>

                    <div className="md:col-span-2 mt-2 md:mt-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-mutedFg)' }}>
                        {topic.examName}
                      </span>
                    </div>
                    <div className="md:col-span-5 relative mt-1 md:mt-0">
                      <h3 className="text-sm md:text-md font-bold tracking-tight text-mutedFg group-hover:text-fg transition-colors">
                        {topic.title}
                      </h3>
                    </div>
                    <div className="hidden md:block md:col-span-1 text-center font-mono font-bold text-md opacity-50" style={{ color: exams?.find(e => e.id === topic.examId)?.color || 'var(--color-accent)' }}>
                      {topic.size}
                    </div>
                    <div className="hidden md:flex md:col-span-1 justify-center">
                    </div>
                    <div className="hidden md:flex md:col-span-2 text-right items-center justify-end font-mono text-xs text-mutedFg">
                      <Clock className="w-3 h-3 mr-2" />
                      {Math.round(topic.scheduledMinutes || topic.expectedDurationMinutes || 60)}m
                    </div>
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}
    </motion.div>
  );
}
