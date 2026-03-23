import { useRef } from 'react';
import { useStore } from '../store';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function MusicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zm-9 11H3a2 2 0 01-2-2v-7a2 2 0 012-2h2" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zm9-13h2a2 2 0 012 2v7a2 2 0 01-2 2h-2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

  // ---- Editable text ----
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

  // ---- Vote helpers ----
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
    const v = votes.find((vt) => vt.trackId === trackId && vt.userId === currentUser.id);
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
    lines.push('\u2550'.repeat(30));
    lines.push('');

    sortedTracks.forEach((track, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const artists = resolveArtists(track.artistIds, track.extraArtists);
      const prod = track.prod ? ` (Prod. ${track.prod})` : '';
      const dur = track.duration ? ` [${track.duration}]` : '';
      lines.push(`${num}. ${track.title} \u2014 ${artists}${prod}${dur}`);
    });

    lines.push('');
    lines.push(`\u00a9 ${new Date().getFullYear()} ${projectSettings.mixtapeName}`);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--color-txt)',
            letterSpacing: '-0.02em',
          }}
        >
          La Finale
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-txt3)', marginTop: 3 }}>
          Tracklist définitive · votes · export
        </p>
      </div>

      {/* Banner section */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* Cover upload zone */}
        <button
          type="button"
          onClick={handleCoverClick}
          style={{
            flexShrink: 0,
            width: 172,
            height: 172,
            borderRadius: 16,
            overflow: 'hidden',
            cursor: 'pointer',
            border: '2px dashed rgba(200,134,10,0.35)',
            background: 'none',
            padding: 0,
            transition: 'border-color 0.2s, transform 0.2s',
            position: 'relative',
          }}
          title="Cliquer pour changer la pochette"
        >
          {projectSettings.coverUrl ? (
            <img
              src={projectSettings.coverUrl}
              alt="Pochette"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, rgba(200,134,10,0.12), rgba(212,112,10,0.18))',
                color: 'var(--color-txt3)',
              }}
            >
              <MusicIcon />
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Ajouter pochette</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleCoverChange}
        />

        {/* Title & subtitle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-txt)',
              outline: 'none',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s',
              paddingBottom: 2,
              letterSpacing: '-0.02em',
              cursor: 'text',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--color-gold)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            {projectSettings.mixtapeName}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handleSubtitleBlur}
            style={{
              fontStyle: 'italic',
              color: 'var(--color-txt3)',
              marginTop: 6,
              outline: 'none',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s',
              paddingBottom: 2,
              cursor: 'text',
              fontSize: '0.95rem',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'rgba(200,134,10,0.40)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            {projectSettings.subtitle}
          </div>
          <p
            style={{
              marginTop: 12,
              fontSize: '0.78rem',
              color: 'var(--color-txt4)',
              fontStyle: 'italic',
            }}
          >
            Cliquez sur le titre ou sous-titre pour modifier
          </p>
        </div>
      </div>

      {/* Track list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sortedTracks.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-txt4)' }}
          >
            Aucun morceau dans la tracklist.
          </div>
        ) : (
          sortedTracks.map((track, idx) => {
            const artistStr = resolveArtists(track.artistIds, track.extraArtists);
            const upCount = getUpCount(track.id);
            const downCount = getDownCount(track.id);
            const net = getNetScore(track.id);
            const userVote = getCurrentUserVote(track.id);

            return (
              <div
                key={track.id}
                className="glass-card"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                {/* Position number */}
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--color-gold)',
                    width: 28,
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Track info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      color: 'var(--color-txt)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {track.title}
                  </p>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-txt3)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 1,
                    }}
                  >
                    {artistStr}
                    {track.prod && <span style={{ color: 'var(--color-txt4)' }}> · Prod. {track.prod}</span>}
                  </p>
                </div>

                {/* Duration */}
                {track.duration && (
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--color-txt4)',
                      flexShrink: 0,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {track.duration}
                  </span>
                )}

                {/* Vote section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleVote(track.id, 'up')}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: currentUser ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      background: userVote === 'up' ? 'rgba(34,197,94,0.18)' : 'rgba(200,134,10,0.07)',
                      color: userVote === 'up' ? '#16a34a' : 'var(--color-txt4)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ThumbUpIcon />
                  </button>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-txt4)',
                      fontFamily: 'var(--font-mono)',
                      minWidth: 14,
                      textAlign: 'center',
                    }}
                  >
                    {upCount}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleVote(track.id, 'down')}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: currentUser ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      background: userVote === 'down' ? 'rgba(239,68,68,0.18)' : 'rgba(200,134,10,0.07)',
                      color: userVote === 'down' ? '#dc2626' : 'var(--color-txt4)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ThumbDownIcon />
                  </button>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-txt4)',
                      fontFamily: 'var(--font-mono)',
                      minWidth: 14,
                      textAlign: 'center',
                    }}
                  >
                    {downCount}
                  </span>

                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      minWidth: 28,
                      textAlign: 'center',
                      color: net > 0 ? '#16a34a' : net < 0 ? '#dc2626' : 'var(--color-txt4)',
                    }}
                  >
                    {net > 0 ? `+${net}` : net}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export button */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
        <button
          type="button"
          onClick={handleExport}
          className="btn-gold"
          disabled={sortedTracks.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <DownloadIcon />
          Exporter TXT
        </button>
      </div>
    </div>
  );
}
