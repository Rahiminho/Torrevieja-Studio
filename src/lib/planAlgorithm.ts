import { v4 as uuidv4 } from 'uuid';
import type {
  PlannedVideo,
  WeekendSlot,
  ScheduleWeekend,
  ScheduleTask,
  TaskType,
  VideoSize,
  ContentPlan,
} from '../plannerTypes';

// ---------------------------------------------------------------------------
// Constants & metadata
// ---------------------------------------------------------------------------

/** Estimated hours per task for each video size */
const HOURS: Record<VideoSize, Record<TaskType, number>> = {
  petite:  { script: 1.0, tournage: 1.5, montage: 2.5, postprod: 0.5, publier: 0.25 },
  moyenne: { script: 2.0, tournage: 2.5, montage: 5.0, postprod: 1.0, publier: 0.25 },
  grosse:  { script: 3.5, tournage: 4.0, montage: 9.0, postprod: 2.0, publier: 0.25 },
};

/** Max productive hours per weekend (realistic for a hobby creator) */
const WEEKEND_CAPACITY = 5;

const TASK_ORDER: TaskType[] = ['script', 'tournage', 'montage', 'postprod', 'publier'];

export const TASK_INFO: Record<TaskType, { label: string; emoji: string; tip: string }> = {
  script:   { label: 'Script / Concept', emoji: '📝', tip: 'Écris ta structure, tes idées clés, le fil conducteur.' },
  tournage: { label: 'Tournage',          emoji: '🎬', tip: 'Prépare ton setup et filme. Plusieurs prises valent mieux qu\'une.' },
  montage:  { label: 'Montage',           emoji: '✂️', tip: 'Importe, coupe et rythme ta vidéo. Laisse respirer l\'image.' },
  postprod: { label: 'Post-prod & Miniature', emoji: '🎨', tip: 'Crée ta miniature, rédige le titre et la description SEO.' },
  publier:  { label: 'Publication',       emoji: '🚀', tip: 'Programme la vidéo sur YouTube. Partage sur tes réseaux.' },
};

export const SIZE_INFO: Record<VideoSize, { label: string; sub: string; emoji: string; totalHours: number; desc: string }> = {
  petite:  { label: 'Petite',  sub: '< 8 min',   emoji: '⚡', totalHours: 5.75,  desc: 'Format court et dynamique. Idéal pour des sujets simples ou de l\'humour rapide.' },
  moyenne: { label: 'Moyenne', sub: '8-15 min',   emoji: '🎯', totalHours: 10.75, desc: 'Le standard YouTube. Bon équilibre entre travail et impact sur l\'audience.' },
  grosse:  { label: 'Grosse',  sub: '15+ min',    emoji: '🏆', totalHours: 18.75, desc: 'Projet ambitieux. Demande plus d\'organisation mais peut vraiment faire décoller ta chaîne.' },
};

export const VIDEO_COLORS = [
  { bg: 'rgba(232,160,32,0.14)',  border: 'rgba(200,134,10,0.35)',  text: '#B8740A', dot: '#E8A020' },
  { bg: 'rgba(14,165,233,0.14)', border: 'rgba(14,165,233,0.35)',  text: '#0270b0', dot: '#0ea5e9' },
  { bg: 'rgba(168,85,247,0.14)', border: 'rgba(168,85,247,0.35)',  text: '#6d28d9', dot: '#a855f7' },
  { bg: 'rgba(34,197,94,0.14)',  border: 'rgba(34,197,94,0.35)',   text: '#15803d', dot: '#22c55e' },
  { bg: 'rgba(244,63,94,0.14)',  border: 'rgba(244,63,94,0.35)',   text: '#be123c', dot: '#f43f5e' },
  { bg: 'rgba(249,115,22,0.14)', border: 'rgba(249,115,22,0.35)',  text: '#c2410c', dot: '#f97316' },
];

// ---------------------------------------------------------------------------
// Weekend utilities
// ---------------------------------------------------------------------------

/** Return all weekends (Sat+Sun) between two ISO date strings (inclusive) */
export function getWeekendsInPeriod(startDate: string, endDate: string): WeekendSlot[] {
  const slots: WeekendSlot[] = [];
  const end = new Date(endDate + 'T23:59:59');

  // Advance to the first Saturday on or after startDate
  const cur = new Date(startDate);
  const dayOfWeek = cur.getDay();
  const toSat = dayOfWeek === 6 ? 0 : dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
  cur.setDate(cur.getDate() + toSat);

  while (cur <= end) {
    const sat = cur.toISOString().split('T')[0];
    const sun = new Date(cur);
    sun.setDate(sun.getDate() + 1);
    const sunStr = sun.toISOString().split('T')[0];

    slots.push({ satDate: sat, sunDate: sunStr, available: true });
    cur.setDate(cur.getDate() + 7);
  }

  return slots;
}

