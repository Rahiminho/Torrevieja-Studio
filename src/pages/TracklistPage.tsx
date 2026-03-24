import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../store';
import Modal from '../components/Modal';
import type { Track, TrackStatus } from '../types';

const STATUS_OPTIONS: TrackStatus[] = ['Idée', 'En cours', 'À mixer', 'Mixé'];

function statusPillClass(status: TrackStatus): string {
  switch (status) {
    case 'Idée':
      return 'pill-gold';
    case 'En cours':
      return 'pill-blue';
    case 'À mixer':
      return 'pill-violet';
    case 'Mixé':
      return 'pill-green';
    default:
      return 'pill-gold';
  }
}

interface TrackFormData {
  title: string;
  artistIds: string[];
  extraArtists: string;
  prod: string;
  status: TrackStatus;
  duration: string;
  progressPct: number;
  notes: string;
}

const emptyForm: TrackFormData = {
  title: '',
  artistIds: [],
  extraArtists: '',
  prod: '',
  status: 'Idée',
  duration: '',
  progressPct: 0,
  notes: '',
};

export default function TracklistPage() {
  const { state, dispatch } = useStore();
  const { tracks, users, vocals, currentUser } = state;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [form, setForm] = useState<TrackFormData>(emptyForm);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [recordingTrackId, setRecordingTrackId] = useState<string | null>(null);

  // Drag state
  const dragItemRef = useRef<string | null>(null);
  const dragOverItemRef = useRef<string | null>(null);

  const sortedTracks = useMemo(
    () => [...tracks].sort((a, b) => a.position - b.position),
    [tracks],
  );

  // Helpers
  const resolveUser = (id: string) => users.find((u) => u.id === id);

  const resolveArtistNames = (artistIds: string[]): string =>
    artistIds
      .map((id) => resolveUser(id)?.pseudo ?? 'Inconnu')
      .join(', ');

  // Modal open/close
  const openAddModal = () => {
    setEditingTrackId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (track: Track) => {
    setEditingTrackId(track.id);
    setForm({
      title: track.title,
      artistIds: [...track.artistIds],
      extraArtists: track.extraArtists,
      prod: track.prod,
      status: track.status,
      duration: track.duration,
      progressPct: track.progressPct,
      notes: track.notes,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTrackId(null);
  };

  // Save
  const handleSave = () => {
    if (!form.title.trim() || !currentUser) return;

    if (editingTrackId) {
      dispatch({
        type: 'UPDATE_TRACK',
        payload: {
          id: editingTrackId,
          title: form.title,
          artistIds: form.artistIds,
          extraArtists: form.extraArtists,
          prod: form.prod,
          status: form.status,
          duration: form.duration,
          progressPct: form.progressPct,
          notes: form.notes,
        },
      });
    } else {
      dispatch({
        type: 'ADD_TRACK',
        payload: {
          title: form.title,
          artistIds: form.artistIds,
          extraArtists: form.extraArtists,
          prod: form.prod,
          status: form.status,
          duration: form.duration,
          notes: form.notes,
          createdBy: currentUser.id,
        },
      });
    }
    closeModal();
  };

  // Delete
  const handleDelete = (track: Track) => {
    if (!currentUser) return;
    if (confirm(`Supprimer "${track.title}" ?`)) {
      dispatch({ type: 'DELETE_TRACK', payload: { id: track.id, userId: currentUser.id } });
    }
  };

  // Delete vocal
  const handleDeleteVocal = (vocalId: string) => {
    if (!currentUser) return;
    if (confirm('Supprimer ce vocal ?')) {
      dispatch({ type: 'DELETE_VOCAL', payload: { id: vocalId, userId: currentUser.id } });
    }
  };

  // Drag & Drop
  const handleDragStart = (trackId: string) => {
    dragItemRef.current = trackId;
  };

  const handleDragOver = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    dragOverItemRef.current = trackId;
  };

  const handleDrop = () => {
    if (!dragItemRef.current || !dragOverItemRef.current) return;
    if (dragItemRef.current === dragOverItemRef.current) return;

    const orderedIds = sortedTracks.map((t) => t.id);
    const fromIndex = orderedIds.indexOf(dragItemRef.current);
    const toIndex = orderedIds.indexOf(dragOverItemRef.current);

    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = orderedIds.splice(fromIndex, 1);
    orderedIds.splice(toIndex, 0, moved);

    dispatch({ type: 'REORDER_TRACKS', payload: { orderedIds } });

    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const handleDragEnd = () => {
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  // Toggle artist chip
  const toggleArtist = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      artistIds: prev.artistIds.includes(userId)
        ? prev.artistIds.filter((id) => id !== userId)
        : [...prev.artistIds, userId],
    }));
  };

  // Vocals for a track
  const getTrackVocals = (trackId: string) =>
    vocals.filter((v) => v.trackId === trackId);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-txt">
          Tracklist
        </h1>
        <button className="btn-gold" onClick={openAddModal}>
          + Nouveau morceau
        </button>
      </div>

      {/* Desktop table */}
      <div className="glass-card hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.06)] text-txt2">
              <th className="py-3 px-2 w-10"></th>
              <th className="py-3 px-2 w-10">#</th>
              <th className="py-3 px-2">Titre / Artistes</th>
              <th className="py-3 px-2">Prod</th>
              <th className="py-3 px-2">Statut</th>
              <th className="py-3 px-2">Durée</th>
              <th className="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTracks.map((track) => {
              const trackVocals = getTrackVocals(track.id);
              const isExpanded = expandedTrackId === track.id;

              return (
                <React.Fragment key={track.id}>
                  <tr
                    draggable
                    onDragStart={() => handleDragStart(track.id)}
                    onDragOver={(e) => handleDragOver(e, track.id)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className="border-b border-[rgba(0,0,0,0.04)] hover:bg-surface2 transition-colors cursor-grab active:cursor-grabbing [&.dragging]:opacity-40"
                    style={{ opacity: dragItemRef.current === track.id ? 0.4 : 1 }}
                  >
                    <td className="py-3 px-2 text-txt3 select-none">☰</td>
                    <td className="py-3 px-2 text-txt2 font-mono">{track.position + 1}</td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-txt">{track.title}</div>
                      <div className="text-xs text-txt3">
                        {resolveArtistNames(track.artistIds)}
                        {track.extraArtists ? ` ${track.extraArtists}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-txt2">{track.prod || '—'}</td>
                    <td className="py-3 px-2">
                      <span className={`${statusPillClass(track.status)} text-xs px-2 py-0.5 rounded-full`}>
                        {track.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-txt2 font-mono">{track.duration || '—'}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(track)}
                          className="p-1.5 rounded hover:bg-surface3 text-txt3 hover:text-txt transition-colors"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(track)}
                          className="p-1.5 rounded hover:bg-red-100 text-txt3 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => setRecordingTrackId(track.id)}
                          className="p-1.5 rounded hover:bg-surface3 text-txt3 hover:text-txt transition-colors"
                          title="Enregistrer un vocal"
                        >
                          🎙️
                        </button>
                        {trackVocals.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedTrackId(isExpanded ? null : track.id)
                            }
                            className="p-1.5 rounded hover:bg-surface3 text-txt3 hover:text-txt transition-colors text-xs"
                            title="Voir les vocals"
                          >
                            {isExpanded ? '▲' : '▼'} {trackVocals.length}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded vocals section */}
                  {isExpanded && trackVocals.length > 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 bg-surface2">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-txt2 mb-2">
                            Vocals ({trackVocals.length})
                          </div>
                          {trackVocals.map((vocal) => {
                            const author = resolveUser(vocal.authorId);
                            return (
                              <div
                                key={vocal.id}
                                className="flex items-center gap-3 flex-wrap bg-surface2 rounded-lg p-2"
                              >
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(232,160,32,0.15)] text-gold font-medium">
                                  {vocal.type}
                                </span>
                                <span className="text-xs text-txt2">
                                  {author?.pseudo ?? 'Inconnu'}
                                </span>
                                <span className="text-xs text-txt3">
                                  {formatDate(vocal.createdAt)}
                                </span>
                                <audio
                                  src={vocal.dataUrl}
                                  controls
                                  className="h-8 flex-1 min-w-[180px]"
                                />
                                <span className="text-xs text-txt3">
                                  {Math.round(vocal.durationSec)}s
                                </span>
                                {currentUser && currentUser.id === vocal.authorId && (
                                  <button
                                    onClick={() => handleDeleteVocal(vocal.id)}
                                    className="p-1 rounded hover:bg-red-100 text-txt3 hover:text-red-600 transition-colors text-xs"
                                    title="Supprimer ce vocal"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {sortedTracks.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-txt3">
                  Aucun morceau pour le moment. Commencez par en ajouter un !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {sortedTracks.map((track) => {
          const trackVocals = getTrackVocals(track.id);
          const isExpanded = expandedTrackId === track.id;

          return (
            <div
              key={track.id}
              className="glass-card"
              draggable
              onDragStart={() => handleDragStart(track.id)}
              onDragOver={(e) => handleDragOver(e, track.id)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              style={{ opacity: dragItemRef.current === track.id ? 0.4 : 1 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-txt3 cursor-grab active:cursor-grabbing select-none mt-1">
                  ☰
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-txt3 font-mono">{track.position + 1}.</span>
                    <span className="font-medium text-txt truncate">{track.title}</span>
                    <span
                      className={`${statusPillClass(track.status)} text-xs px-2 py-0.5 rounded-full`}
                    >
                      {track.status}
                    </span>
                  </div>
                  <div className="text-xs text-txt3 mt-1">
                    {resolveArtistNames(track.artistIds)}
                    {track.extraArtists ? ` ${track.extraArtists}` : ''}
                  </div>
                  <div className="text-xs text-txt3 mt-0.5">
                    {track.prod && <>Prod: {track.prod}</>}
                    {track.prod && track.duration && <> &middot; </>}
                    {track.duration && <>{track.duration}</>}
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => openEditModal(track)}
                      className="p-1.5 rounded hover:bg-surface3 text-txt3 hover:text-txt transition-colors text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(track)}
                      className="p-1.5 rounded hover:bg-red-100 text-txt3 hover:text-red-600 transition-colors text-sm"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => setRecordingTrackId(track.id)}
                      className="p-1.5 rounded hover:bg-surface3 text-txt3 hover:text-txt transition-colors text-sm"
                    >
                      🎙️
                    </button>
                    {trackVocals.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedTrackId(isExpanded ? null : track.id)
                        }
                        className="p-1.5 rounded hover:bg-surface3 text-txt3 hover:text-txt transition-colors text-xs"
                      >
                        {isExpanded ? '▲' : '▼'} {trackVocals.length} vocal
                        {trackVocals.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>

                  {/* Expanded vocals */}
                  {isExpanded && trackVocals.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-[rgba(0,0,0,0.06)] pt-3">
                      <div className="text-xs font-semibold text-txt2">
                        Vocals ({trackVocals.length})
                      </div>
                      {trackVocals.map((vocal) => {
                        const author = resolveUser(vocal.authorId);
                        return (
                          <div
                            key={vocal.id}
                            className="bg-surface2 rounded-lg p-2 space-y-1"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(232,160,32,0.15)] text-gold font-medium">
                                {vocal.type}
                              </span>
                              <span className="text-xs text-txt2">
                                {author?.pseudo ?? 'Inconnu'}
                              </span>
                              <span className="text-xs text-txt3">
                                {formatDate(vocal.createdAt)}
                              </span>
                              {currentUser && currentUser.id === vocal.authorId && (
                                <button
                                  onClick={() => handleDeleteVocal(vocal.id)}
                                  className="p-1 rounded hover:bg-red-100 text-txt3 hover:text-red-600 transition-colors text-xs ml-auto"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                            <audio
                              src={vocal.dataUrl}
                              controls
                              className="w-full h-8"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedTracks.length === 0 && (
          <div className="glass-card text-center text-txt3 py-8">
            Aucun morceau pour le moment. Commencez par en ajouter un !
          </div>
        )}
      </div>

      {/* Recording state indicator */}
      {recordingTrackId && (
        <div className="glass-card border border-gold/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-txt">
              🎙️ Enregistrement vocal pour :{' '}
              <span className="font-semibold">
                {tracks.find((t) => t.id === recordingTrackId)?.title ?? ''}
              </span>
            </div>
            <button
              onClick={() => setRecordingTrackId(null)}
              className="text-xs text-txt3 hover:text-txt transition-colors"
            >
              Fermer
            </button>
          </div>
          <p className="text-xs text-txt3 mt-1">
            Le composant VocalRecorder sera affiché ici.
          </p>
        </div>
      )}

      {/* Add/Edit Track Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingTrackId ? 'Modifier le morceau' : 'Nouveau morceau'}
        width="max-w-xl"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-txt2 mb-1">Titre</label>
            <input
              type="text"
              className="input-field w-full"
              placeholder="Titre du morceau"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Artist selector */}
          <div>
            <label className="block text-xs text-txt2 mb-1">Artistes</label>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => {
                const selected = form.artistIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleArtist(user.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selected
                        ? 'bg-gold text-white font-medium'
                        : 'bg-surface3 text-txt2 hover:bg-[rgba(232,160,32,0.15)]'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: user.color, color: '#1a1a2e' }}
                    >
                      {user.initials}
                    </span>
                    {user.pseudo}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra artists */}
          <div>
            <label className="block text-xs text-txt2 mb-1">Artistes externes</label>
            <input
              type="text"
              className="input-field w-full"
              placeholder="Feat. Lina, DJ Khaled..."
              value={form.extraArtists}
              onChange={(e) =>
                setForm((f) => ({ ...f, extraArtists: e.target.value }))
              }
            />
          </div>

          {/* Prod / Beatmaker */}
          <div>
            <label className="block text-xs text-txt2 mb-1">Beatmaker / Prod</label>
            <input
              type="text"
              className="input-field w-full"
              placeholder="Nom du producteur"
              value={form.prod}
              onChange={(e) => setForm((f) => ({ ...f, prod: e.target.value }))}
            />
          </div>

          {/* Status + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-txt2 mb-1">Statut</label>
              <select
                className="input-field w-full"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as TrackStatus }))
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-txt2 mb-1">Durée</label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="3:30"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Progress slider */}
          <div>
            <label className="block text-xs text-txt2 mb-1">
              Progression : {form.progressPct}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progressPct}
              onChange={(e) =>
                setForm((f) => ({ ...f, progressPct: Number(e.target.value) }))
              }
              className="w-full accent-gold"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-txt2 mb-1">Notes</label>
            <textarea
              className="input-field w-full min-h-[80px] resize-y"
              placeholder="Notes, idées, remarques..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Save button */}
          <button className="btn-gold w-full" onClick={handleSave}>
            {editingTrackId ? 'Enregistrer les modifications' : 'Ajouter le morceau'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
