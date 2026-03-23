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
};

const IconChat = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        borderBottom: '1px solid rgba(255,210,100,0.20)',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && <SunLogo size={28} />}
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-txt)',
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Chat toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={onToggleChat}
            title="Chat"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '0.625rem',
              border: 'none',
              cursor: 'pointer',
              color: chatOpen ? 'var(--color-gold)' : 'var(--color-txt3)',
              background: chatOpen
                ? 'rgba(200,134,10,0.12)'
                : 'transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!chatOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,134,10,0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (!chatOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
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
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: user.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {user.initials}
          </div>
        )}
      </div>
    </header>
  );
}
