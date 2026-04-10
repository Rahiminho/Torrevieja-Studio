import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { VideoIdea, VideoStage, PlannerSettings } from './types';

const STORAGE_KEY = 'torrevieja-video-planner';
const SETTINGS_KEY = 'torrevieja-planner-settings';

// ---------------------------------------------------------------------------
// Sample data – shown on first load so the user sees the app populated
// ---------------------------------------------------------------------------

function buildSampleIdeas(): VideoIdea[] {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

  return [
    {
      id: uuidv4(),
      title: 'Mon setup gaming 2025',
      description: 'Tour complet de mon setup : PC, périphériques, chaise, déco de la pièce.',
      stage: 'à tourner',
      priority: 'haute',
      tags: ['setup', 'gaming', 'vlog'],
      notes: 'Penser à filmer le câble management',
      estimatedDuration: '8-12 min',
      filmDate: null,
      publishDate: null,
      actualPublishDate: null,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(3),
    },
    {
      id: uuidv4(),
      title: 'Réaction à ma première vidéo YouTube',
      description: 'Je regarde et commente ma toute première vidéo publiée sur ma chaîne.',
      stage: 'script',
      priority: 'normale',
      tags: ['réaction', 'nostalgie', 'humour'],
      notes: 'Retrouver la vidéo originale. Préparer quelques répliques drôles.',
      estimatedDuration: '10-15 min',
      filmDate: null,
      publishDate: null,
      actualPublishDate: null,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(7),
    },
    {
      id: uuidv4(),
      title: 'Vlog : une journée dans ma vie',
      description: 'Je filme ma journée de A à Z, avec humour et sincérité.',
      stage: 'idée',
      priority: 'normale',
      tags: ['vlog', 'lifestyle'],
      notes: '',
      estimatedDuration: '6-10 min',
      filmDate: null,
      publishDate: null,
      actualPublishDate: null,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv4(),
      title: 'Top 5 fails de la semaine',
      description: 'Compilation humoristique de mes meilleurs moments de fail.',
      stage: 'idée',
      priority: 'basse',
      tags: ['humour', 'fails', 'compilation'],
      notes: 'Récupérer les clips sur le disque dur externe.',
      estimatedDuration: '5-8 min',
      filmDate: null,
      publishDate: null,
      actualPublishDate: null,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv4(),
      title: 'Challenge 24h sans téléphone',
      description: 'Je vis 24 heures sans mon téléphone et je raconte mon expérience.',
      stage: 'publié',
      priority: 'haute',
      tags: ['challenge', 'expérience'],
      notes: '',
      estimatedDuration: '12 min',
      filmDate: daysAgo(30),
      publishDate: daysAgo(22),
      actualPublishDate: daysAgo(22),
      createdAt: daysAgo(35),
      updatedAt: daysAgo(22),
    },
  ];
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadIdeas(): VideoIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VideoIdea[];
  } catch { /* ignore */ }
  // First run – seed with sample data
  const samples = buildSampleIdeas();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  return samples;
}

function saveIdeas(ideas: VideoIdea[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

function loadSettings(): PlannerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as PlannerSettings;
  } catch { /* ignore */ }
  return { channelName: 'Ma Chaîne', targetPerMonth: 3, subscriberCount: 189 };
}

function saveSettings(s: PlannerSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVideoPlanner() {
  const [ideas, setIdeas] = useState<VideoIdea[]>(loadIdeas);
  const [settings, setSettings] = useState<PlannerSettings>(loadSettings);

  useEffect(() => { saveIdeas(ideas); }, [ideas]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  const addIdea = useCallback(
    (payload: Omit<VideoIdea, 'id' | 'createdAt' | 'updatedAt'>): VideoIdea => {
      const idea: VideoIdea = {
        ...payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setIdeas((prev) => [idea, ...prev]);
      return idea;
    },
    [],
  );

  const updateIdea = useCallback((id: string, changes: Partial<VideoIdea>) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id
          ? { ...idea, ...changes, updatedAt: new Date().toISOString() }
          : idea,
      ),
    );
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);

  const moveToStage = useCallback(
    (id: string, stage: VideoStage) => {
      const extra: Partial<VideoIdea> =
        stage === 'publié' ? { actualPublishDate: new Date().toISOString() } : {};
      updateIdea(id, { stage, ...extra });
    },
    [updateIdea],
  );

  const updateSettings = useCallback((changes: Partial<PlannerSettings>) => {
    setSettings((prev) => ({ ...prev, ...changes }));
  }, []);

  return { ideas, settings, addIdea, updateIdea, deleteIdea, moveToStage, updateSettings };
}
