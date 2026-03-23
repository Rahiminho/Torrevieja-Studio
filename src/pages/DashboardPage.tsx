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
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-5.93-3.5A4 4 0 1016 10.13M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    { label: 'Morceaux', value: notMixedCount, Icon: MusicIcon },
    { label: 'Mixés', value: mixedCount, Icon: CheckIcon },
    { label: 'Crew', value: users.length, Icon: UsersIcon },
    { label: 'Fichiers', value: files.length, Icon: FolderIcon },
  ];

  return (
    <div className="space-y-8">
      {/* ---- Stat cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold/20 text-gold shrink-0">
              <s.Icon />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-txt3 text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---- 3-column layout ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* -- Progress column -- */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Progression</h2>

          {sortedTracks.length === 0 && (
            <p className="text-txt3 text-sm">Aucun morceau pour le moment.</p>
          )}

          <div className="space-y-3">
            {sortedTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => navigate('/tracklist')}
                className="w-full text-left space-y-1 hover:opacity-80 transition-opacity"
              >
                <div className="flex justify-between text-sm">
                  <span className="truncate font-medium">{track.title}</span>
                  <span className="text-txt3 shrink-0 ml-2">{track.progressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-400 transition-all"
                    style={{ width: `${track.progressPct}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* -- Tracklist preview -- */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Tracklist</h2>

          {sortedTracks.length === 0 && (
            <p className="text-txt3 text-sm">Aucun morceau pour le moment.</p>
          )}

          <ul className="space-y-2">
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
                  <span className="truncate font-medium">{track.title}</span>
                  {artistNames && (
                    <span className="text-txt3 truncate ml-auto">{artistNames}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* -- Activity feed -- */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-lg font-semibold">Activité récente</h2>

          {recentActivity.length === 0 && (
            <p className="text-txt3 text-sm">Aucune activité pour le moment.</p>
          )}

          <ul className="space-y-3">
            {recentActivity.map((item) => {
              const user = users.find((u) => u.id === item.userId);
              const initials = user?.initials ?? '??';
              const bgColor = user?.color ?? 'hsl(0,0%,50%)';

              return (
                <li key={item.id} className="flex items-start gap-3 text-sm">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: bgColor }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{item.description}</p>
                    <p className="text-txt3 text-xs">{relativeTime(item.createdAt)}</p>
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
