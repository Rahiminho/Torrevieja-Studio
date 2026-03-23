import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { TrackStatus } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return 'à l\'instant';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD}j`;
}

const STATUS_PILL: Record<TrackStatus, string> = {
  'Idée': 'pill-gold',
  'En cours': 'pill-blue',
  'À mixer': 'pill-violet',
  'Mixé': 'pill-green',
};

// ---------------------------------------------------------------------------
// Inline icons
// ---------------------------------------------------------------------------

function MusicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-5.93-3.5A4 4 0 1016 10.13M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { state } = useStore();
  const navigate = useNavigate();

  const { tracks, users, files, activity, currentUser, loading, projectSettings } = state;

  const mixedCount = tracks.filter((t) => t.status === 'Mixé').length;
  const inProgressCount = tracks.filter((t) => t.status === 'En cours').length;
  const sortedTracks = [...tracks].sort((a, b) => a.position - b.position);
  const recentActivity = [...activity].slice(0, 12);

  // Overall mixtape progress
  const overallProgress = tracks.length > 0
    ? Math.round(tracks.reduce((sum, t) => sum + t.progressPct, 0) / tracks.length)
    : 0;

  const stats = [
    {
      label: 'Morceaux',
      value: tracks.length,
      sub: `${inProgressCount} en cours`,
      Icon: MusicIcon,
      color: 'rgba(200,134,10,0.12)',
      iconColor: 'var(--color-gold)',
    },
    {
      label: 'Mixés',
      value: mixedCount,
      sub: `${tracks.length > 0 ? Math.round((mixedCount / tracks.length) * 100) : 0}% de la tape`,
      Icon: CheckIcon,
      color: 'rgba(34,197,94,0.10)',
      iconColor: '#16a34a',
    },
    {
      label: 'Crew',
      value: users.length,
      sub: 'membres actifs',
      Icon: UsersIcon,
      color: 'rgba(59,130,246,0.10)',
      iconColor: '#2563eb',
    },
    {
      label: 'Fichiers',
      value: files.length,
      sub: 'uploadés',
      Icon: FolderIcon,
      color: 'rgba(168,85,247,0.10)',
      iconColor: '#9333ea',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Stats skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-card animate-skeleton" style={{ padding: '16px 18px', height: 80 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {[0, 1].map((i) => (
            <div key={i} className="glass-card animate-skeleton" style={{ height: 180 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--color-txt)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          Bonjour {currentUser?.prenom ?? 'là'} 👋
        </h1>
        <p style={{ color: 'var(--color-txt3)', fontSize: '0.9rem' }}>
          Voici l&apos;avancement de la mixtape · <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{projectSettings.mixtapeName}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
        className="lg:grid-cols-4"
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="glass-card animate-fade-in"
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              animationDelay: `${i * 55}ms`,
              animationFillMode: 'both',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 12,
                background: s.color,
                color: s.iconColor,
                flexShrink: 0,
              }}
            >
              <s.Icon />
            </div>
            <div>
              <p
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-txt)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {s.value}
              </p>
              <p style={{ color: 'var(--color-txt3)', fontSize: '0.78rem', marginTop: 2, fontWeight: 500 }}>{s.label}</p>
              <p style={{ color: 'var(--color-txt4)', fontSize: '0.7rem', marginTop: 1 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      {tracks.length > 0 && (
        <div
          className="glass-card animate-fade-in"
          style={{ padding: '16px 20px', animationDelay: '220ms', animationFillMode: 'both' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-txt)', letterSpacing: '-0.01em' }}>
              Progression globale
            </span>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--color-gold)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {overallProgress}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 8,
              borderRadius: 999,
              background: 'rgba(200,134,10,0.10)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold3))',
                width: `${overallProgress}%`,
                transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            />
          </div>
        </div>
      )}

      {/* 3-col layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 16,
        }}
        className="lg:grid-cols-3"
      >
        {/* Progress bars per track */}
        <div
          className="glass-card animate-fade-in"
          style={{ padding: '18px 20px', animationDelay: '270ms', animationFillMode: 'both' }}
        >
          <h2
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: '-0.01em',
              color: 'var(--color-txt)',
            }}
          >
            Progression par morceau
          </h2>

          {sortedTracks.length === 0 ? (
            <p style={{ color: 'var(--color-txt3)', fontSize: '0.85rem' }}>
              Aucun morceau pour le moment.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => navigate('/tracklist')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'var(--font-body)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.83rem',
                        fontWeight: 600,
                        color: 'var(--color-txt)',
                        letterSpacing: '-0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {track.title}
                    </span>
                    <span
                      style={{
                        color: 'var(--color-txt3)',
                        flexShrink: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {track.progressPct}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 5,
                      borderRadius: 999,
                      background: 'rgba(200,134,10,0.09)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 999,
                        background: track.status === 'Mixé'
                          ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                          : 'linear-gradient(90deg, var(--color-gold), var(--color-gold3))',
                        width: `${track.progressPct}%`,
                        transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tracklist preview */}
        <div
          className="glass-card animate-fade-in"
          style={{ padding: '18px 20px', animationDelay: '320ms', animationFillMode: 'both' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-txt)' }}>
              Tracklist
            </h2>
            <button
              type="button"
              onClick={() => navigate('/tracklist')}
              style={{
                fontSize: '0.72rem',
                color: 'var(--color-gold)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
              }}
            >
              Voir tout →
            </button>
          </div>

          {sortedTracks.length === 0 ? (
            <p style={{ color: 'var(--color-txt3)', fontSize: '0.85rem' }}>Aucun morceau pour le moment.</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedTracks.slice(0, 6).map((track) => {
                const artistNames = track.artistIds
                  .map((aid) => users.find((u) => u.id === aid)?.pseudo)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <li
                    key={track.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.83rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--color-txt4)',
                        flexShrink: 0,
                        width: 18,
                        textAlign: 'right',
                      }}
                    >
                      {String(track.position + 1).padStart(2, '0')}
                    </span>
                    <span className={`pill ${STATUS_PILL[track.status]}`} style={{ flexShrink: 0 }}>
                      {track.status}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        color: 'var(--color-txt)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {track.title}
                    </span>
                    {artistNames && (
                      <span
                        style={{
                          color: 'var(--color-txt4)',
                          fontSize: '0.75rem',
                          flexShrink: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 80,
                        }}
                      >
                        {artistNames}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Activity feed */}
        <div
          className="glass-card animate-fade-in"
          style={{ padding: '18px 20px', animationDelay: '370ms', animationFillMode: 'both' }}
        >
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em', color: 'var(--color-txt)' }}>
            Activité récente
          </h2>

          {recentActivity.length === 0 ? (
            <p style={{ color: 'var(--color-txt3)', fontSize: '0.85rem' }}>Aucune activité pour le moment.</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentActivity.map((item) => {
                const user = users.find((u) => u.id === item.userId);
                const initials = user?.initials ?? '??';
                const bgColor = user?.color ?? 'hsl(0,0%,60%)';

                return (
                  <li key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        backgroundColor: bgColor,
                        color: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          letterSpacing: '-0.01em',
                          color: 'var(--color-txt)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.description}
                      </p>
                      <p style={{ color: 'var(--color-txt4)', fontSize: '0.72rem', marginTop: 1 }}>
                        {relativeTime(item.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
