// Complete localStorage DB with seed data
import type { User, Track, Lyrics, FileItem, Folder, Vote, ChatMessage, ActivityItem, ProjectSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
const KEYS = {
  users: 'ts_users',
  tracks: 'ts_tracks',
  lyrics: 'ts_lyrics',
  files: 'ts_files',
  folders: 'ts_folders',
  votes: 'ts_votes',
  messages: 'ts_messages',
  activity: 'ts_activity',
  settings: 'ts_settings',
  seeded: 'ts_seeded',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function now(): string {
  return new Date().toISOString();
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}

function lsGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function lsGetOne<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded – ignore */ }
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const SEED_USER_IDS = {
  rahim: 'u-rahim-001',
  karim: 'u-karim-002',
  sofia: 'u-sofia-003',
  max: 'u-max-004',
};

const SEED_TRACK_IDS = {
  t1: 'tr-001',
  t2: 'tr-002',
  t3: 'tr-003',
  t4: 'tr-004',
  t5: 'tr-005',
};

function buildSeedData() {
  const users: User[] = [
    {
      id: SEED_USER_IDS.rahim,
      prenom: 'Rahim',
      pseudo: 'Rahim',
      email: 'demo@torrevieja.studio',
      password: 'demo123',
      role: 'Rappeur',
      bio: 'MC depuis 2018, paroles de rue et flow méditerranéen.',
      photoUrl: '',
      color: 'hsl(32, 80%, 60%)',
      initials: 'RA',
      createdAt: daysAgo(30),
    },
    {
      id: SEED_USER_IDS.karim,
      prenom: 'Karim',
      pseudo: 'K-Beat',
      email: 'karim@torrevieja.studio',
      password: 'demo123',
      role: 'Beatmaker',
      bio: 'Producteur trap/afro, créateur de l\'ambiance estivale.',
      photoUrl: '',
      color: 'hsl(200, 70%, 65%)',
      initials: 'KB',
      createdAt: daysAgo(28),
    },
    {
      id: SEED_USER_IDS.sofia,
      prenom: 'Sofia',
      pseudo: 'SofiaS',
      email: 'sofia@torrevieja.studio',
      password: 'demo123',
      role: 'Chanteur',
      bio: 'Voix soul avec des influences latines. J\'apporte la chaleur.',
      photoUrl: '',
      color: 'hsl(330, 70%, 65%)',
      initials: 'SS',
      createdAt: daysAgo(25),
    },
    {
      id: SEED_USER_IDS.max,
      prenom: 'Max',
      pseudo: 'MaxMix',
      email: 'max@torrevieja.studio',
      password: 'demo123',
      role: 'Mixeur',
      bio: 'Ingénieur son, 10 ans d\'expérience en studios professionnels.',
      photoUrl: '',
      color: 'hsl(150, 60%, 55%)',
      initials: 'MM',
      createdAt: daysAgo(20),
    },
  ];

  const tracks: Track[] = [
    {
      id: SEED_TRACK_IDS.t1,
      title: 'Torrevieja Nuit',
      artistIds: [SEED_USER_IDS.rahim, SEED_USER_IDS.sofia],
      extraArtists: '',
      prod: 'K-Beat',
      status: 'Mixé',
      duration: '3:24',
      progressPct: 100,
      notes: 'Single principal de la mixtape. Mix final approuvé.',
      position: 0,
      createdBy: SEED_USER_IDS.rahim,
      createdAt: daysAgo(20),
    },
    {
      id: SEED_TRACK_IDS.t2,
      title: 'Sol d\'Été',
      artistIds: [SEED_USER_IDS.rahim],
      extraArtists: '',
      prod: 'K-Beat',
      status: 'À mixer',
      duration: '2:58',
      progressPct: 75,
      notes: 'Couplets enregistrés, refrain à retravailler.',
      position: 1,
      createdBy: SEED_USER_IDS.rahim,
      createdAt: daysAgo(15),
    },
    {
      id: SEED_TRACK_IDS.t3,
      title: 'Playa Flow',
      artistIds: [SEED_USER_IDS.sofia, SEED_USER_IDS.karim],
      extraArtists: '',
      prod: 'K-Beat',
      status: 'En cours',
      duration: '',
      progressPct: 45,
      notes: 'Beat prêt, paroles en cours d\'écriture.',
      position: 2,
      createdBy: SEED_USER_IDS.sofia,
      createdAt: daysAgo(12),
    },
    {
      id: SEED_TRACK_IDS.t4,
      title: 'Calle Real',
      artistIds: [SEED_USER_IDS.rahim, SEED_USER_IDS.karim],
      extraArtists: 'feat. Marco',
      prod: 'K-Beat',
      status: 'En cours',
      duration: '',
      progressPct: 30,
      notes: 'Collaboration avec Marco à confirmer.',
      position: 3,
      createdBy: SEED_USER_IDS.karim,
      createdAt: daysAgo(8),
    },
    {
      id: SEED_TRACK_IDS.t5,
      title: 'Último Verano',
      artistIds: [SEED_USER_IDS.sofia],
      extraArtists: '',
      prod: '',
      status: 'Idée',
      duration: '',
      progressPct: 5,
      notes: 'Idée de ballade pour finir la tape.',
      position: 4,
      createdBy: SEED_USER_IDS.sofia,
      createdAt: daysAgo(3),
    },
  ];

  const lyrics: Lyrics[] = [
    {
      id: 'lyr-001',
      trackId: SEED_TRACK_IDS.t1,
      content: `[Couplet 1 - Rahim]
La nuit de Torrevieja, les étoiles brillent fort
Le vent chaud sur ma peau, je vois les bateaux au port
On est là pour l'été, on profite de chaque soir
C'est notre moment, notre histoire, notre espoir

[Refrain - Sofia]
Torrevieja, oh la nuit est belle
Sous les palmiers, sous les étoiles
On danse jusqu'à l'aube, c'est éternel
Notre été, notre mixtape, notre toile`,
      updatedBy: SEED_USER_IDS.rahim,
      updatedAt: daysAgo(10),
    },
  ];

  const messages: ChatMessage[] = [
    {
      id: 'msg-001',
      channel: 'général',
      authorId: SEED_USER_IDS.rahim,
      content: 'Salut l\'équipe ! La tape avance bien 🔥',
      createdAt: hoursAgo(48),
    },
    {
      id: 'msg-002',
      channel: 'général',
      authorId: SEED_USER_IDS.karim,
      content: 'Ouais ! J\'ai fini le beat pour Playa Flow. Je l\'upload ce soir.',
      createdAt: hoursAgo(24),
    },
    {
      id: 'msg-003',
      channel: 'général',
      authorId: SEED_USER_IDS.sofia,
      content: 'Parfait ! Je peux commencer les toplines demain matin.',
      createdAt: hoursAgo(20),
    },
    {
      id: 'msg-004',
      channel: 'prods',
      authorId: SEED_USER_IDS.karim,
      content: 'Beat "Calle Real" est prêt, 140 BPM, tonalité Am. Check les fichiers.',
      createdAt: hoursAgo(36),
    },
    {
      id: 'msg-005',
      channel: 'mix',
      authorId: SEED_USER_IDS.max,
      content: '"Torrevieja Nuit" est mixé et masterisé. Le fichier WAV est dans les fichiers.',
      createdAt: hoursAgo(12),
    },
  ];

  const activity: ActivityItem[] = [
    {
      id: 'act-001',
      userId: SEED_USER_IDS.rahim,
      actionType: 'register',
      description: 'Rahim a rejoint le studio.',
      createdAt: daysAgo(30),
    },
    {
      id: 'act-002',
      userId: SEED_USER_IDS.karim,
      actionType: 'register',
      description: 'K-Beat a rejoint le studio.',
      createdAt: daysAgo(28),
    },
    {
      id: 'act-003',
      userId: SEED_USER_IDS.rahim,
      actionType: 'add_track',
      description: 'Nouveau morceau ajouté : Torrevieja Nuit',
      createdAt: daysAgo(20),
    },
    {
      id: 'act-004',
      userId: SEED_USER_IDS.sofia,
      actionType: 'register',
      description: 'SofiaS a rejoint le studio.',
      createdAt: daysAgo(25),
    },
    {
      id: 'act-005',
      userId: SEED_USER_IDS.rahim,
      actionType: 'add_track',
      description: 'Nouveau morceau ajouté : Sol d\'Été',
      createdAt: daysAgo(15),
    },
    {
      id: 'act-006',
      userId: SEED_USER_IDS.max,
      actionType: 'register',
      description: 'MaxMix a rejoint le studio.',
      createdAt: daysAgo(20),
    },
    {
      id: 'act-007',
      userId: SEED_USER_IDS.karim,
      actionType: 'add_track',
      description: 'Nouveau morceau ajouté : Playa Flow',
      createdAt: daysAgo(12),
    },
    {
      id: 'act-008',
      userId: SEED_USER_IDS.rahim,
      actionType: 'save_lyrics',
      description: 'Paroles mises à jour pour Torrevieja Nuit.',
      createdAt: daysAgo(10),
    },
    {
      id: 'act-009',
      userId: SEED_USER_IDS.max,
      actionType: 'update_track',
      description: 'Torrevieja Nuit passé au statut Mixé.',
      createdAt: daysAgo(5),
    },
    {
      id: 'act-010',
      userId: SEED_USER_IDS.sofia,
      actionType: 'add_track',
      description: 'Nouveau morceau ajouté : Último Verano',
      createdAt: daysAgo(3),
    },
  ];

  const votes: Vote[] = [
    {
      id: 'v-001',
      trackId: SEED_TRACK_IDS.t1,
      userId: SEED_USER_IDS.karim,
      direction: 'up',
      createdAt: daysAgo(5),
    },
    {
      id: 'v-002',
      trackId: SEED_TRACK_IDS.t1,
      userId: SEED_USER_IDS.sofia,
      direction: 'up',
      createdAt: daysAgo(5),
    },
    {
      id: 'v-003',
      trackId: SEED_TRACK_IDS.t1,
      userId: SEED_USER_IDS.max,
      direction: 'up',
      createdAt: daysAgo(4),
    },
    {
      id: 'v-004',
      trackId: SEED_TRACK_IDS.t2,
      userId: SEED_USER_IDS.karim,
      direction: 'up',
      createdAt: daysAgo(3),
    },
    {
      id: 'v-005',
      trackId: SEED_TRACK_IDS.t3,
      userId: SEED_USER_IDS.rahim,
      direction: 'up',
      createdAt: daysAgo(2),
    },
  ];

  const settings: ProjectSettings = {
    mixtapeName: 'Torrevieja Tape Vol. 1',
    subtitle: 'L\'été de ta vie',
    targetDate: '2026-08-01',
    coverUrl: '',
  };

  return { users, tracks, lyrics, messages, activity, votes, settings };
}

// ---------------------------------------------------------------------------
// Seed on first load
// ---------------------------------------------------------------------------
function maybeInitSeed(): void {
  if (localStorage.getItem(KEYS.seeded)) return;

  const { users, tracks, lyrics, messages, activity, votes, settings } = buildSeedData();

  lsSet(KEYS.users, users);
  lsSet(KEYS.tracks, tracks);
  lsSet(KEYS.lyrics, lyrics);
  lsSet(KEYS.files, []);
  lsSet(KEYS.folders, []);
  lsSet(KEYS.votes, votes);
  lsSet(KEYS.messages, messages);
  lsSet(KEYS.activity, activity);
  lsSet(KEYS.settings, settings);
  localStorage.setItem(KEYS.seeded, '1');
}

// ---------------------------------------------------------------------------
// Fetch all local data (mirrors fetchAllData shape)
// ---------------------------------------------------------------------------
export function fetchAllLocalData() {
  maybeInitSeed();

  const defaultSettings: ProjectSettings = {
    mixtapeName: 'Torrevieja Tape Vol. 1',
    subtitle: 'L\'été de ta vie',
    targetDate: '2026-08-01',
    coverUrl: '',
  };

  return {
    users: lsGet<User>(KEYS.users),
    tracks: lsGet<Track>(KEYS.tracks).sort((a, b) => a.position - b.position),
    lyrics: lsGet<Lyrics>(KEYS.lyrics),
    vocals: [],
    files: lsGet<FileItem>(KEYS.files),
    folders: lsGet<Folder>(KEYS.folders),
    votes: lsGet<Vote>(KEYS.votes),
    messages: lsGet<ChatMessage>(KEYS.messages).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
    activity: lsGet<ActivityItem>(KEYS.activity).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
    projectSettings: lsGetOne<ProjectSettings>(KEYS.settings, defaultSettings),
  };
}

// ---------------------------------------------------------------------------
// Subscribe to local changes (storage event for cross-tab)
// ---------------------------------------------------------------------------
type LocalChangeCallback = () => void;

export function subscribeToLocalChanges(callback: LocalChangeCallback): () => void {
  function handler(e: StorageEvent) {
    if (e.key && Object.values(KEYS).includes(e.key)) {
      callback();
    }
  }
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// ---------------------------------------------------------------------------
// localDB – mirrors db structure from supabaseSync
// ---------------------------------------------------------------------------
export const localDB = {
  // ---- Users ----
  async insertUser(user: User): Promise<void> {
    const users = lsGet<User>(KEYS.users);
    if (!users.some((u) => u.id === user.id)) {
      users.push(user);
      lsSet(KEYS.users, users);
    }
  },

  async updateUser(id: string, changes: Partial<User>): Promise<void> {
    const users = lsGet<User>(KEYS.users).map((u) =>
      u.id === id ? { ...u, ...changes } : u,
    );
    lsSet(KEYS.users, users);
  },

  async deleteUser(id: string): Promise<void> {
    lsSet(KEYS.users, lsGet<User>(KEYS.users).filter((u) => u.id !== id));
  },

  async findUserByCredentials(email: string, password: string): Promise<User | null> {
    maybeInitSeed();
    const users = lsGet<User>(KEYS.users);
    return users.find((u) => u.email === email && u.password === password) ?? null;
  },

  // ---- Tracks ----
  async insertTrack(track: Track): Promise<void> {
    const tracks = lsGet<Track>(KEYS.tracks);
    if (!tracks.some((t) => t.id === track.id)) {
      tracks.push(track);
      lsSet(KEYS.tracks, tracks);
    }
  },

  async updateTrack(id: string, changes: Partial<Track>): Promise<void> {
    const tracks = lsGet<Track>(KEYS.tracks).map((t) =>
      t.id === id ? { ...t, ...changes } : t,
    );
    lsSet(KEYS.tracks, tracks);
  },

  async deleteTrack(id: string): Promise<void> {
    lsSet(KEYS.tracks, lsGet<Track>(KEYS.tracks).filter((t) => t.id !== id));
  },

  async reorderTracks(orderedIds: string[]): Promise<void> {
    const tracks = lsGet<Track>(KEYS.tracks).map((t) => {
      const idx = orderedIds.indexOf(t.id);
      return idx !== -1 ? { ...t, position: idx } : t;
    });
    lsSet(KEYS.tracks, tracks);
  },

  // ---- Lyrics ----
  async upsertLyrics(lyrics: Lyrics): Promise<void> {
    const all = lsGet<Lyrics>(KEYS.lyrics);
    const existing = all.findIndex((l) => l.id === lyrics.id);
    if (existing !== -1) {
      all[existing] = lyrics;
    } else {
      all.push(lyrics);
    }
    lsSet(KEYS.lyrics, all);
  },

  // ---- Vocals (no-op for local) ----
  async insertVocal(): Promise<void> { /* vocals stored elsewhere */ },
  async deleteVocal(): Promise<void> { /* vocals stored elsewhere */ },

  // ---- Files ----
  async insertFile(file: FileItem): Promise<void> {
    const files = lsGet<FileItem>(KEYS.files);
    if (!files.some((f) => f.id === file.id)) {
      files.push(file);
      lsSet(KEYS.files, files);
    }
  },

  async deleteFile(id: string): Promise<void> {
    lsSet(KEYS.files, lsGet<FileItem>(KEYS.files).filter((f) => f.id !== id));
  },

  // ---- Folders ----
  async insertFolder(folder: Folder): Promise<void> {
    const folders = lsGet<Folder>(KEYS.folders);
    if (!folders.some((f) => f.id === folder.id)) {
      folders.push(folder);
      lsSet(KEYS.folders, folders);
    }
  },

  async deleteFolder(id: string): Promise<void> {
    lsSet(KEYS.folders, lsGet<Folder>(KEYS.folders).filter((f) => f.id !== id));
    // Move files out of this folder
    const files = lsGet<FileItem>(KEYS.files).map((f) =>
      f.folderId === id ? { ...f, folderId: null } : f,
    );
    lsSet(KEYS.files, files);
  },

  // ---- Votes ----
  async upsertVote(vote: Vote): Promise<void> {
    const votes = lsGet<Vote>(KEYS.votes);
    const existing = votes.findIndex((v) => v.id === vote.id);
    if (existing !== -1) {
      votes[existing] = vote;
    } else {
      votes.push(vote);
    }
    lsSet(KEYS.votes, votes);
  },

  async deleteVote(id: string): Promise<void> {
    lsSet(KEYS.votes, lsGet<Vote>(KEYS.votes).filter((v) => v.id !== id));
  },

  // ---- Messages ----
  async insertMessage(msg: ChatMessage): Promise<void> {
    const messages = lsGet<ChatMessage>(KEYS.messages);
    if (!messages.some((m) => m.id === msg.id)) {
      messages.push(msg);
      lsSet(KEYS.messages, messages);
    }
  },

  // ---- Activity ----
  async insertActivity(item: ActivityItem): Promise<void> {
    const activity = lsGet<ActivityItem>(KEYS.activity);
    if (!activity.some((a) => a.id === item.id)) {
      activity.push(item);
      lsSet(KEYS.activity, activity);
    }
  },

  // ---- Project Settings ----
  async updateProjectSettings(settings: Partial<ProjectSettings>): Promise<void> {
    const defaultSettings: ProjectSettings = {
      mixtapeName: 'Torrevieja Tape Vol. 1',
      subtitle: 'L\'été de ta vie',
      targetDate: '2026-08-01',
      coverUrl: '',
    };
    const current = lsGetOne<ProjectSettings>(KEYS.settings, defaultSettings);
    lsSet(KEYS.settings, { ...current, ...settings });
  },
};

// Ensure seed runs at import time
maybeInitSeed();

export { uuidv4 };
