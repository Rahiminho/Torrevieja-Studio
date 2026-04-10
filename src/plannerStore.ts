import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ContentPlan,
  ScheduleTask,
  IdeaItem,
  PlannerConfig,
  PlannedVideo,
  WeekendSlot,
  VideoSize,
} from './plannerTypes';
import { generateSchedule } from './lib/planAlgorithm';

const PLAN_KEY    = 'torrevieja-content-plan-v2';
const IDEAS_KEY   = 'torrevieja-ideas-v2';
const CONFIG_KEY  = 'torrevieja-planner-config-v2';

// ---------------------------------------------------------------------------
// Seed ideas so the app doesn't open empty
// ---------------------------------------------------------------------------

function buildSeedIdeas(): IdeaItem[] {
  const now = new Date().toISOString();
  return [
    { id: uuidv4(), title: 'Mon setup gaming 2025', description: 'Tour complet de mon setup : PC, périphériques, déco.', tags: ['setup', 'gaming'], notes: 'Penser au cable management', size: 'moyenne', createdAt: now },
    { id: uuidv4(), title: 'Réaction à ma 1ère vidéo', description: 'Je regarde et commente ma toute première vidéo avec humour.', tags: ['réaction', 'nostalgie'], notes: '', size: 'petite', createdAt: now },
    { id: uuidv4(), title: 'Vlog : une journée dans ma vie', description: 'Je filme ma journée de A à Z.', tags: ['vlog', 'lifestyle'], notes: '', size: 'petite', createdAt: now },
    { id: uuidv4(), title: 'Top 5 moments drôles du mois', description: 'Compilation humoristique de mes meilleurs fails.', tags: ['humour', 'compilation'], notes: '', size: 'petite', createdAt: now },
    { id: uuidv4(), title: 'Je teste un jeu en accès anticipé', description: 'Session de découverte + avis honnête.', tags: ['gaming', 'test'], notes: '', size: 'moyenne', createdAt: now },
  ];
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function loadPlan(): ContentPlan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (raw) return JSON.parse(raw) as ContentPlan;
  } catch { /* ignore */ }
  return null;
}

function loadIdeas(): IdeaItem[] {
  try {
    const raw = localStorage.getItem(IDEAS_KEY);
    if (raw) return JSON.parse(raw) as IdeaItem[];
  } catch { /* ignore */ }
  const seeds = buildSeedIdeas();
  localStorage.setItem(IDEAS_KEY, JSON.stringify(seeds));
  return seeds;
}

function loadConfig(): PlannerConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw) as PlannerConfig;
  } catch { /* ignore */ }
  return { channelName: 'Ma Chaîne', subscriberCount: 189 };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePlannerStore() {
  const [activePlan, setActivePlan] = useState<ContentPlan | null>(loadPlan);
  const [ideas, setIdeas]           = useState<IdeaItem[]>(loadIdeas);
  const [config, setConfig]         = useState<PlannerConfig>(loadConfig);

  useEffect(() => {
    if (activePlan) {
      localStorage.setItem(PLAN_KEY, JSON.stringify(activePlan));
    } else {
      localStorage.removeItem(PLAN_KEY);
    }
  }, [activePlan]);

  useEffect(() => { localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas)); }, [ideas]);
  useEffect(() => { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }, [config]);

  // ── Plan management ────────────────────────────────────────────────────────

  const createPlan = useCallback(
    (
      periodLabel: string,
      startDate: string,
      endDate: string,
      videos: Omit<PlannedVideo, 'id'>[],
      weekends: WeekendSlot[],
    ) => {
      const withIds: PlannedVideo[] = videos.map((v, i) => ({
        ...v,
        id: uuidv4(),
        title: v.title.trim() || `Vidéo ${i + 1}`,
      }));
      const schedule = generateSchedule(withIds, weekends.filter((w) => w.available));
      const plan: ContentPlan = {
        id: uuidv4(),
        periodLabel,
        startDate,
        endDate,
        videos: withIds,
        schedule,
        createdAt: new Date().toISOString(),
      };
      setActivePlan(plan);
    },
    [],
  );

  const toggleTask = useCallback((satDate: string, taskId: string) => {
    setActivePlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        schedule: prev.schedule.map((sw) =>
          sw.satDate !== satDate
            ? sw
            : {
                ...sw,
                tasks: sw.tasks.map((t): ScheduleTask =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t,
                ),
              },
        ),
      };
    });
  }, []);

  const deletePlan = useCallback(() => setActivePlan(null), []);

  // ── Idea management ────────────────────────────────────────────────────────

  const addIdea = useCallback((payload: Omit<IdeaItem, 'id' | 'createdAt'>) => {
    const item: IdeaItem = { ...payload, id: uuidv4(), createdAt: new Date().toISOString() };
    setIdeas((prev) => [item, ...prev]);
  }, []);

  const updateIdea = useCallback((id: string, changes: Partial<IdeaItem>) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ── Config ─────────────────────────────────────────────────────────────────

  const updateConfig = useCallback((changes: Partial<PlannerConfig>) => {
    setConfig((prev) => ({ ...prev, ...changes }));
  }, []);

  // ── Helpers exposed to UI ──────────────────────────────────────────────────

  function getAllTasks() {
    return (activePlan?.schedule ?? []).flatMap((sw) => sw.tasks);
  }

  function getProgress() {
    const all = getAllTasks();
    const total = all.length;
    const done  = all.filter((t) => t.completed).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  function getVideoSizeForTask(videoId: string): VideoSize {
    return activePlan?.videos.find((v) => v.id === videoId)?.size ?? 'petite';
  }

  return {
    activePlan,
    ideas,
    config,
    createPlan,
    toggleTask,
    deletePlan,
    addIdea,
    updateIdea,
    deleteIdea,
    updateConfig,
    getProgress,
    getVideoSizeForTask,
  };
}
