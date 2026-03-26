import { supabase } from './supabase';
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
} from '../types';

// ---------------------------------------------------------------------------
// Mappers: DB row <-> App types (snake_case <-> camelCase)
// ---------------------------------------------------------------------------

function rowToUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    prenom: r.prenom as string,
    pseudo: r.pseudo as string,
    email: r.email as string,
    password: r.password_hash as string,
    role: r.role as User['role'],
    bio: (r.bio as string) ?? '',
    photoUrl: (r.photo_url as string) ?? '',
    color: (r.color as string) ?? 'hsl(210,70%,75%)',
    initials: (r.initials as string) ?? '',
    createdAt: r.created_at as string,
  };
}

function rowToTrack(r: Record<string, unknown>): Track {
  return {
    id: r.id as string,
    title: r.title as string,
    artistIds: (r.artist_ids as string[]) ?? [],
    extraArtists: (r.extra_artists as string) ?? '',
    prod: (r.prod as string) ?? '',
    status: r.status as Track['status'],
    duration: (r.duration as string) ?? '',
    progressPct: (r.progress_pct as number) ?? 0,
    notes: (r.notes as string) ?? '',
    position: (r.position as number) ?? 0,
    createdBy: r.created_by as string,
    createdAt: r.created_at as string,
  };
}

function rowToLyrics(r: Record<string, unknown>): Lyrics {
  return {
    id: r.id as string,
    trackId: r.track_id as string,
    content: (r.content as string) ?? '',
    updatedBy: r.updated_by as string,
    updatedAt: r.updated_at as string,
  };
}

function rowToVocal(r: Record<string, unknown>): Vocal {
  return {
    id: r.id as string,
    trackId: r.track_id as string,
    authorId: r.author_id as string,
    type: r.type as Vocal['type'],
    dataUrl: (r.data_url as string) ?? '',
    durationSec: (r.duration_sec as number) ?? 0,
    createdAt: r.created_at as string,
  };
}

function rowToFile(r: Record<string, unknown>): FileItem {
  return {
    id: r.id as string,
    name: r.name as string,
    category: r.category as FileItem['category'],
    extension: (r.extension as string) ?? '',
    sizeBytes: (r.size_bytes as number) ?? 0,
    authorId: r.author_id as string,
    folderId: (r.folder_id as string) ?? null,
    dataUrl: (r.data_url as string) ?? '',
    createdAt: r.created_at as string,
  };
}

function rowToFolder(r: Record<string, unknown>): Folder {
  return {
    id: r.id as string,
    name: r.name as string,
    parentId: (r.parent_id as string) ?? null,
    createdBy: r.created_by as string,
    createdAt: r.created_at as string,
  };
}

function rowToVote(r: Record<string, unknown>): Vote {
  return {
    id: r.id as string,
    trackId: r.track_id as string,
    userId: r.user_id as string,
    direction: r.direction as Vote['direction'],
    createdAt: r.created_at as string,
  };
}

function rowToMessage(r: Record<string, unknown>): ChatMessage {
  return {
    id: r.id as string,
    channel: r.channel as ChatMessage['channel'],
    authorId: r.author_id as string,
    content: r.content as string,
    createdAt: r.created_at as string,
  };
}

function rowToActivity(r: Record<string, unknown>): ActivityItem {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    actionType: r.action_type as string,
    description: r.description as string,
    createdAt: r.created_at as string,
  };
}

function rowToSettings(r: Record<string, unknown>): ProjectSettings {
  return {
    mixtapeName: (r.mixtape_name as string) ?? 'Torrevieja Tape Vol. 1',
    subtitle: (r.subtitle as string) ?? '',
    targetDate: (r.target_date as string) ?? '',
    coverUrl: (r.cover_url as string) ?? '',
  };
}

// ---------------------------------------------------------------------------
// Fetch all data (initial load)
// ---------------------------------------------------------------------------

export async function fetchAllData() {
  const [users, tracks, lyrics, vocals, files, folders, votes, messages, activity, settings] =
    await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('tracks').select('*').order('position'),
      supabase.from('lyrics').select('*'),
      supabase.from('vocals').select('*').order('created_at'),
      supabase.from('files').select('*').order('created_at', { ascending: false }),
      supabase.from('folders').select('*'),
      supabase.from('votes').select('*'),
      supabase.from('messages').select('*').order('created_at'),
      supabase.from('activity').select('*').order('created_at', { ascending: false }),
      supabase.from('project_settings').select('*').limit(1).single(),
    ]);

  return {
    users: (users.data ?? []).map(rowToUser),
    tracks: (tracks.data ?? []).map(rowToTrack),
    lyrics: (lyrics.data ?? []).map(rowToLyrics),
    vocals: (vocals.data ?? []).map(rowToVocal),
    files: (files.data ?? []).map(rowToFile),
    folders: (folders.data ?? []).map(rowToFolder),
    votes: (votes.data ?? []).map(rowToVote),
    messages: (messages.data ?? []).map(rowToMessage),
    activity: (activity.data ?? []).map(rowToActivity),
    projectSettings: settings.data ? rowToSettings(settings.data) : {
      mixtapeName: 'Torrevieja Tape Vol. 1',
      subtitle: 'L\'été de ta vie',
      targetDate: '2026-08-01',
      coverUrl: '',
    },
  };
}

