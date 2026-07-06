import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore, API_URL } from '../lib/store';
import { PlusSquare, Database, AlertTriangle, Edit2, Trash2, X, CheckCircle, Pin } from 'lucide-react';

export function ManageTab() {
  const { exams, blockers, fetchExams, fetchSchedulerData, fetchBlockers, completeTopic, pinTopic } = useStore();

  useEffect(() => {
    fetchExams();
    fetchBlockers();
  }, [fetchExams, fetchBlockers]);

  const [examForm, setExamForm] = useState({ id: '', name: '', deadline: '' });
  const [topicForm, setTopicForm] = useState({ id: '', examId: '', title: '', size: 'S', order: '', notBefore: '', isSichtung: false });
  const [blockerForm, setBlockerForm] = useState({ id: '', title: '', dayOfWeek: '', startTime: '', endTime: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = examForm.id ? 'PATCH' : 'POST';
    const url = examForm.id ? `${API_URL}/exams/${examForm.id}` : `${API_URL}/exams`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: examForm.name, deadline: examForm.deadline }),
      });
      if (res.ok) {
        setExamForm({ id: '', name: '', deadline: '' });
        fetchExams();
        showSuccess('Exam saved successfully!');
      }
    } catch (err) { console.error(err); }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = topicForm.id ? 'PATCH' : 'POST';
    const url = topicForm.id ? `${API_URL}/topics/${topicForm.id}` : `${API_URL}/topics`;
    try {
      const payload: any = { examId: topicForm.examId, title: topicForm.title, size: topicForm.size, isSichtung: topicForm.isSichtung };
      if (topicForm.order !== '') payload.order = parseInt(topicForm.order.toString(), 10);
      if (topicForm.notBefore !== '') payload.notBefore = new Date(topicForm.notBefore).toISOString();
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setTopicForm({ id: '', examId: '', title: '', size: 'S', order: '', notBefore: '', isSichtung: false });
        fetchExams();
        fetchSchedulerData();
        showSuccess('Topic saved successfully!');
      }
    } catch (err) { console.error(err); }
  };

  const handleBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = blockerForm.id ? 'PATCH' : 'POST';
    const url = blockerForm.id ? `${API_URL}/blockers/${blockerForm.id}` : `${API_URL}/blockers`;
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
        showSuccess('Blocker saved successfully!');
      }
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      const res = await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'exams' || type === 'topics') { fetchExams(); fetchSchedulerData(); }
        if (type === 'blockers') { fetchBlockers(); fetchSchedulerData(); }
        showSuccess('Item deleted successfully!');
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
      <header className="border-b border-border pb-8 flex items-end justify-between relative">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">Data<br/><span className="text-mutedFg">& Progress</span></h1>
        <div className="text-right flex flex-col items-end space-y-4">
           {successMsg && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
               className="text-xs font-bold uppercase tracking-widest text-green-500 bg-green-500/10 px-3 py-1 border border-green-500/20"
             >
               {successMsg}
             </motion.div>
           )}
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

      {/* CREATE NEW DATA SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-2">Create New Data</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* EXAM FORM */}
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

          {/* TOPIC FORM */}
          <div className="border border-border p-6 bg-bg">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <PlusSquare className="w-4 h-4 text-accent" />
                <h2 className="text-xl font-bold uppercase tracking-widest">{topicForm.id ? 'Edit' : 'New'} Topic</h2>
              </div>
              {topicForm.id && <button onClick={() => setTopicForm({id:'', examId:'', title:'', size:'S', order: '', notBefore: '', isSichtung: false})}><X className="w-4 h-4 text-mutedFg hover:text-fg" /></button>}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Complexity</label>
                  <select required value={topicForm.size} onChange={e => setTopicForm({...topicForm, size: e.target.value})} className="w-full border border-border bg-transparent text-accent font-bold px-3 py-2 font-mono text-sm focus:border-accent outline-none">
                    <option value="S" className="bg-bg text-fg">S (Small)</option>
                    <option value="M" className="bg-bg text-fg">M (Medium)</option>
                    <option value="L" className="bg-bg text-fg">L (Large)</option>
                    <option value="XL" className="bg-bg text-fg">XL (Extra Large)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Chapter / Order (Opt)</label>
                  <input type="number" value={topicForm.order} onChange={e => setTopicForm({...topicForm, order: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" placeholder="e.g. 1" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mutedFg block mb-1">Defer Until Date (Opt)</label>
                <input type="date" value={topicForm.notBefore} onChange={e => setTopicForm({...topicForm, notBefore: e.target.value})} className="w-full border border-border bg-transparent text-fg px-3 py-2 font-mono text-sm focus:border-accent outline-none" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="isSichtung" checked={topicForm.isSichtung} onChange={e => setTopicForm({...topicForm, isSichtung: e.target.checked})} className="accent-accent" />
                <label htmlFor="isSichtung" className="text-xs font-bold uppercase tracking-widest text-fg">Is Sichtungsphase?</label>
              </div>
              <button type="submit" className="w-full bg-fg text-bg font-bold uppercase tracking-widest text-sm py-3 mt-4 hover:bg-accent transition-colors">
                {topicForm.id ? 'Update Topic' : 'Add Topic'}
              </button>
            </form>
          </div>

          {/* BLOCKER FORM */}
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

        </div>
      </section>

      {/* MANAGE EXISTING DATA SECTION */}
      <section className="space-y-12">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-2 mb-4">Manage Topics</h2>
          <div className="border border-border bg-bg overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest text-mutedFg">
                  <th className="p-3 font-medium">Exam</th>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Stat</th>
                  <th className="p-3 font-medium text-center">Ch.</th>
                  <th className="p-3 font-medium text-center">Size</th>
                  <th className="p-3 font-medium">Not Before</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exams?.flatMap(ex => (ex.topics || []).map(t => (
                  <tr key={t.id} className="hover:bg-accent/5 group">
                    <td className="p-3 font-bold" style={{ color: ex.color || 'var(--color-fg)' }}>{ex.name}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {t.isPinned && <Pin className="w-3 h-3 text-accent" />}
                        <span className={t.status === 'COMPLETED' ? 'line-through text-mutedFg' : ''}>{t.title}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {t.status === 'COMPLETED' ? <span className="text-green-500 text-[10px] uppercase font-bold">Done</span> : 
                       t.isSichtung ? <span className="text-accent text-[10px] uppercase font-bold">Sichtung</span> : 
                       <span className="text-mutedFg text-[10px] uppercase font-bold">Pending</span>}
                    </td>
                    <td className="p-3 text-center text-mutedFg font-mono">{t.order > 0 ? t.order : '-'}</td>
                    <td className="p-3 text-center text-accent font-bold font-mono">{t.size}</td>
                    <td className="p-3 text-mutedFg font-mono">{(t as any).notBefore ? new Date((t as any).notBefore).toLocaleDateString() : '-'}</td>
                    <td className="p-3">
                      <div className="flex justify-end space-x-3 opacity-50 group-hover:opacity-100 transition-opacity">
                        {t.status !== 'COMPLETED' && !t.isPinned && <button onClick={() => pinTopic(t.id)} title="Pin to Today"><Pin className="w-4 h-4 text-mutedFg hover:text-accent transition-colors" /></button>}
                        {t.status !== 'COMPLETED' && <button onClick={() => completeTopic(t.id)} title="Complete Instantly"><CheckCircle className="w-4 h-4 text-mutedFg hover:text-green-500 transition-colors" /></button>}
                        <button onClick={() => setTopicForm({ id: t.id, examId: t.examId, title: t.title, size: t.size, order: t.order ? t.order.toString() : '', notBefore: t.notBefore ? (t as any).notBefore.slice(0,10) : '', isSichtung: t.isSichtung })} title="Edit"><Edit2 className="w-4 h-4 text-mutedFg hover:text-accent transition-colors" /></button>
                        <button onClick={() => deleteItem('topics', t.id)} title="Delete"><Trash2 className="w-4 h-4 text-mutedFg hover:text-red-500 transition-colors" /></button>
                      </div>
                    </td>
                  </tr>
                )))}
                {(!exams || exams.flatMap(ex => ex.topics || []).length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-mutedFg uppercase tracking-widest text-sm font-bold">No Topics Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EXAMS LIST / TABLE */}
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-2 mb-4">Manage Exams</h2>
            <div className="border border-border bg-bg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-widest text-mutedFg">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Deadline</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {exams?.map(ex => (
                    <tr key={ex.id} className="hover:bg-accent/5 group">
                      <td className="p-3 font-bold" style={{ color: ex.color || 'var(--color-fg)' }}>{ex.name}</td>
                      <td className="p-3 text-mutedFg font-mono">{new Date(ex.deadline).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex justify-end space-x-3 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setExamForm({ id: ex.id, name: ex.name, deadline: new Date(ex.deadline).toISOString().slice(0,16) })} title="Edit"><Edit2 className="w-4 h-4 text-mutedFg hover:text-accent transition-colors" /></button>
                          <button onClick={() => deleteItem('exams', ex.id)} title="Delete"><Trash2 className="w-4 h-4 text-mutedFg hover:text-red-500 transition-colors" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!exams || exams.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-mutedFg uppercase tracking-widest text-sm font-bold">No Exams Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOCKERS LIST / TABLE */}
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-2 mb-4">Manage Blockers</h2>
            <div className="border border-border bg-bg overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-widest text-mutedFg">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Schedule</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {blockers?.map(b => (
                    <tr key={b.id} className="hover:bg-accent/5 group">
                      <td className="p-3 font-bold">{b.title}</td>
                      <td className="p-3 text-mutedFg font-mono text-xs">
                        {b.dayOfWeek !== null ? `Day ${b.dayOfWeek}` : 'Specific'} <br/> {b.startTime} - {b.endTime}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end space-x-3 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setBlockerForm({ id: b.id, title: b.title, dayOfWeek: b.dayOfWeek !== null ? b.dayOfWeek.toString() : '', startTime: b.startTime, endTime: b.endTime })} title="Edit"><Edit2 className="w-4 h-4 text-mutedFg hover:text-accent transition-colors" /></button>
                          <button onClick={() => deleteItem('blockers', b.id)} title="Delete"><Trash2 className="w-4 h-4 text-mutedFg hover:text-red-500 transition-colors" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!blockers || blockers.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-mutedFg uppercase tracking-widest text-sm font-bold">No Blockers Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
