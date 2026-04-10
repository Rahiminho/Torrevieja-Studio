import type { VideoIdea, VideoStage, PlannerSettings } from '../types';

// ---------------------------------------------------------------------------
// Stage metadata
// ---------------------------------------------------------------------------

export const ALL_STAGES: VideoStage[] = [
  'idée', 'script', 'à tourner', 'brut', 'montage', 'post-prod', 'prêt', 'publié',
];

/** Stages that count as "active work in progress" (not backlog, not done) */
export const ACTIVE_STAGES: VideoStage[] = [
  'script', 'à tourner', 'brut', 'montage', 'post-prod', 'prêt',
];

export const STAGE_LABELS: Record<VideoStage, string> = {
  'idée':      '💡 Idée',
  'script':    '📝 Script',
  'à tourner': '🎬 À tourner',
  'brut':      '🎥 Brut',
  'montage':   '✂️ Montage',
  'post-prod': '🎨 Post-prod',
  'prêt':      '🚀 Prêt',
  'publié':    '✅ Publié',
};

export const STAGE_SHORT: Record<VideoStage, string> = {
  'idée':      'Idée',
  'script':    'Script',
  'à tourner': 'À tourner',
  'brut':      'Brut',
  'montage':   'Montage',
  'post-prod': 'Post-prod',
  'prêt':      'Prêt',
  'publié':    'Publié',
};