// ---------------------------------------------------------------------------
// Supabase Storage helpers
// ---------------------------------------------------------------------------

const STORAGE_BUCKET = 'studio-files';

async function ensureBucket() {
  // Try to create the bucket; ignore error if it already exists
  await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
}

let bucketReady = false;

export async function uploadFileToStorage(file: File, filePath: string): Promise<string> {
  if (!bucketReady) {
    await ensureBucket();
    bucketReady = true;
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error('Storage upload error:', error);
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteFileFromStorage(filePath: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);
  if (error) console.error('Storage delete error:', error);
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

export const db = {
  // ---- Users ----
  async insertUser(user: User) {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      prenom: user.prenom,
      pseudo: user.pseudo,
      email: user.email,
      password_hash: user.password,
      role: user.role,
      bio: user.bio,
      photo_url: user.photoUrl,
      color: user.color,
      initials: user.initials,
    });
    if (error) console.error('insertUser error:', error);
  },

  async updateUser(id: string, changes: Partial<User>) {
    const mapped: Record<string, unknown> = {};
    if (changes.prenom !== undefined) mapped.prenom = changes.prenom;
    if (changes.pseudo !== undefined) mapped.pseudo = changes.pseudo;
    if (changes.email !== undefined) mapped.email = changes.email;
    if (changes.password !== undefined) mapped.password_hash = changes.password;
    if (changes.role !== undefined) mapped.role = changes.role;
    if (changes.bio !== undefined) mapped.bio = changes.bio;
    if (changes.photoUrl !== undefined) mapped.photo_url = changes.photoUrl;
    if (changes.color !== undefined) mapped.color = changes.color;
    if (changes.initials !== undefined) mapped.initials = changes.initials;
    const { error } = await supabase.from('users').update(mapped).eq('id', id);
    if (error) console.error('updateUser error:', error);
  },

  async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error('deleteUser error:', error);
  },

  async findUserByCredentials(email: string, password: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .single();
    return data ? rowToUser(data as Record<string, unknown>) : null;
  },

  // ---- Tracks ----
  async insertTrack(track: Track) {
    const { error } = await supabase.from('tracks').insert({
      id: track.id,
      title: track.title,
      artist_ids: track.artistIds,
      extra_artists: track.extraArtists,
      prod: track.prod,
      status: track.status,
      duration: track.duration,
      progress_pct: track.progressPct,
      notes: track.notes,
      position: track.position,
      created_by: track.createdBy,
    });
    if (error) console.error('insertTrack error:', error);
  },

  async updateTrack(id: string, changes: Partial<Track>) {
    const mapped: Record<string, unknown> = {};
    if (changes.title !== undefined) mapped.title = changes.title;
    if (changes.artistIds !== undefined) mapped.artist_ids = changes.artistIds;
    if (changes.extraArtists !== undefined) mapped.extra_artists = changes.extraArtists;
    if (changes.prod !== undefined) mapped.prod = changes.prod;
    if (changes.status !== undefined) mapped.status = changes.status;
    if (changes.duration !== undefined) mapped.duration = changes.duration;
    if (changes.progressPct !== undefined) mapped.progress_pct = changes.progressPct;
    if (changes.notes !== undefined) mapped.notes = changes.notes;
    if (changes.position !== undefined) mapped.position = changes.position;
    const { error } = await supabase.from('tracks').update(mapped).eq('id', id);
    if (error) console.error('updateTrack error:', error);
  },

  async deleteTrack(id: string) {
    const { error } = await supabase.from('tracks').delete().eq('id', id);
    if (error) console.error('deleteTrack error:', error);
  },

  async reorderTracks(orderedIds: string[]) {
    const updates = orderedIds.map((id, i) =>
      supabase.from('tracks').update({ position: i }).eq('id', id),
    );
    await Promise.all(updates);
  },

  // ---- Lyrics ----
  async upsertLyrics(lyrics: Lyrics) {
    const { error } = await supabase.from('lyrics').upsert({
      id: lyrics.id,
      track_id: lyrics.trackId,
      content: lyrics.content,
      updated_by: lyrics.updatedBy,
      updated_at: lyrics.updatedAt,
    }, { onConflict: 'id' });
    if (error) console.error('upsertLyrics error:', error);
  },

  // ---- Vocals ----
  async insertVocal(vocal: Vocal) {
    const { error } = await supabase.from('vocals').insert({
      id: vocal.id,
      track_id: vocal.trackId,
      author_id: vocal.authorId,
      type: vocal.type,
      data_url: vocal.dataUrl,
      duration_sec: vocal.durationSec,
    });
    if (error) console.error('insertVocal error:', error);
  },

  async deleteVocal(id: string) {
    const { error } = await supabase.from('vocals').delete().eq('id', id);
    if (error) console.error('deleteVocal error:', error);
  },

  // ---- Files ----
  async insertFile(file: FileItem) {
    const { error } = await supabase.from('files').insert({
      id: file.id,
      name: file.name,
      category: file.category,
      extension: file.extension,
      size_bytes: file.sizeBytes,
      author_id: file.authorId,
      folder_id: file.folderId,
      data_url: file.dataUrl,
    });
    if (error) console.error('insertFile error:', error);
  },

  async deleteFile(id: string) {
    const { error } = await supabase.from('files').delete().eq('id', id);
    if (error) console.error('deleteFile error:', error);
  },

  // ---- Folders ----
  async insertFolder(folder: Folder) {
    const { error } = await supabase.from('folders').insert({
      id: folder.id,
      name: folder.name,
      parent_id: folder.parentId,
      created_by: folder.createdBy,
    });
    if (error) console.error('insertFolder error:', error);
  },

  async deleteFolder(id: string) {
    // Move files out of this folder first
    await supabase.from('files').update({ folder_id: null }).eq('folder_id', id);
    const { error } = await supabase.from('folders').delete().eq('id', id);
    if (error) console.error('deleteFolder error:', error);
  },

  // ---- Votes ----
  async upsertVote(vote: Vote) {
    const { error } = await supabase.from('votes').upsert({
      id: vote.id,
      track_id: vote.trackId,
      user_id: vote.userId,
      direction: vote.direction,
    }, { onConflict: 'id' });
    if (error) console.error('upsertVote error:', error);
  },

  async deleteVote(id: string) {
    const { error } = await supabase.from('votes').delete().eq('id', id);
    if (error) console.error('deleteVote error:', error);
  },

  // ---- Messages ----
  async insertMessage(msg: ChatMessage) {
    const { error } = await supabase.from('messages').insert({
      id: msg.id,
      channel: msg.channel,
      author_id: msg.authorId,
      content: msg.content,
    });
    if (error) console.error('insertMessage error:', error);
  },

  // ---- Activity ----
  async insertActivity(item: ActivityItem) {
    const { error } = await supabase.from('activity').insert({
      id: item.id,
      user_id: item.userId,
      action_type: item.actionType,
      description: item.description,
    });
    if (error) console.error('insertActivity error:', error);
  },

  // ---- Project Settings ----
  async updateProjectSettings(settings: Partial<ProjectSettings>) {
    const mapped: Record<string, unknown> = {};
    if (settings.mixtapeName !== undefined) mapped.mixtape_name = settings.mixtapeName;
    if (settings.subtitle !== undefined) mapped.subtitle = settings.subtitle;
    if (settings.targetDate !== undefined) mapped.target_date = settings.targetDate;
    if (settings.coverUrl !== undefined) mapped.cover_url = settings.coverUrl;
    // Update the single row
    const { error } = await supabase
      .from('project_settings')
      .update(mapped)
      .not('id', 'is', null); // updates all rows (there's only one)
    if (error) console.error('updateProjectSettings error:', error);
  },
};

// ---------------------------------------------------------------------------
// Realtime subscriptions
// ---------------------------------------------------------------------------

export type RealtimeCallback = (table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', row: Record<string, unknown>) => void;

export function subscribeToChanges(callback: RealtimeCallback) {
  const channel = supabase
    .channel('studio-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tracks' }, (payload) =>
      callback('tracks', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', (payload.new ?? payload.old ?? {}) as Record<string, unknown>))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lyrics' }, (payload) =>
      callback('lyrics', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', (payload.new ?? payload.old ?? {}) as Record<string, unknown>))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vocals' }, (payload) =>
      callback('vocals', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', (payload.new ?? payload.old ?? {}) as Record<string, unknown>))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) =>
      callback('votes', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', (payload.new ?? payload.old ?? {}) as Record<string, unknown>))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) =>
      callback('messages', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', (payload.new ?? payload.old ?? {}) as Record<string, unknown>))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, (payload) =>
      callback('activity', payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', (payload.new ?? payload.old ?? {}) as Record<string, unknown>))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
