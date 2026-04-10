// ── Video sizes ──────────────────────────────────────────────────────────────

export type VideoSize = 'petite' | 'moyenne' | 'grosse';
export type TaskType = 'script' | 'tournage' | 'montage' | 'postprod' | 'publier';

// ── Plan entities ─────────────────────────────────────────────────────────────

export interface PlannedVideo {
  id: string;
  title: string;   // user-given or auto "Vidéo 1", "Vidéo 2"…
  size: VideoSize;
  colorIdx: number; // index into VIDEO_COLORS palette
}

export interface WeekendSlot {
  /** "YYYY-MM-DD" of the Saturday */
  satDate: string;
  /** "YYYY-MM-DD" of the Sunday */
  sunDate: string;
  available: boolean;
}

export interface ScheduleTask {
  id: string;
  videoId: string;
  type: TaskType;
  estimatedHours: number;
  completed: boolean;
}

export interface ScheduleWeekend {
  satDate: string;
  sunDate: string;
  tasks: ScheduleTask[];
  /** Sum of estimatedHours for all tasks */
  hoursPlanned: number;
}

export interface ContentPlan {
  id: string;
  /** Human-readable label, e.g. "Avril 2025" */
  periodLabel: string;
  /** YYYY-MM-DD of plan start */
  startDate: string;
  /** YYYY-MM-DD of plan end */
  endDate: string;
  videos: PlannedVideo[];
  schedule: ScheduleWeekend[];
  createdAt: string;
}

// ── Idea bank ─────────────────────────────────────────────────────────────────

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  notes: string;
  size: VideoSize | 'indéfini';
  createdAt: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

export interface PlannerConfig {
  channelName: string;
  subscriberCount: number;
}