export const STAGE_COLORS: Record<VideoStage, { bg: string; text: string; border: string }> = {
  'idée':      { bg: 'rgba(232,160,32,0.12)', text: '#C8860A', border: 'rgba(200,134,10,0.22)' },
  'script':    { bg: 'rgba(14,165,233,0.12)', text: '#0284c7', border: 'rgba(14,165,233,0.22)' },
  'à tourner': { bg: 'rgba(168,85,247,0.12)', text: '#7c3aed', border: 'rgba(168,85,247,0.22)' },
  'brut':      { bg: 'rgba(249,115,22,0.12)', text: '#ea580c', border: 'rgba(249,115,22,0.22)' },
  'montage':   { bg: 'rgba(59,130,246,0.12)', text: '#2563eb', border: 'rgba(59,130,246,0.22)' },
  'post-prod': { bg: 'rgba(244,63,94,0.12)',  text: '#e11d48', border: 'rgba(244,63,94,0.22)'  },
  'prêt':      { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a', border: 'rgba(34,197,94,0.22)'  },
  'publié':    { bg: 'rgba(22,163,74,0.14)',  text: '#15803d', border: 'rgba(22,163,74,0.28)'  },
};

/** Return the next stage in the production pipeline */
export function nextStage(stage: VideoStage): VideoStage | null {
  const idx = ALL_STAGES.indexOf(stage);
  if (idx === -1 || idx >= ALL_STAGES.length - 1) return null;
  return ALL_STAGES[idx + 1];
}

export function prevStage(stage: VideoStage): VideoStage | null {
  const idx = ALL_STAGES.indexOf(stage);
  if (idx <= 0) return null;
  return ALL_STAGES[idx - 1];
}

// ---------------------------------------------------------------------------
// Recommendation types
// ---------------------------------------------------------------------------

export type RecommendationType =
  | 'publier' | 'post-prod' | 'monter' | 'tourner' | 'scripter' | 'préparer' | 'brainstorm';

export interface Recommendation {
  priority: number;
  type: RecommendationType;
  emoji: string;
  title: string;
  desc: string;
  timeEstimate: string;
  videos: VideoIdea[];
  urgent?: boolean;
}

export interface AlgorithmResult {
  weekendRecs: Recommendation[];   // top 3 for this weekend
  nextWeekendRec: Recommendation | null;
  momentum: number;                // 0-100, % of monthly target reached
  recentPublished: number;         // count in last 30 days
  deficit: number;                 // target - recentPublished
  activeCount: number;             // videos in ACTIVE_STAGES
  ideaCount: number;               // videos in 'idée'
  pipelineHealth: 'vide' | 'faible' | 'bon' | 'excellent';
  monthlyTip: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function groupByStage(ideas: VideoIdea[]): Record<VideoStage, VideoIdea[]> {
  const result = {} as Record<VideoStage, VideoIdea[]>;
  for (const stage of ALL_STAGES) {
    result[stage] = ideas.filter((i) => i.stage === stage);
  }
  return result;
}

function daysLeftInMonth(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

function getPipelineHealth(
  byStage: Record<VideoStage, VideoIdea[]>,
  target: number,
): AlgorithmResult['pipelineHealth'] {
  const active = ACTIVE_STAGES.reduce((n, s) => n + byStage[s].length, 0);
  const ideas  = byStage['idée'].length;
  if (active === 0 && ideas === 0) return 'vide';
  if (active === 0)                return 'faible';
  if (active >= target)            return 'excellent';
  return 'bon';
}

function getMonthlyTip(
  published: number,
  target: number,
  byStage: Record<VideoStage, VideoIdea[]>,
): string {
  if (published >= target) {
    return `🏆 Objectif atteint ! ${published}/${target} vidéos ce mois-ci. Tu es en feu — continue !`;
  }
  const left = daysLeftInMonth();
  if (left < 7 && published < target) {
    return `⚡ Il reste ${left} jour${left > 1 ? 's' : ''} ce mois. Publie ce qui est prêt, même imparfait — la régularité prime sur la perfection.`;
  }
  if (byStage['prêt'].length + byStage['post-prod'].length > 0) {
    return `🎯 Tu as du contenu presque prêt ! Finalise et publie avant de commencer de nouvelles vidéos.`;
  }
  if (published === 0) {
    return `🚀 Publie ta première vidéo du mois avant tout. Une fois la première sortie, les suivantes viennent naturellement.`;
  }
  return `📅 Pour ${target} vidéos/mois, essaie de tourner et monter au moins une vidéo chaque week-end.`;
}

// ---------------------------------------------------------------------------
// Core algorithm
// ---------------------------------------------------------------------------

export function computeRecommendations(
  ideas: VideoIdea[],
  settings: PlannerSettings,
): AlgorithmResult {
  const now    = new Date();
  const last30 = new Date(now.getTime() - 30 * 86400000);

  const recentPublished = ideas.filter(
    (i) => i.stage === 'publié' && i.actualPublishDate && new Date(i.actualPublishDate) >= last30,
  );

  const byStage    = groupByStage(ideas);
  const target     = settings.targetPerMonth;
  const deficit    = target - recentPublished.length;
  const activeCount = ACTIVE_STAGES.reduce((n, s) => n + byStage[s].length, 0);

  const recs: Recommendation[] = [];

  // ── Rule 1: Publish-ready videos ──────────────────────────────────────────
  if (byStage['prêt'].length > 0) {
    recs.push({
      priority: 1,
      type: 'publier',
      emoji: '🚀',
      title: 'Publie maintenant !',
      desc: `"${byStage['prêt'][0].title}" est 100 % prête. Uploade-la sur YouTube ce week-end — chaque jour d'attente est une opportunité perdue.`,
      timeEstimate: '30 min',
      videos: byStage['prêt'],
      urgent: deficit > 0,
    });
  }

  // ── Rule 2: Post-production (thumbnail, title, SEO) ───────────────────────
  if (byStage['post-prod'].length > 0) {
    recs.push({
      priority: 2,
      type: 'post-prod',
      emoji: '🎨',
      title: 'Finitions post-prod',
      desc: `Crée la miniature et peaufine le titre/description de "${byStage['post-prod'][0].title}". Une bonne miniature peut tripler ton taux de clic.`,
      timeEstimate: '1-2 h',
      videos: byStage['post-prod'],
    });
  }

  // ── Rule 3: Edit (brut or in montage) ────────────────────────────────────
  const toEdit = [...byStage['montage'], ...byStage['brut']];
  if (toEdit.length > 0) {
    const v = toEdit[0];
    const inProgress = v.stage === 'montage';
    recs.push({
      priority: 3,
      type: 'monter',
      emoji: '✂️',
      title: inProgress ? 'Continue le montage' : 'Monte le brut',
      desc: `"${v.title}" ${inProgress ? 'est en cours de montage' : 'a été tournée et attend le montage'}. Bloque 2-4 h dans ton agenda ce week-end.`,
      timeEstimate: '2-4 h',
      videos: toEdit,
    });
  }

  // ── Rule 4: Film something ────────────────────────────────────────────────
  if (byStage['à tourner'].length > 0) {
    recs.push({
      priority: 4,
      type: 'tourner',
      emoji: '🎬',
      title: 'Tourne une vidéo',
      desc: `"${byStage['à tourner'][0].title}" est prête à être tournée ! Prépare ton setup et filme — tu peux le faire en 1-3 h.`,
      timeEstimate: '1-3 h',
      videos: byStage['à tourner'],
    });
  }

  // ── Rule 5: Finalise a script ─────────────────────────────────────────────
  if (byStage['script'].length > 0) {
    recs.push({
      priority: 5,
      type: 'scripter',
      emoji: '📝',
      title: 'Finalise un script',
      desc: `Termine le script de "${byStage['script'][0].title}" pour pouvoir le tourner dès le week-end suivant.`,
      timeEstimate: '1 h',
      videos: byStage['script'],
    });
  }

  // ── Rule 6: Prep an idea into a script ───────────────────────────────────
  if (byStage['idée'].length > 0 && byStage['script'].length < 2) {
    recs.push({
      priority: 6,
      type: 'préparer',
      emoji: '✍️',
      title: 'Prépare une idée',
      desc: `Écris la structure et le concept de "${byStage['idée'][0].title}". 30-60 min de prep suffisent pour débloquer tout le reste.`,
      timeEstimate: '30-60 min',
      videos: byStage['idée'].slice(0, 1),
    });
  }

  // ── Rule 7: Brainstorm if pipeline empty ──────────────────────────────────
  if (recs.length === 0 || ideas.length === 0) {
    recs.push({
      priority: 7,
      type: 'brainstorm',
      emoji: '💡',
      title: 'Brainstorme des idées !',
      desc: `Ta banque d'idées est vide. Prends 30 min, note 5 idées de vidéos sans te juger. Quantité avant qualité à ce stade.`,
      timeEstimate: '30 min',
      videos: [],
    });
  }

  // Sort and split
  const sorted = recs.sort((a, b) => a.priority - b.priority);
  const weekendRecs     = sorted.slice(0, 3);
  const nextWeekendRec  = sorted[3] ?? null;

  const momentum        = Math.min(100, Math.round((recentPublished.length / target) * 100));
  const pipelineHealth  = getPipelineHealth(byStage, target);
  const monthlyTip      = getMonthlyTip(recentPublished.length, target, byStage);

  return {
    weekendRecs,
    nextWeekendRec,
    momentum,
    recentPublished: recentPublished.length,
    deficit,
    activeCount,
    ideaCount: byStage['idée'].length,
    pipelineHealth,
    monthlyTip,
  };
}
