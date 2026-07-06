import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { PlusSquare, Database, AlertTriangle, Edit2, Trash2, X, CheckCircle, Pin } from 'lucide-react';

export function ManageTab() {
  const { exams, blockers, fetchExams, fetchSchedulerData, fetchBlockers, completeTopic, pinTopic } = useStore();

  useEffect(() => {
    fetchExams();
    fetchBlockers();
  }, [fetchExams, fetchBlockers]);

  const [examForm, setExamForm] = useState({ id: '', name: '', deadline: '' });
  const [topicForm, setTopicForm] = useState({ id: '', examId: '', title: '', size: 'S' });
  const [blockerForm, setBlockerForm] = useState({ id: '', title: '', dayOfWeek: '', startTime: '', endTime: '' });

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = examForm.id ? 'PATCH' : 'POST';
    const url = examForm.id ? `http://localhost:3000/exams/${examForm.id}` : 'http://localhost:3000/exams';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: examForm.name, deadline: examForm.deadline }),
      });
      if (res.ok) {
        setExamForm({ id: '', name: '', deadline: '' });
        fetchExams();
      }
    } catch (err) { console.error(err); }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = topicForm.id ? 'PATCH' : 'POST';
    const url = topicForm.id ? `http://localhost:3000/topics/${topicForm.id}` : 'http://localhost:3000/topics';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: topicForm.examId, title: topicForm.title, size: topicForm.size }),
      });
      if (res.ok) {
        setTopicForm({ id: '', examId: '', title: '', size: 'S' });
        fetchExams();
        fetchSchedulerData();
      }
    } catch (err) { console.error(err); }
  };

  const handleBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = blockerForm.id ? 'PATCH' : 'POST';
    const url = blockerForm.id ? `http://localhost:3000/blockers/${blockerForm.id}` : 'http://localhost:3000/blockers';
    try {
      const payload: any = {
        title: blockerForm.title,
        startTime: blockerForm.startTime,
        endTime: blockerForm.endTime,
      };
      if (blockerForm.dayOfWeek !== '') payload.dayOfWeek = parseInt(blockerForm.dayOfWeek, 10);
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setBlockerForm({ id: '', title: '', dayOfWeek: '', startTime: '', endTime: '' });
        fetchBlockers();
        fetchSchedulerData();
      }
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'exams' || type === 'topics') { fetchExams(); fetchSchedulerData(); }
        if (type === 'blockers') { fetchBlockers(); fetchSchedulerData(); }
      }
    } catch (e) { console.error(e); }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto space-y-12"
    >
      <header className="border-b border-border pb-8 flex items-end justify-between">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">Data<br/><span className="text-mutedFg">& Progress</span></h1>
        <div className="text-right">
           <Database className="w-12 h-12 text-accent" />
        </div>
      </header>

      {/* PROGRESS OVERVIEW */}
      <section className="mb-12 border border-border p-6 bg-bg">
        <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Progress Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exams?.map(ex => {
            const total = ex.topics?.length || 0;
            const completed = ex.topics?.filter(t => t.status === 'COMPLETED').length || 0;
            const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
            return (
              <div key={ex.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm uppercase truncate pr-4">{ex.name}</span>
                  <span className="text-[10px] font-mono text-mutedFg whitespace-nowrap">{completed} / {total} ({pct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-border overflow-hidden">
                  <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: ex.color || 'var(--color-accent)' }} />
                </div>
              </div>
            );
          })}
          {(!exams || exams.length === 0) && <div className="text-sm text-mutedFg">No exams created yet.</div>}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* EXAMS */}
        <div className="space-y-6">
          <div className="border border-border p-6 bg-bg">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-accent" />
                <h2 className="text-xl font-bold uppercase tracking-widest">{examForm.id ? 'Edit' : 'New'} Exam</h2>
              </div>
              {examForm.id && <button onClick={() => setExamForm({id:'', name:'', deadline:''})}><X className="w-4 h-4 text-mutedFg hover:text-fg" /></button>}
            </div>
            <form onSubmit={handleExamSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Name</label>
                <input required type="text" value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Deadline</label>
                <input required type="datetime-local" value={examForm.deadline} onChange={e => setExamForm({...examForm, deadline: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" />
              </div>
              <button type="submit" className="w-full bg-fg text-bg font-bold uppercase tracking-widest text-sm py-3 mt-4 hover:bg-accent transition-colors">
                {examForm.id ? 'Update Exam' : 'Create Exam'}
              </button>
            </form>
          </div>

          <div className="border border-border p-4 bg-bg">
            <h3 className="text-xs uppercase tracking-widest text-mutedFg mb-4">Existing Exams</h3>
            <div className="space-y-2">
              {exams?.map(ex => (
                <div key={ex.id} className="flex justify-between items-center text-sm p-2 hover:bg-accent/5 border-l-2" style={{ borderColor: ex.color || 'var(--color-border)' }}>
                  <span className="font-bold truncate">{ex.name}</span>
                  <div className="flex space-x-2 shrink-0">
                    <button onClick={() => setExamForm({ id: ex.id, name: ex.name, deadline: new Date(ex.deadline).toISOString().slice(0,16) })}><Edit2 className="w-4 h-4 text-mutedFg hover:text-accent" /></button>
                    <button onClick={() => deleteItem('exams', ex.id)}><Trash2 className="w-4 h-4 text-mutedFg hover:text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOPICS */}
        <div className="space-y-6">
          <div className="border border-border p-6 bg-bg">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <PlusSquare className="w-4 h-4 text-accent" />
                <h2 className="text-xl font-bold uppercase tracking-widest">{topicForm.id ? 'Edit' : 'New'} Topic</h2>
              </div>
              {topicForm.id && <button onClick={() => setTopicForm({id:'', examId:'', title:'', size:'S'})}><X className="w-4 h-4 text-mutedFg hover:text-fg" /></button>}
            </div>
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Select Exam</label>
                <select required value={topicForm.examId} onChange={e => setTopicForm({...topicForm, examId: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none">
                  <option value="" disabled className="bg-bg text-fg">Choose Exam...</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id} className="bg-bg text-fg">{ex.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Title</label>
                <input required type="text" value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Complexity</label>
                <select required value={topicForm.size} onChange={e => setTopicForm({...topicForm, size: e.target.value})} className="w-full border border-border bg-transparent text-accent font-bold px-3 py-2 font-mono text-sm focus:border-accent outline-none">
                  <option value="S" className="bg-bg text-fg">S (Small)</option>
                  <option value="M" className="bg-bg text-fg">M (Medium)</option>
                  <option value="L" className="bg-bg text-fg">L (Large)</option>
                  <option value="XL" className="bg-bg text-fg">XL (Extra Large)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-fg text-bg font-bold uppercase tracking-widest text-sm py-3 mt-4 hover:bg-accent transition-colors">
                {topicForm.id ? 'Update Topic' : 'Add Topic'}
              </button>
            </form>
          </div>

          <div className="border border-border p-4 bg-bg h-96 overflow-y-auto">
            <h3 className="text-xs uppercase tracking-widest text-mutedFg mb-4">Existing Topics</h3>
            <div className="space-y-4">
              {exams?.map(ex => {
                const pending = ex.topics?.filter(t => t.status !== 'COMPLETED') || [];
                const done = ex.topics?.filter(t => t.status === 'COMPLETED') || [];
                if (pending.length === 0 && done.length === 0) return null;

                return (
                  <div key={ex.id} className="mb-4">
                    <div className="text-[10px] uppercase font-bold text-accent mb-2 border-b border-border pb-1" style={{ color: ex.color || 'var(--color-accent)' }}>{ex.name}</div>
                    
                    {pending.length > 0 && <div className="text-[9px] uppercase tracking-widest text-mutedFg mb-1">To Do</div>}
                    {pending.map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center text-sm p-1.5 hover:bg-accent/5 pl-2 border-l-2 border-border mb-1 group transition-colors">
                        <span className="truncate flex items-center space-x-2">
                          {t.isPinned && <Pin className="w-3 h-3 text-accent shrink-0" />}
                          <span className={t.isPinned ? 'text-accent font-bold' : ''}>{t.title}</span>
                        </span>
                        <div className="flex space-x-2 opacity-50 group-hover:opacity-100 transition-opacity shrink-0 bg-bg pl-2">
                          {!t.isPinned && <button onClick={() => pinTopic(t.id)} title="Pin to Today"><Pin className="w-3 h-3 text-mutedFg hover:text-accent" /></button>}
                          <button onClick={() => completeTopic(t.id)} title="Complete Instantly"><CheckCircle className="w-3 h-3 text-mutedFg hover:text-green-500" /></button>
                          <button onClick={() => setTopicForm({ id: t.id, examId: t.examId, title: t.title, size: t.size })}><Edit2 className="w-3 h-3 text-mutedFg hover:text-accent" /></button>
                          <button onClick={() => deleteItem('topics', t.id)}><Trash2 className="w-3 h-3 text-mutedFg hover:text-red-500" /></button>
                        </div>
                      </div>
                    ))}

                    {done.length > 0 && <div className="text-[9px] uppercase tracking-widest text-mutedFg mt-3 mb-1">Completed</div>}
                    {done.map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center text-sm p-1.5 pl-2 border-l-2 border-green-500/30 mb-1 opacity-50 group">
                        <span className="truncate line-through text-mutedFg">{t.title}</span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 shrink-0">
                           <button onClick={() => deleteItem('topics', t.id)}><Trash2 className="w-3 h-3 text-mutedFg hover:text-red-500" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* BLOCKERS */}
        <div className="space-y-6">
          <div className="border border-border p-6 bg-bg">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <h2 className="text-xl font-bold uppercase tracking-widest">{blockerForm.id ? 'Edit' : 'New'} Blocker</h2>
              </div>
              {blockerForm.id && <button onClick={() => setBlockerForm({id:'', title:'', dayOfWeek:'', startTime:'', endTime:''})}><X className="w-4 h-4 text-mutedFg hover:text-fg" /></button>}
            </div>
            <form onSubmit={handleBlockerSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Title</label>
                <input required type="text" value={blockerForm.title} onChange={e => setBlockerForm({...blockerForm, title: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Day Of Week (0=Sun, 6=Sat)</label>
                <input type="number" min="0" max="6" value={blockerForm.dayOfWeek} onChange={e => setBlockerForm({...blockerForm, dayOfWeek: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Start Time</label>
                  <input required type="time" value={blockerForm.startTime} onChange={e => setBlockerForm({...blockerForm, startTime: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">End Time</label>
                  <input required type="time" value={blockerForm.endTime} onChange={e => setBlockerForm({...blockerForm, endTime: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-fg text-bg font-bold uppercase tracking-widest text-sm py-3 mt-4 hover:bg-accent transition-colors">
                {blockerForm.id ? 'Update Blocker' : 'Add Blocker'}
              </button>
            </form>
          </div>

          <div className="border border-border p-4 bg-bg">
            <h3 className="text-xs uppercase tracking-widest text-mutedFg mb-4">Existing Blockers</h3>
            <div className="space-y-2">
              {blockers?.map(b => (
                <div key={b.id} className="flex justify-between items-center text-sm p-2 hover:bg-accent/5 border-l-2 border-accent mb-1">
                  <div>
                    <div className="font-bold">{b.title}</div>
                    <div className="text-[10px] font-mono text-mutedFg">{b.dayOfWeek !== null ? `Day ${b.dayOfWeek}` : 'Specific'} • {b.startTime} - {b.endTime}</div>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button onClick={() => setBlockerForm({ id: b.id, title: b.title, dayOfWeek: b.dayOfWeek !== null ? b.dayOfWeek.toString() : '', startTime: b.startTime, endTime: b.endTime })}><Edit2 className="w-4 h-4 text-mutedFg hover:text-accent" /></button>
                    <button onClick={() => deleteItem('blockers', b.id)}><Trash2 className="w-4 h-4 text-mutedFg hover:text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
