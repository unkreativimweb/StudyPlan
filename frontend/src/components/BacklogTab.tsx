import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '../lib/store';

export function BacklogTab() {
  const { exams, fetchExams } = useStore();

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <header className="mb-12 md:mb-20 border-b border-border pb-8 flex items-end justify-between">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">Data<br/><span className="text-mutedFg">Base</span></h1>
        <div className="text-right">
           <Database className="w-12 h-12 text-accent" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {exams.map((exam: any, i: number) => (
          <motion.div 
            key={exam.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="border border-border p-6 relative group overflow-hidden bg-bg hover:border-accent/50 transition-colors"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-0 group-hover:opacity-5 transition-opacity blur-3xl rounded-full" />
            
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-bold tracking-tight">{exam.name}</h2>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Deadline</span>
                <span className="font-mono text-sm flex items-center text-accent">
                  <Calendar className="w-3 h-3 mr-2" />
                  {new Date(exam.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Sichtung</span>
                <span className="text-sm font-bold uppercase">
                  {exam.sichtungsphaseCompleted ? <span className="text-accent">Completed</span> : <span className="text-fg">Pending</span>}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Velocity M</span>
                <span className="text-sm font-mono flex items-center justify-end">
                  <TrendingUp className="w-3 h-3 mr-2 text-mutedFg" />
                  {exam.velocityFactorM.toFixed(2)}x
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {exams.length === 0 && (
          <div className="col-span-1 md:col-span-2 py-20 border border-dashed border-border text-center text-mutedFg uppercase tracking-widest text-sm font-bold">
            No Records Found
          </div>
        )}
      </div>
    </motion.div>
  );
}
