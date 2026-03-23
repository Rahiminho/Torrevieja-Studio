import { useRef } from 'react';
import { useStore } from '../store';

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

function MusicIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zm-9 11H3a2 2 0 01-2-2v-7a2 2 0 012-2h2" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zm9-13h2a2 2 0 012 2v7a2 2 0 01-2 2h-2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FinalePage
// ---------------------------------------------------------------------------

export default function FinalePage() {
  const { state, dispatch } = useStore();
  const { projectSettings, tracks, votes, users, currentUser } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedTracks = [...tracks].sort((a, b) => a.position - b.position);

  // ---- Cover upload ----
  function handleCoverClick() {
    fileInputRef.current?.click();
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: 'UPDATE_PROJECT_SETTINGS',
        payload: { coverUrl: reader.result as string },
      });
    };
    reader.readAsDataURL(file);
  }

  // ---- Editable text blur handlers ----
  function handleTitleBlur(e: React.FocusEvent<HTMLDivElement>) {
    const text = e.currentTarget.textContent?.trim() ?? '';
    if (text && text !== projectSettings.mixtapeName) {
      dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { mixtapeName: text } });
    }
  }

  function handleSubtitleBlur(e: React.FocusEvent<HTMLDivElement>) {
    const text = e.currentTarget.textContent?.trim() ?? '';
    if (text !== projectSettings.subtitle) {
      dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { subtitle: text } });
    }
  }

  // ---- Votes helpers ----
  function getUpCount(trackId: string): number {
    return votes.filter((v) => v.trackId === trackId && v.direction === 'up').length;
  }

  function getDownCount(trackId: string): number {
    return votes.filter((v) => v.trackId === trackId && v.direction === 'down').length;
  }

  function getNetScore(trackId: string): number {
    return getUpCount(trackId) - getDownCount(trackId);
  }

  function getCurrentUserVote(trackId: string): 'up' | 'down' | null {
    if (!currentUser) return null;
    const v = votes.find((v) => v.trackId === trackId && v.userId === currentUser.id);
    return v?.direction ?? null;
  }

  function handleVote(trackId: string, direction: 'up' | 'down') {
    if (!currentUser) return;
    dispatch({ type: 'CAST_VOTE', payload: { trackId, userId: currentUser.id, direction } });
  }

  // ---- Resolve artist names ----
  function resolveArtists(artistIds: string[], extraArtists: string): string {
    const names = artistIds
      .map((id) => users.find((u) => u.id === id)?.pseudo ?? '')
      .filter(Boolean);
    if (extraArtists) names.push(extraArtists);
    return names.join(', ');
  }

  // ---- Export TXT ----
  function handleExport() {
    const lines: string[] = [];
    lines.push(projectSettings.mixtapeName);
    lines.push(projectSettings.subtitle);
    lines.push('\u2550'.repeat(25));
    lines.push('');

    sortedTracks.forEach((track, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const artists = resolveArtists(track.artistIds, track.extraArtists);
      const prod = track.prod ? ` (Prod. ${track.prod})` : '';
      const dur = track.duration ? ` [${track.duration}]` : '';
      lines.push(`${num}. ${track.title} \u2014 ${artists}${prod}${dur}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectSettings.mixtapeName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---- Render ----
  return (
    <div className="space-y-8">
      {/* Banner section */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Cover image */}
        <button
          type="button"
          onClick={handleCoverClick}
          className="flex-shrink-0 w-[172px] h-[172px] rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {projectSettings.coverUrl ? (
            <img
              src={projectSettings.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gold/60 to-amber-700/80 flex items-center justify-center text-white/80">
              <MusicIcon className="w-16 h-16" />
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />

        {/* Title & subtitle */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            className="font-['Playfair_Display',serif] text-2xl font-bold text-txt1 outline-none focus:ring-1 focus:ring-gold/50 rounded px-1"
          >
            {projectSettings.mixtapeName}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handleSubtitleBlur}
            className="italic text-txt3 mt-1 outline-none focus:ring-1 focus:ring-gold/50 rounded px-1"
          >
            {projectSettings.subtitle}
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-3">
        {sortedTracks.map((track, idx) => {
          const artistStr = resolveArtists(track.artistIds, track.extraArtists);
          const upCount = getUpCount(track.id);
          const downCount = getDownCount(track.id);
          const net = getNetScore(track.id);
          const userVote = getCurrentUserVote(track.id);

          return (
            <div key={track.id} className="glass-card px-4 py-3 flex items-center gap-4 flex-wrap">
              {/* Position */}
              <span className="font-['Playfair_Display',serif] text-gold font-bold text-lg w-8 text-right flex-shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-txt1 truncate">{track.title}</div>
                <div className="text-sm text-txt3 truncate">{artistStr}</div>
              </div>

              {/* Duration */}
              {track.duration && (
                <span className="text-sm text-txt4 flex-shrink-0">{track.duration}</span>
              )}

              {/* Vote section */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleVote(track.id, 'up')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    userVote === 'up'
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-txt4 hover:text-green-400 hover:bg-green-500/10'
                  }`}
                  title="Vote up"
                >
                  <ThumbUpIcon />
                </button>
                <span className="text-xs text-txt4 min-w-[1rem] text-center">{upCount}</span>

                <button
                  type="button"
                  onClick={() => handleVote(track.id, 'down')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    userVote === 'down'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-txt4 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                  title="Vote down"
                >
                  <ThumbDownIcon />
                </button>
                <span className="text-xs text-txt4 min-w-[1rem] text-center">{downCount}</span>

                <span
                  className={`text-xs font-semibold min-w-[2rem] text-center ${
                    net > 0 ? 'text-green-400' : net < 0 ? 'text-red-400' : 'text-txt4'
                  }`}
                >
                  {net > 0 ? `+${net}` : net}
                </span>
              </div>
            </div>
          );
        })}

        {sortedTracks.length === 0 && (
          <div className="glass-card p-8 text-center text-txt4">
            Aucun morceau dans la tracklist.
          </div>
        )}
      </div>

      {/* Export button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleExport}
          className="btn-gold"
          disabled={sortedTracks.length === 0}
        >
          Exporter TXT
        </button>
      </div>
    </div>
  );
}
