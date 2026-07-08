import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

export function CalendarTab() {
  const { blockers, exams, weeklyPlan, schedulerData, fetchBlockers, fetchExams, fetchWeeklyPlan, fetchSchedulerData } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchBlockers();
    fetchExams();
    fetchWeeklyPlan();
    fetchSchedulerData();
  }, [fetchBlockers, fetchExams, fetchWeeklyPlan, fetchSchedulerData]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getEventsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayOfWeek = date.getDay();
    const events: any[] = [];

    // Blockers
    blockers?.forEach(b => {
      if (b.dayOfWeek === dayOfWeek) {
        events.push({ type: 'blocker', title: b.title, color: '#f59e0b' });
      }
    });

    // Exams
    exams?.forEach(e => {
      const examDate = new Date(e.deadline);
      if (examDate.getDate() === day && examDate.getMonth() === currentMonth.getMonth() && examDate.getFullYear() === currentMonth.getFullYear()) {
        events.push({ type: 'exam', title: `DEADLINE: ${e.name}`, color: e.color || '#ef4444' });
      }
    });

    // Today's and Upcoming Queue
    const today = new Date();
    const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    
    if (isToday) {
      schedulerData?.plan?.forEach((t: any) => {
        const examColor = exams?.find(e => e.id === t.examId)?.color || '#10b981';
        events.push({ type: 'queue', title: `QUEUE: ${t.title}`, color: examColor });
      });
      } else if (weeklyPlan) {
      const planDay = weeklyPlan.find((wp: any) => {
        const wpDate = new Date(wp.date);
        return wpDate.getDate() === day && wpDate.getMonth() === currentMonth.getMonth() && wpDate.getFullYear() === currentMonth.getFullYear();
      });
      if (planDay && planDay.plan) {
        planDay.plan.forEach((t: any) => {
          const examColor = exams?.find(e => e.id === t.examId)?.color || '#3b82f6';
          events.push({ type: 'plan', title: `PLAN: ${t.title}`, color: examColor });
        });
      }
    }

    return events;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-12"
    >
      <header className="border-b border-border pb-8">
        <h1 className="text-5xl font-bold tracking-tighter uppercase flex items-center space-x-4">
          <CalendarIcon className="w-10 h-10 text-accent" />
          <span>Calendar & Forecast</span>
        </h1>
      </header>

      {/* 7-Day Leisurely Suggestion */}
      <section className="border border-border bg-bg overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border bg-bg/50">
          <h2 className="text-2xl font-bold tracking-widest uppercase inline-block">7-Day Smart Projection</h2>
          <p className="text-mutedFg text-[10px] uppercase tracking-widest mt-1">A leisurely suggestion of what needs to be done based on your daily available time.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
          {weeklyPlan?.map((day: any, i: number) => (
            <div key={i} className="p-5 relative overflow-hidden group hover:bg-accent/5 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="font-bold text-lg">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="text-[10px] font-mono text-mutedFg uppercase tracking-widest">{day.netTimeAvailable}m net</span>
              </div>
              
              {day.plan.length === 0 ? (
                <div className="text-mutedFg text-xs uppercase tracking-widest mt-4">Free day or no tasks scheduled.</div>
              ) : (
                <ul className="space-y-3">
                  {day.plan.map((t: any, j: number) => (
                    <li key={j} className="text-sm border-l-2 pl-3" style={{ borderColor: t.examColor || 'var(--color-accent)' }}>
                      <div className="font-bold truncate text-xs uppercase">{t.title}</div>
                      <div className="text-[10px] text-mutedFg font-mono">{t.examName} • {t.scheduledMinutes}m</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Monthly Grid */}
      <section className="border border-border bg-bg overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border bg-bg/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-widest uppercase">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="border border-border px-4 py-2 hover:bg-accent/10 transition-colors text-xs font-bold tracking-widest uppercase"
            >
              PREV
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="border border-border px-4 py-2 hover:bg-accent/10 transition-colors text-xs font-bold tracking-widest uppercase"
            >
              NEXT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="bg-bg/80 p-3 text-center text-[10px] font-bold uppercase tracking-widest text-mutedFg border-b border-border">
              {d}
            </div>
          ))}
          
          {blanks.map(b => (
            <div key={`blank-${b}`} className="bg-bg/50 p-1 md:p-2 min-h-[80px] md:min-h-[120px]" />
          ))}
          
          {days.map(d => {
            const events = getEventsForDay(d);
            const isToday = new Date().getDate() === d && new Date().getMonth() === currentMonth.getMonth();
            
            return (
              <div key={d} className={cn("bg-bg p-1 md:p-2 min-h-[80px] md:min-h-[120px] transition-colors hover:bg-accent/5 overflow-hidden", isToday && "ring-2 ring-inset ring-accent z-10")}>
                <div className={cn("font-bold text-xs mb-1 md:mb-2", isToday ? "text-accent" : "text-fg")}>{d}</div>
                <div className="space-y-1">
                  {events.map((ev, i) => (
                    <div 
                      key={i} 
                      className="text-[9px] px-1.5 py-0.5 rounded-sm truncate uppercase font-bold tracking-wider"
                      style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </motion.div>
  );
}
