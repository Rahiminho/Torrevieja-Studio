import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { TrackStatus } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'il y a quelques secondes';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} heure${diffH > 1 ? 's' : ''}`;

  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} jour${diffD > 1 ? 's' : ''}`;
}

const STATUS_PILL: Record<TrackStatus, string> = {
  'Idée': 'pill-gold',
  'En cours': 'pill-blue',
  'À mixer': 'pill-violet',
  'Mixé': 'pill-green',
};

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

function MusicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-5.93-3.5A4 4 0 1016 10.13M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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

  const { tracks, users, files, activity } = state;

  const mixedCount = tracks.filter((t) => t.status === 'Mixé').length;
  const notMixedCount = tracks.length - mixedCount;
  const sortedTracks = [...tracks].sort((a, b) => a.position - b.position);
  const recentActivity = [...activity].reverse().slice(0, 10);

  const stats = [
    { label: 'Morceaux', value: notMixedCount, Icon: MusicIcon, color: 'rgba(255,122,0,0.10)' },
    { label: 'Mixés', value: mixedCount, Icon: CheckIcon, color: 'rgba(34,197,94,0.10)' },
    { label: 'Crew', value: users.length, Icon: UsersIcon, color: 'rgba(59,130,246,0.10)' },
    { label: 'Fichiers', value: files.length, Icon: FolderIcon, color: 'rgba(139,92,246,0.10)' },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Stat cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="glass-card animate-fade-in"
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              animationDelay: `${i * 60}ms`,
              animationFillMode: 'both',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                borderRadius: 12,
                background: s.color,
                color: 'var(--color-gold)',
                flexShrink: 0,
              }}
            >
              <s.Icon />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ color: 'var(--color-txt3)', fontSize: '0.8rem', marginTop: 2 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---- 3-column layout ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* -- Progress column -- */}
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14, letterSpacing: '-0.01em' }}>Progression</h2>

          {sortedTracks.length === 0 && (
            <p style={{ color: 'var(--color-txt3)', fontSize: '0.85rem' }}>Aucun morceau pour le moment.</p>
          )}

          <div className="space-y-3">
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
                }}
                className="space-y-1.5 hover:opacity-80 transition-opacity"
              >
                <div className="flex justify-between text-sm">
                  <span className="truncate font-medium" style={{ color: 'var(--color-txt)', letterSpacing: '-0.01em' }}>{track.title}</span>
                  <span style={{ color: 'var(--color-txt3)', flexShrink: 0, marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{track.progressPct}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 999,
                    background: 'rgba(255,122,0,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold3))',
                      width: `${track.progressPct}%`,
                      transition: 'width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* -- Tracklist preview -- */}
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14, letterSpacing: '-0.01em' }}>Tracklist</h2>

          {sortedTracks.length === 0 && (
            <p style={{ color: 'var(--color-txt3)', fontSize: '0.85rem' }}>Aucun morceau pour le moment.</p>
          )}

          <ul className="space-y-2.5">
            {sortedTracks.slice(0, 6).map((track) => {
              const artistNames = track.artistIds
                .map((aid) => users.find((u) => u.id === aid)?.pseudo)
                .filter(Boolean)
                .join(', ');

              return (
                <li key={track.id} className="flex items-center gap-3 text-sm">
                  <span className={`${STATUS_PILL[track.status]} shrink-0`}>
                    {track.status}
                  </span>
                  <span className="truncate font-medium" style={{ letterSpacing: '-0.01em' }}>{track.title}</span>
                  {artistNames && (
                    <span className="text-txt3 truncate ml-auto" style={{ fontSize: '0.8rem' }}>{artistNames}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* -- Activity feed -- */}
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14, letterSpacing: '-0.01em' }}>Activité récente</h2>

          {recentActivity.length === 0 && (
            <p style={{ color: 'var(--color-txt3)', fontSize: '0.85rem' }}>Aucune activité pour le moment.</p>
          )}

          <ul className="space-y-3">
            {recentActivity.map((item) => {
              const user = users.find((u) => u.id === item.userId);
              const initials = user?.initials ?? '??';
              const bgColor = user?.color ?? 'hsl(0,0%,50%)';

              return (
                <li key={item.id} className="flex items-start gap-3 text-sm">
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      backgroundColor: bgColor,
                      color: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate" style={{ letterSpacing: '-0.01em' }}>{item.description}</p>
                    <p style={{ color: 'var(--color-txt4)', fontSize: '0.75rem', marginTop: 1 }}>{relativeTime(item.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
