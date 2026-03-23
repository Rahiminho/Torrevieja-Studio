export type Role = 'Rappeur' | 'Beatmaker' | 'Chanteur' | 'Mixeur' | 'DA' | 'Multi';
export type TrackStatus = 'Idée' | 'En cours' | 'À mixer' | 'Mixé';
export type VocalType = 'topline' | 'yaourt' | 'couplet' | 'refrain' | 'test';
export type VoteDirection = 'up' | 'down';
export type ChatChannel = 'général' | 'prods' | 'paroles' | 'mix' | 'random';

export interface User {
  id: string;
  prenom: string;
  pseudo: string;
  email: string;
  password: string;
  role: Role;
  bio: string;
  photoUrl: string;
  color: string;
  initials: string;
  createdAt: string;
}

export interface Track {
  id: string;
  title: string;
  artistIds: string[];
  extraArtists: string;
  prod: string;
  status: TrackStatus;
  duration: string;
  progressPct: number;
  notes: string;
  position: number;
  createdBy: string;
  createdAt: string;
}

export interface Lyrics {
  id: string;
  trackId: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Vocal {
  id: string;
  trackId: string;
  authorId: string;
  type: VocalType;
  dataUrl: string;
  durationSec: number;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  category: 'audio' | 'text' | 'image' | 'other';
  extension: string;
  sizeBytes: number;
  authorId: string;
  folderId: string | null;
  dataUrl: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  trackId: string;
  userId: string;
  direction: VoteDirection;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  actionType: string;
  description: string;
  createdAt: string;
}

export interface ProjectSettings {
  mixtapeName: string;
  subtitle: string;
  targetDate: string;
  coverUrl: string;
}