/** ISO today date as "YYYY-MM-DD" */
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns the ScheduleWeekend that covers today, or the next upcoming one with pending tasks */
export function getCurrentWeekend(plan: ContentPlan): ScheduleWeekend | null {
  const today = todayStr();

  // Is today inside a weekend?
  const current = plan.schedule.find(
    (sw) => (sw.satDate === today || sw.sunDate === today) && sw.tasks.some((t) => !t.completed),
  );
  if (current) return current;

  // Otherwise the next upcoming one with pending tasks
  return (
    plan.schedule.find(
      (sw) => sw.satDate > today && sw.tasks.some((t) => !t.completed),
    ) ?? null
  );
}

/** Label like "5-6 avril" or "31 mai – 1 juin" */
export function formatWeekendLabel(satDate: string, sunDate: string): string {
  const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  const sat = new Date(satDate);
  const sun = new Date(sunDate);
  const satM = MONTHS[sat.getMonth()];
  const sunM = MONTHS[sun.getMonth()];
  if (satM === sunM) {
    return `${sat.getDate()}-${sun.getDate()} ${satM}`;
  }
  return `${sat.getDate()} ${satM} – ${sun.getDate()} ${sunM}`;
}

/** Format a month + year for a given ISO date string */
export function formatMonthYear(isoDate: string): string {
  const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const d = new Date(isoDate);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Core algorithm: generate a week-by-week production schedule
// ---------------------------------------------------------------------------

export function generateSchedule(
  videos: PlannedVideo[],
  availableWeekends: WeekendSlot[],
): ScheduleWeekend[] {
  // Build mutable schedule structure
  const schedule: ScheduleWeekend[] = availableWeekends.map((w) => ({
    satDate: w.satDate,
    sunDate: w.sunDate,
    tasks: [],
    hoursPlanned: 0,
  }));

  if (schedule.length === 0) return schedule;

  // Sort videos: small first → early quick wins, big projects spread over more weekends
  const sorted = [...videos].sort((a, b) => {
    const order: Record<VideoSize, number> = { petite: 0, moyenne: 1, grosse: 2 };
    return order[a.size] - order[b.size];
  });

  for (const video of sorted) {
    const hours = HOURS[video.size];
    // Pointer: next task for this video must be on weekend ≥ minWi
    let minWi = 0;

    for (const taskType of TASK_ORDER) {
      const taskHours = hours[taskType];

      let assigned = false;

      for (let wi = minWi; wi < schedule.length; wi++) {
        const sw = schedule[wi];
        const remaining = WEEKEND_CAPACITY - sw.hoursPlanned;

        if (remaining >= taskHours) {
          sw.tasks.push(makeTask(video.id, taskType, taskHours));
          sw.hoursPlanned += taskHours;
          minWi = wi; // next task on same weekend or later (sequential)
          assigned = true;
          break;
        }
        // Not enough room on wi — try next weekend (minWi stays, loop increments wi)
      }

      if (!assigned) {
        // Overflow: append to last weekend regardless of capacity
        const last = schedule[schedule.length - 1];
        last.tasks.push(makeTask(video.id, taskType, taskHours));
        last.hoursPlanned += taskHours;
        minWi = schedule.length - 1;
      }
    }
  }

  return schedule;
}

function makeTask(videoId: string, type: TaskType, estimatedHours: number): ScheduleTask {
  return { id: uuidv4(), videoId, type, estimatedHours, completed: false };
}

// ---------------------------------------------------------------------------
// Recommendation engine: what to focus on THIS weekend
// ---------------------------------------------------------------------------

export interface WeekendRecommendation {
  weekend: ScheduleWeekend;
  pendingTasks: ScheduleTask[];
  totalHours: number;
  isPast: boolean;
  isCurrent: boolean;
  tip: string;
}

export function buildWeekendRecommendation(
  plan: ContentPlan,
): WeekendRecommendation | null {
  const sw = getCurrentWeekend(plan);
  if (!sw) return null;

  const today = todayStr();
  const isCurrent = sw.satDate === today || sw.sunDate === today;
  const isPast = sw.satDate < today && sw.sunDate < today;

  const pendingTasks = sw.tasks.filter((t) => !t.completed);
  const totalHours   = pendingTasks.reduce((s, t) => s + t.estimatedHours, 0);

  // Build a motivational tip based on the dominant task type
  const dominantType = pendingTasks[0]?.type ?? null;
  const tip = dominantType ? TASK_INFO[dominantType].tip : 'Continue sur ta lancée !';

  return { weekend: sw, pendingTasks, totalHours, isPast, isCurrent, tip };
}

// ---------------------------------------------------------------------------
// Estimate total plan hours & feasibility check
// ---------------------------------------------------------------------------

export function estimatePlanStats(videos: PlannedVideo[], availableWeekendCount: number) {
  const totalHours = videos.reduce((sum, v) => {
    const h = HOURS[v.size];
    return sum + Object.values(h).reduce((a, b) => a + b, 0);
  }, 0);

  const weekendsNeeded = Math.ceil(totalHours / WEEKEND_CAPACITY);
  const feasible       = availableWeekendCount >= weekendsNeeded;
  const overloadHours  = feasible ? 0 : (weekendsNeeded - availableWeekendCount) * WEEKEND_CAPACITY;

  return { totalHours, weekendsNeeded, feasible, overloadHours };
}
