import { useLocation } from 'react-router-dom';
import { useStore } from '../store';
import SunLogo from './SunLogo';

interface TopbarProps {
  isMobile: boolean;
  chatOpen: boolean;
  onToggleChat: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tracklist': 'Tracklist',
  '/paroles': 'Paroles',
  '/fichiers': 'Fichiers',
  '/crew': 'Crew',
  '/finale': 'Finale',
  '/settings': 'Réglages',
};

const IconChat = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function Topbar({ isMobile, chatOpen, onToggleChat }: TopbarProps) {
  const location = useLocation();
  const { state } = useStore();
  const user = state.currentUser;
  const pageTitle = pageTitles[location.pathname] || 'Torrevieja Studio';

  return (
    <header
      className="glass-medium"
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        borderBottom: '0.5px solid rgba(255,140,0,0.12)',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isMobile && <SunLogo size={26} />}
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? '0.95rem' : '1rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-txt)',
            letterSpacing: '-0.02em',
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Chat toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={onToggleChat}
            title="Chat"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              color: chatOpen ? 'var(--color-gold)' : 'var(--color-txt3)',
              background: chatOpen
                ? 'rgba(255,122,0,0.10)'
                : 'rgba(255,122,0,0.04)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!chatOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,122,0,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-gold)';
              }
            }}
            onMouseLeave={(e) => {
              if (!chatOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,122,0,0.04)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-txt3)';
              }
            }}
          >
            {IconChat}
          </button>
        )}

        {/* User avatar */}
        {user && (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: user.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            {user.initials}
          </div>
        )}
      </div>
    </header>
  );
}
