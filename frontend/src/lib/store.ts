import { create } from 'zustand';

interface Exam {
  id: string;
  name: string;
  deadline: string;
  sichtungsphaseCompleted: boolean;
  velocityFactorM: number;
  color?: string;
  topics?: Topic[];
}

interface Topic {
  id: string;
  examId: string;
  title: string;
  size: string;
  status: string;
  order: number;
  isSichtung: boolean;
  isPinned?: boolean;
  expectedDurationMinutes: number;
  examName?: string;
}

interface SchedulerData {
  netTimeAvailable: number;
  timeAllocated: number;
  plan: Topic[];
}

interface AppState {
  exams: Exam[];
  blockers: any[];
  schedulerData: SchedulerData | null;
  weeklyPlan: any[];
  activeSessionId: string | null;
  activeTopicId: string | null;

  fetchExams: () => Promise<void>;
  fetchBlockers: () => Promise<void>;
  fetchSchedulerData: () => Promise<void>;
  fetchWeeklyPlan: () => Promise<void>;
  
  startSession: (topicId: string) => Promise<void>;
  stopSession: () => Promise<void>;
  completeTopic: (topicId: string) => Promise<void>;
  pinTopic: (topicId: string) => Promise<void>;
}

export const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

export const useStore = create<AppState>((set, get) => ({
  exams: [],
  blockers: [],
  schedulerData: null,
  weeklyPlan: [],
  activeSessionId: null,
  activeTopicId: null,

  fetchExams: async () => {
    try {
      const res = await fetch(`${API_URL}/exams`);
      const data = await res.json();
      set({ exams: data });
    } catch (e) {
      console.error('Failed to fetch exams', e);
    }
  },

  fetchBlockers: async () => {
    try {
      const res = await fetch(`${API_URL}/blockers`);
      const data = await res.json();
      set({ blockers: data });
    } catch (e) {
      console.error('Failed to fetch blockers', e);
    }
  },

  fetchSchedulerData: async () => {
    try {
      const res = await fetch(`${API_URL}/scheduler/daily`);
      const data = await res.json();
      set({ schedulerData: data });
    } catch (e) {
      console.error('Failed to fetch scheduler data', e);
    }
  },

  fetchWeeklyPlan: async () => {
    try {
      const res = await fetch(`${API_URL}/scheduler/weekly`);
      const data = await res.json();
      set({ weeklyPlan: data });
    } catch (e) {
      console.error('Failed to fetch weekly plan', e);
    }
  },

  startSession: async (topicId: string) => {
    try {
      const res = await fetch(`${API_URL}/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });
      if (!res.ok) throw new Error('Failed to start session');
      const session = await res.json();
      set({ activeSessionId: session.id, activeTopicId: topicId });
      
      // Refresh scheduler data to update status to IN_PROGRESS if necessary
      await get().fetchSchedulerData();
    } catch (e) {
      console.error(e);
    }
  },

  stopSession: async () => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;

    try {
      const res = await fetch(`${API_URL}/sessions/${activeSessionId}/stop`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to stop session');
      set({ activeSessionId: null, activeTopicId: null });
      
      // Refresh to see updated actualDurationMinutes or any other changes
      await get().fetchSchedulerData();
    } catch (e) {
      console.error(e);
    }
  },

  completeTopic: async (topicId: string) => {
    try {
      // If there is an active session for this topic, stop it first
      const { activeTopicId, stopSession } = get();
      if (activeTopicId === topicId) {
        await stopSession();
      }

      const res = await fetch(`${API_URL}/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!res.ok) throw new Error('Failed to complete topic');
      
      // Data changed, refetch everything to update velocity and plan
      await get().fetchSchedulerData();
      await get().fetchExams();
    } catch (e) {
      console.error(e);
    }
  },

  pinTopic: async (topicId: string) => {
    try {
      const res = await fetch(`${API_URL}/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: true }),
      });
      if (!res.ok) throw new Error('Failed to pin topic');
      await get().fetchSchedulerData();
      await get().fetchExams();
    } catch (e) {
      console.error(e);
    }
  }
}));
