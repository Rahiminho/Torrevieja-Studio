import { createContext, useContext, useReducer, useEffect, type Dispatch, type ReactNode } from 'react';
import { createElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  User,
  Track,
  Lyrics,
  Vocal,
  FileItem,
  Folder,
  Vote,
  ChatMessage,
  ActivityItem,
  ProjectSettings,
  Role,
  TrackStatus,
  VocalType,
  VoteDirection,
  ChatChannel,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generatePastelColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 75%)`;
}

function computeInitials(pseudo: string): string {
  const parts = pseudo.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return pseudo.slice(0, 2).toUpperCase();
}

function now(): string {
  return new Date().toISOString();
}

function createActivityItem(userId: string, actionType: string, description: string): ActivityItem {
  return {
    id: uuidv4(),
    userId,
    actionType,
    description,
    createdAt: now(),
  };
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface StoreState {
  currentUser: User | null;
  users: User[];
  tracks: Track[];
  lyrics: Lyrics[];
  vocals: Vocal[];
  files: FileItem[];
  folders: Folder[];
  votes: Vote[];
  messages: ChatMessage[];
  activity: ActivityItem[];
  projectSettings: ProjectSettings;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type StoreAction =
  | { type: 'LOGIN'; payload: { email: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: { prenom: string; pseudo: string; email: string; password: string; role: Role; bio?: string } }
  | { type: 'ADD_TRACK'; payload: { title: string; artistIds: string[]; extraArtists?: string; prod?: string; status?: TrackStatus; duration?: string; notes?: string; createdBy: string } }
  | { type: 'UPDATE_TRACK'; payload: Partial<Track> & { id: string } }
  | { type: 'DELETE_TRACK'; payload: { id: string; userId: string } }
  | { type: 'REORDER_TRACKS'; payload: { orderedIds: string[] } }
  | { type: 'SAVE_LYRICS'; payload: { trackId: string; content: string; updatedBy: string } }
  | { type: 'ADD_VOCAL'; payload: { trackId: string; authorId: string; type: VocalType; dataUrl: string; durationSec: number } }
  | { type: 'DELETE_VOCAL'; payload: { id: string; userId: string } }
  | { type: 'ADD_FILE'; payload: { name: string; category: FileItem['category']; extension: string; sizeBytes: number; authorId: string; folderId?: string | null; dataUrl: string } }
  | { type: 'DELETE_FILE'; payload: { id: string; userId: string } }
  | { type: 'ADD_FOLDER'; payload: { name: string; parentId?: string | null; createdBy: string } }
  | { type: 'DELETE_FOLDER'; payload: { id: string; userId: string } }
  | { type: 'CAST_VOTE'; payload: { trackId: string; userId: string; direction: VoteDirection } }
  | { type: 'SEND_MESSAGE'; payload: { channel: ChatChannel; authorId: string; content: string } }
  | { type: 'LOG_ACTIVITY'; payload: { userId: string; actionType: string; description: string } }
  | { type: 'UPDATE_USER'; payload: Partial<User> & { id: string } }
  | { type: 'UPDATE_PROJECT_SETTINGS'; payload: Partial<ProjectSettings> }
  | { type: 'ADD_MEMBER'; payload: { prenom: string; pseudo: string; email: string; password: string; role: Role; bio?: string } }
  | { type: 'DELETE_USER'; payload: { id: string } };

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_USER_RAHIM_ID = 'demo-rahim-001';
const DEMO_USER_YASSINE_ID = 'demo-yassine-002';

const demoUsers: User[] = [
  {
    id: DEMO_USER_RAHIM_ID,
    prenom: 'Rahim',
    pseudo: 'Rahim',
    email: 'rahim@torrevieja.studio',
    password: 'rahim123',
    role: 'Rappeur',
    bio: 'Rappeur depuis le bloc.',
    photoUrl: '',
    color: 'hsl(210, 70%, 75%)',
    initials: 'RA',
    createdAt: '2025-01-15T10:00:00.000Z',
  },
  {
    id: DEMO_USER_YASSINE_ID,
    prenom: 'Yassine',
    pseudo: 'Yassine',
    email: 'yassine@torrevieja.studio',
    password: 'yassine123',
    role: 'Beatmaker',
    bio: 'Producteur aux mille instrus.',
    photoUrl: '',
    color: 'hsl(30, 70%, 75%)',
    initials: 'YA',
    createdAt: '2025-01-15T10:05:00.000Z',
  },
];

const demoTracks: Track[] = [
  {
    id: 'demo-track-001',
    title: 'Soleil de Torrevieja',
    artistIds: [DEMO_USER_RAHIM_ID],
    extraArtists: '',
    prod: 'Yassine',
    status: 'En cours',
    duration: '3:24',
    progressPct: 60,
    notes: 'Ambiance summer, flow rapide sur le deuxième couplet.',
    position: 0,
    createdBy: DEMO_USER_RAHIM_ID,
    createdAt: '2025-02-01T14:00:00.000Z',
  },
  {
    id: 'demo-track-002',
    title: 'Nuit Blanche',
    artistIds: [DEMO_USER_RAHIM_ID, DEMO_USER_YASSINE_ID],
    extraArtists: '',
    prod: 'Yassine',
    status: 'Idée',
    duration: '',
    progressPct: 10,
    notes: 'Drill sombre, raconter la nuit.',
    position: 1,
    createdBy: DEMO_USER_YASSINE_ID,
    createdAt: '2025-02-10T20:30:00.000Z',
  },
  {
    id: 'demo-track-003',
    title: 'Brise Marine',
    artistIds: [DEMO_USER_YASSINE_ID],
    extraArtists: 'Feat. Lina',
    prod: 'Yassine',
    status: 'À mixer',
    duration: '4:02',
    progressPct: 85,
    notes: 'Prêt pour le mix, vérifier le refrain.',
    position: 2,
    createdBy: DEMO_USER_YASSINE_ID,
    createdAt: '2025-03-05T09:15:00.000Z',
  },
];

const defaultProjectSettings: ProjectSettings = {
  mixtapeName: 'Torrevieja Tape Vol. 1',
  subtitle: 'Depuis le studio',
  targetDate: '2026-06-01',
  coverUrl: '',
};

function buildInitialState(): StoreState {
  return {
    currentUser: null,
    users: demoUsers,
    tracks: demoTracks,
    lyrics: [],
    vocals: [],
    files: [],
    folders: [],
    votes: [],
    messages: [],
    activity: [],
    projectSettings: defaultProjectSettings,
  };
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'torrevieja-studio';

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      // Ensure all keys exist (handles schema evolution)
      const base = buildInitialState();
      return { ...base, ...parsed };
    }
  } catch {
    // Corrupted data – fall back to defaults
  }
  return buildInitialState();
}

function saveState(state: StoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable – silent fail
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    // ---- Auth ----
    case 'LOGIN': {
      const { email, password } = action.payload;
      const user = state.users.find((u) => u.email === email && u.password === password);
      if (!user) return state;
      return { ...state, currentUser: user };
    }

    case 'LOGOUT':
      return { ...state, currentUser: null };

    case 'REGISTER': {
      const { prenom, pseudo, email, password, role, bio } = action.payload;
      if (state.users.some((u) => u.email === email)) return state;
      const newUser: User = {
        id: uuidv4(),
        prenom,
        pseudo,
        email,
        password,
        role,
        bio: bio ?? '',
        photoUrl: '',
        color: generatePastelColor(),
        initials: computeInitials(pseudo),
        createdAt: now(),
      };
      const activityEntry = createActivityItem(newUser.id, 'register', `${pseudo} a rejoint le studio.`);
      return {
        ...state,
        currentUser: newUser,
        users: [...state.users, newUser],
        activity: [...state.activity, activityEntry],
      };
    }

    // ---- Tracks ----
    case 'ADD_TRACK': {
      const { title, artistIds, extraArtists, prod, status, duration, notes, createdBy } = action.payload;
      const newTrack: Track = {
        id: uuidv4(),
        title,
        artistIds,
        extraArtists: extraArtists ?? '',
        prod: prod ?? '',
        status: status ?? 'Idée',
        duration: duration ?? '',
        progressPct: 0,
        notes: notes ?? '',
        position: state.tracks.length,
        createdBy,
        createdAt: now(),
      };
      const activityEntry = createActivityItem(createdBy, 'add_track', `Nouveau morceau ajouté : ${title}`);
      return {
        ...state,
        tracks: [...state.tracks, newTrack],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'UPDATE_TRACK': {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
      };
    }

    case 'DELETE_TRACK': {
      const { id, userId } = action.payload;
      const track = state.tracks.find((t) => t.id === id);
      const activityEntry = createActivityItem(userId, 'delete_track', `Morceau supprimé : ${track?.title ?? id}`);
      return {
        ...state,
        tracks: state.tracks.filter((t) => t.id !== id),
        lyrics: state.lyrics.filter((l) => l.trackId !== id),
        vocals: state.vocals.filter((v) => v.trackId !== id),
        votes: state.votes.filter((v) => v.trackId !== id),
        activity: [...state.activity, activityEntry],
      };
    }

    case 'REORDER_TRACKS': {
      const { orderedIds } = action.payload;
      const reordered = state.tracks.map((t) => {
        const idx = orderedIds.indexOf(t.id);
        return idx !== -1 ? { ...t, position: idx } : t;
      });
      return { ...state, tracks: reordered };
    }

    // ---- Lyrics ----
    case 'SAVE_LYRICS': {
      const { trackId, content, updatedBy } = action.payload;
      const existing = state.lyrics.find((l) => l.trackId === trackId);
      let updatedLyrics: Lyrics[];
      if (existing) {
        updatedLyrics = state.lyrics.map((l) =>
          l.trackId === trackId ? { ...l, content, updatedBy, updatedAt: now() } : l,
        );
      } else {
        const newLyrics: Lyrics = {
          id: uuidv4(),
          trackId,
          content,
          updatedBy,
          updatedAt: now(),
        };
        updatedLyrics = [...state.lyrics, newLyrics];
      }
      const activityEntry = createActivityItem(updatedBy, 'save_lyrics', `Paroles mises à jour pour le morceau.`);
      return { ...state, lyrics: updatedLyrics, activity: [...state.activity, activityEntry] };
    }

    // ---- Vocals ----
    case 'ADD_VOCAL': {
      const { trackId, authorId, type, dataUrl, durationSec } = action.payload;
      const newVocal: Vocal = {
        id: uuidv4(),
        trackId,
        authorId,
        type,
        dataUrl,
        durationSec,
        createdAt: now(),
      };
      const activityEntry = createActivityItem(authorId, 'add_vocal', `Vocal (${type}) ajouté.`);
      return {
        ...state,
        vocals: [...state.vocals, newVocal],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'DELETE_VOCAL': {
      const { id, userId } = action.payload;
      const activityEntry = createActivityItem(userId, 'delete_vocal', `Vocal supprimé.`);
      return {
        ...state,
        vocals: state.vocals.filter((v) => v.id !== id),
        activity: [...state.activity, activityEntry],
      };
    }

    // ---- Files ----
    case 'ADD_FILE': {
      const { name, category, extension, sizeBytes, authorId, folderId, dataUrl } = action.payload;
      const newFile: FileItem = {
        id: uuidv4(),
        name,
        category,
        extension,
        sizeBytes,
        authorId,
        folderId: folderId ?? null,
        dataUrl,
        createdAt: now(),
      };
      const activityEntry = createActivityItem(authorId, 'add_file', `Fichier uploadé : ${name}`);
      return {
        ...state,
        files: [...state.files, newFile],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'DELETE_FILE': {
      const { id, userId } = action.payload;
      const file = state.files.find((f) => f.id === id);
      const activityEntry = createActivityItem(userId, 'delete_file', `Fichier supprimé : ${file?.name ?? id}`);
      return {
        ...state,
        files: state.files.filter((f) => f.id !== id),
        activity: [...state.activity, activityEntry],
      };
    }

    // ---- Folders ----
    case 'ADD_FOLDER': {
      const { name, parentId, createdBy } = action.payload;
      const newFolder: Folder = {
        id: uuidv4(),
        name,
        parentId: parentId ?? null,
        createdBy,
        createdAt: now(),
      };
      const activityEntry = createActivityItem(createdBy, 'add_folder', `Dossier créé : ${name}`);
      return {
        ...state,
        folders: [...state.folders, newFolder],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'DELETE_FOLDER': {
      const { id, userId } = action.payload;
      const folder = state.folders.find((f) => f.id === id);
      const activityEntry = createActivityItem(userId, 'delete_folder', `Dossier supprimé : ${folder?.name ?? id}`);
      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== id),
        files: state.files.map((f) => (f.folderId === id ? { ...f, folderId: null } : f)),
        activity: [...state.activity, activityEntry],
      };
    }

    // ---- Votes ----
    case 'CAST_VOTE': {
      const { trackId, userId, direction } = action.payload;
      const existing = state.votes.find((v) => v.trackId === trackId && v.userId === userId);
      let updatedVotes: Vote[];
      if (existing) {
        if (existing.direction === direction) {
          // Same direction – remove (toggle off)
          updatedVotes = state.votes.filter((v) => v.id !== existing.id);
        } else {
          // Different direction – switch
          updatedVotes = state.votes.map((v) =>
            v.id === existing.id ? { ...v, direction, createdAt: now() } : v,
          );
        }
      } else {
        const newVote: Vote = {
          id: uuidv4(),
          trackId,
          userId,
          direction,
          createdAt: now(),
        };
        updatedVotes = [...state.votes, newVote];
      }
      return { ...state, votes: updatedVotes };
    }

    // ---- Chat ----
    case 'SEND_MESSAGE': {
      const { channel, authorId, content } = action.payload;
      const newMessage: ChatMessage = {
        id: uuidv4(),
        channel,
        authorId,
        content,
        createdAt: now(),
      };
      return { ...state, messages: [...state.messages, newMessage] };
    }

    // ---- Activity ----
    case 'LOG_ACTIVITY': {
      const { userId, actionType, description } = action.payload;
      const entry = createActivityItem(userId, actionType, description);
      return { ...state, activity: [...state.activity, entry] };
    }

    // ---- User management ----
    case 'UPDATE_USER': {
      const { id, ...changes } = action.payload;
      const updatedUsers = state.users.map((u) => (u.id === id ? { ...u, ...changes } : u));
      const updatedCurrent =
        state.currentUser?.id === id ? { ...state.currentUser, ...changes } : state.currentUser;
      return { ...state, users: updatedUsers, currentUser: updatedCurrent };
    }

    case 'UPDATE_PROJECT_SETTINGS': {
      return {
        ...state,
        projectSettings: { ...state.projectSettings, ...action.payload },
      };
    }

    case 'ADD_MEMBER': {
      const { prenom, pseudo, email, password, role, bio } = action.payload;
      if (state.users.some((u) => u.email === email)) return state;
      const newUser: User = {
        id: uuidv4(),
        prenom,
        pseudo,
        email,
        password,
        role,
        bio: bio ?? '',
        photoUrl: '',
        color: generatePastelColor(),
        initials: computeInitials(pseudo),
        createdAt: now(),
      };
      const activityEntry = createActivityItem(
        state.currentUser?.id ?? newUser.id,
        'add_member',
        `${pseudo} a été ajouté au projet.`,
      );
      return {
        ...state,
        users: [...state.users, newUser],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'DELETE_USER': {
      const { id } = action.payload;
      return {
        ...state,
        users: state.users.filter((u) => u.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const StoreContext = createContext<{ state: StoreState; dispatch: Dispatch<StoreAction> } | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return createElement(StoreContext.Provider, { value: { state, dispatch } }, children);
}

export function useStore(): { state: StoreState; dispatch: Dispatch<StoreAction> } {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
