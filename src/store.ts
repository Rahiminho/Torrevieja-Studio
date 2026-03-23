import { createContext, useContext, useReducer, useEffect, useCallback, type Dispatch, type ReactNode } from 'react';
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
import { fetchAllData, db, subscribeToChanges } from './lib/supabaseSync';

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
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type StoreAction =
  | { type: 'LOGIN'; payload: { email: string; password: string } }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: { prenom: string; pseudo: string; email: string; password: string; role: Role; bio?: string } }
  | { type: 'HYDRATE'; payload: Omit<StoreState, 'currentUser' | 'loading'> }
  | { type: 'SET_LOADING'; payload: boolean }
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
// Default state
// ---------------------------------------------------------------------------

const defaultProjectSettings: ProjectSettings = {
  mixtapeName: 'Torrevieja Tape Vol. 1',
  subtitle: 'Depuis le studio',
  targetDate: '2026-06-01',
  coverUrl: '',
};

function buildInitialState(): StoreState {
  return {
    currentUser: null,
    users: [],
    tracks: [],
    lyrics: [],
    vocals: [],
    files: [],
    folders: [],
    votes: [],
    messages: [],
    activity: [],
    projectSettings: defaultProjectSettings,
    loading: true,
  };
}

// ---------------------------------------------------------------------------
// Session persistence (only current user login)
// ---------------------------------------------------------------------------

const SESSION_KEY = 'torrevieja-session';

function loadSession(): { email: string; password: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveSession(email: string, password: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, password }));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'HYDRATE': {
      return { ...state, ...action.payload, loading: false };
    }

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    // ---- Auth ----
    case 'LOGIN': {
      // Handled async in the provider – reducer is a no-op
      return state;
    }

    case 'LOGIN_SUCCESS': {
      return { ...state, currentUser: action.payload.user };
    }

    case 'LOGOUT': {
      clearSession();
      return { ...state, currentUser: null };
    }

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
      // Async: persist to Supabase
      db.insertUser(newUser);
      db.insertActivity(activityEntry);
      saveSession(email, password);
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
      db.insertTrack(newTrack);
      db.insertActivity(activityEntry);
      return {
        ...state,
        tracks: [...state.tracks, newTrack],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'UPDATE_TRACK': {
      const { id, ...changes } = action.payload;
      db.updateTrack(id, changes);
      return {
        ...state,
        tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
      };
    }

    case 'DELETE_TRACK': {
      const { id, userId } = action.payload;
      const track = state.tracks.find((t) => t.id === id);
      const activityEntry = createActivityItem(userId, 'delete_track', `Morceau supprimé : ${track?.title ?? id}`);
      db.deleteTrack(id);
      db.insertActivity(activityEntry);
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
      db.reorderTracks(orderedIds);
      return { ...state, tracks: reordered };
    }

    // ---- Lyrics ----
    case 'SAVE_LYRICS': {
      const { trackId, content, updatedBy } = action.payload;
      const existing = state.lyrics.find((l) => l.trackId === trackId);
      let updatedLyrics: Lyrics[];
      if (existing) {
        const updated = { ...existing, content, updatedBy, updatedAt: now() };
        updatedLyrics = state.lyrics.map((l) =>
          l.trackId === trackId ? updated : l,
        );
        db.upsertLyrics(updated);
      } else {
        const newLyrics: Lyrics = {
          id: uuidv4(),
          trackId,
          content,
          updatedBy,
          updatedAt: now(),
        };
        updatedLyrics = [...state.lyrics, newLyrics];
        db.upsertLyrics(newLyrics);
      }
      const activityEntry = createActivityItem(updatedBy, 'save_lyrics', `Paroles mises à jour pour le morceau.`);
      db.insertActivity(activityEntry);
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
      db.insertVocal(newVocal);
      db.insertActivity(activityEntry);
      return {
        ...state,
        vocals: [...state.vocals, newVocal],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'DELETE_VOCAL': {
      const { id, userId } = action.payload;
      const activityEntry = createActivityItem(userId, 'delete_vocal', `Vocal supprimé.`);
      db.deleteVocal(id);
      db.insertActivity(activityEntry);
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
      db.insertFile(newFile);
      db.insertActivity(activityEntry);
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
      db.deleteFile(id);
      db.insertActivity(activityEntry);
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
      db.insertFolder(newFolder);
      db.insertActivity(activityEntry);
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
      db.deleteFolder(id);
      db.insertActivity(activityEntry);
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
          updatedVotes = state.votes.filter((v) => v.id !== existing.id);
          db.deleteVote(existing.id);
        } else {
          const updated = { ...existing, direction, createdAt: now() };
          updatedVotes = state.votes.map((v) =>
            v.id === existing.id ? updated : v,
          );
          db.upsertVote(updated);
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
        db.upsertVote(newVote);
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
      db.insertMessage(newMessage);
      return { ...state, messages: [...state.messages, newMessage] };
    }

    // ---- Activity ----
    case 'LOG_ACTIVITY': {
      const { userId, actionType, description } = action.payload;
      const entry = createActivityItem(userId, actionType, description);
      db.insertActivity(entry);
      return { ...state, activity: [...state.activity, entry] };
    }

    // ---- User management ----
    case 'UPDATE_USER': {
      const { id, ...changes } = action.payload;
      db.updateUser(id, changes);
      const updatedUsers = state.users.map((u) => (u.id === id ? { ...u, ...changes } : u));
      const updatedCurrent =
        state.currentUser?.id === id ? { ...state.currentUser, ...changes } : state.currentUser;
      return { ...state, users: updatedUsers, currentUser: updatedCurrent };
    }

    case 'UPDATE_PROJECT_SETTINGS': {
      db.updateProjectSettings(action.payload);
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
      db.insertUser(newUser);
      db.insertActivity(activityEntry);
      return {
        ...state,
        users: [...state.users, newUser],
        activity: [...state.activity, activityEntry],
      };
    }

    case 'DELETE_USER': {
      const { id } = action.payload;
      db.deleteUser(id);
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

interface StoreContextValue {
  state: StoreState;
  dispatch: Dispatch<StoreAction>;
  loginAsync: (email: string, password: string) => Promise<User | null>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, buildInitialState);

  // Load data from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const data = await fetchAllData();
        if (cancelled) return;
        dispatch({ type: 'HYDRATE', payload: data });

        // Restore session
        const session = loadSession();
        if (session) {
          const user = data.users.find(
            (u) => u.email === session.email && u.password === session.password,
          );
          if (user) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
          } else {
            clearSession();
          }
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
        if (!cancelled) dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    init();

    // Subscribe to realtime changes – refresh data periodically
    const unsubscribe = subscribeToChanges(async () => {
      // On any change from another client, re-fetch
      try {
        const data = await fetchAllData();
        if (!cancelled) dispatch({ type: 'HYDRATE', payload: data });
      } catch { /* silent */ }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const loginAsync = useCallback(async (email: string, password: string): Promise<User | null> => {
    const user = await db.findUserByCredentials(email, password);
    if (user) {
      saveSession(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
    }
    return user;
  }, []);

  return createElement(StoreContext.Provider, { value: { state, dispatch, loginAsync } }, children);
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
