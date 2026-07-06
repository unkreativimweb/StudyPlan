import { useEffect, useState } from 'react';
import { Play, Square, CheckCircle, Clock, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:3000/scheduler/daily')
      .then(res => res.json())
      .then(data => setPlan(data))
      .catch(err => console.error(err));
  }, []);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <Layers className="w-12 h-12 text-indigo-500 mb-4" />
          <p className="text-slate-400 font-medium">Lade Tagesplan...</p>
        </div>
      </div>
    );
  }

  const { netTimeAvailable, timeAllocated, blockedMinutes, plan: topics } = plan;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex items-end justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dein Lern-Dashboard
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Fokusmodus aktiviert. Das ist heute zu tun.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Netto Budget</span>
              <span className="text-xl font-bold text-emerald-400">{netTimeAvailable} <span className="text-sm font-normal text-emerald-500">Min</span></span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Verplant</span>
              <span className="text-xl font-bold text-amber-400">{Math.round(timeAllocated)} <span className="text-sm font-normal text-amber-500">Min</span></span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Task List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center mb-6">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-400" />
              Priorisierte Themen
            </h2>
            
            {topics.length === 0 ? (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-12 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300">Alles erledigt!</h3>
                <p className="text-slate-500 mt-2">Du hast alle Deadlines im Griff. (Oder du musst noch Fächer anlegen!)</p>
              </div>
            ) : (
              topics.map((topic: any) => (
                <div key={topic.id} className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800/50 hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden">
                  {/* Subtle gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {topic.examName}
                        </span>
                        {topic.isSichtung && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                            Sichtungsphase
                          </span>
                        )}
                        <span className="text-xs font-medium text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          ~{Math.round(topic.expectedDurationMinutes || 60)} Min
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{topic.title}</h3>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      <div className="text-center px-4 py-2 bg-slate-950/50 rounded-xl border border-slate-800">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Size</span>
                        <span className="block text-lg font-extrabold text-indigo-400">{topic.size}</span>
                      </div>
                      
                      {topic.status === 'IN_PROGRESS' ? (
                        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:scale-105 transition-all ring-1 ring-amber-500/30">
                          <Square className="w-5 h-5 fill-current" />
                        </button>
                      ) : (
                        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:scale-105 transition-all ring-1 ring-emerald-500/30">
                          <Play className="w-5 h-5 fill-current ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-indigo-300 mb-2">Tages-Übersicht</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Basierend auf deiner Velocity und deinen Terminen hast du heute noch {netTimeAvailable} Minuten produktive Zeit.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Geblockt (Uni/Schlaf)</span>
                  <span className="font-mono text-slate-300">{blockedMinutes}m</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600" style={{ width: '100%' }}></div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-slate-400">Lern-Planung</span>
                  <span className="font-mono text-indigo-400">{Math.round(timeAllocated)}m / {netTimeAvailable}m</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (timeAllocated / netTimeAvailable) * 100)}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-3xl p-6">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Aktionen</h3>
               <button className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center">
                 + Neues Fach anlegen
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
