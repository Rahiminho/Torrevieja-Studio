import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import type { Track, TrackStatus } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LYRICS_TEMPLATE = `[Couplet 1 — ]\n\n\n\n[Refrain]\n\n\n\n[Couplet 2 — ]`;

const STATUS_PILL: Record<TrackStatus, string> = {
  'Idée': 'pill-gold',
  'En cours': 'pill-blue',
  'À mixer': 'pill-violet',
  'Mixé': 'pill-green',
};

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LyricsPage() {
  const { state, dispatch } = useStore();
  const { tracks, lyrics, users, currentUser } = state;

  const sortedTracks = [...tracks].sort((a, b) => a.position - b.position);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
    sortedTracks.length > 0 ? sortedTracks[0].id : null,
  );
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTrack = sortedTracks.find((t) => t.id === selectedTrackId) ?? null;

  // Load lyrics when selected track changes
  useEffect(() => {
    if (!selectedTrackId) {
      setContent('');
      return;
    }
    const existing = lyrics.find((l) => l.trackId === selectedTrackId);
    if (existing) {
      setContent(existing.content);
    } else {
      setContent(LYRICS_TEMPLATE);
    }
  }, [selectedTrackId, lyrics]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  const showSavedIndicator = useCallback(() => {
    setSaved(true);
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
  }, []);

  const doSave = useCallback(
    (text: string) => {
      if (!selectedTrackId || !currentUser) return;
      dispatch({
        type: 'SAVE_LYRICS',
        payload: { trackId: selectedTrackId, content: text, updatedBy: currentUser.id },
      });
      showSavedIndicator();
    },
    [selectedTrackId, currentUser, dispatch, showSavedIndicator],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Debounced auto-save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave(newContent);
    }, 1000);
  };

  const handleManualSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSave(content);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback - silent fail
    }
  };

  const getArtistNames = (track: Track): string => {
    const names = track.artistIds
      .map((id) => users.find((u) => u.id === id)?.pseudo)
      .filter(Boolean);
    if (track.extraArtists) names.push(track.extraArtists);
    return names.join(', ') || '—';
  };

  // ------ Render ------

  if (sortedTracks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass-card p-8 text-center">
          <p className="text-white/60 text-lg">Aucun morceau dans le projet.</p>
          <p className="text-white/40 text-sm mt-2">Ajoutez des morceaux pour commencer à écrire.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full min-h-0">
      {/* ---- Left panel: track list (desktop) / dropdown (mobile) ---- */}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] shrink-0 glass-card p-3 overflow-y-auto">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 px-1">
          Morceaux
        </h2>
        <div className="flex flex-col gap-1">
          {sortedTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                track.id === selectedTrackId
                  ? 'bg-white/10 border-l-2 border-[var(--gold)]'
                  : 'hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <p className="text-sm font-medium text-white truncate">{track.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`${STATUS_PILL[track.status]} text-[10px] px-1.5 py-0.5 rounded-full`}>
                  {track.status}
                </span>
                <span className="text-[11px] text-white/40 truncate">
                  {getArtistNames(track)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile dropdown */}
      <div className="md:hidden glass-card p-3">
        <select
          value={selectedTrackId ?? ''}
          onChange={(e) => setSelectedTrackId(e.target.value)}
          className="input-field w-full text-sm"
        >
          {sortedTracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title} — {track.status}
            </option>
          ))}
        </select>
      </div>

      {/* ---- Right panel: editor ---- */}
      <main className="flex-1 flex flex-col min-h-0 glass-card p-4">
        {selectedTrack ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h1 className="text-lg font-bold text-white">{selectedTrack.title}</h1>
              <div className="flex items-center gap-2">
                {/* Saved indicator */}
                <span
                  className={`text-xs text-green-400 transition-opacity duration-500 ${
                    saved ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  ✓ Sauvegardé
                </span>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Copier les paroles"
                >
                  <ClipboardIcon />
                  {copied ? 'Copié !' : 'Copier'}
                </button>

                {/* Save button */}
                <button
                  onClick={handleManualSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[var(--gold)]/20 hover:bg-[var(--gold)]/30 text-[var(--gold)] transition-colors"
                  title="Sauvegarder"
                >
                  <SaveIcon />
                  Sauvegarder
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={handleChange}
              placeholder="Commence à écrire tes paroles..."
              className="input-field flex-1 min-h-[300px] md:min-h-0 resize-none font-[family-name:var(--font-mono)] leading-[2.0] text-sm"
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white/40">Sélectionne un morceau pour éditer les paroles.</p>
          </div>
        )}
      </main>
    </div>
  );
}
