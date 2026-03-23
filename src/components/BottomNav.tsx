import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavTab {
  label: string;
  path: string;
  icon: ReactNode;
  isCenter?: boolean;
}

const IconHome = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconMusic = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const IconText = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconFolder = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconUsers = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconStar = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const tabs: NavTab[] = [
  { label: 'Home', path: '/dashboard', icon: IconHome },
  { label: 'Tracks', path: '/tracklist', icon: IconMusic },
  { label: 'Paroles', path: '/paroles', icon: IconText },
  { label: 'Finale', path: '/finale', icon: IconStar, isCenter: true },
  { label: 'Fichiers', path: '/fichiers', icon: IconFolder },
  { label: 'Crew', path: '/crew', icon: IconUsers },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="glass"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        height: 68,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderTop: '0.5px solid rgba(255,140,0,0.15)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;

        if (tab.isCenter) {
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(180deg, var(--color-gold2), var(--color-gold))',
                color: '#fff',
                width: 50,
                height: 50,
                borderRadius: '50%',
                marginTop: -12,
                boxShadow: '0 2px 16px rgba(255,122,0,0.38), 0 0.5px 0 rgba(255,210,100,0.5) inset',
                transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              {tab.icon}
            </button>
          );
        }

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '8px 0',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isActive ? 'var(--color-gold)' : 'var(--color-txt4)',
              transition: 'color 0.2s',
              minWidth: 48,
            }}
          >
            <span style={{ opacity: isActive ? 1 : 0.7 }}>
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.01em',
              }}
            >
              {tab.label}
            </span>
            {/* iOS-style active dot */}
            {isActive && (
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--color-gold)',
                  position: 'absolute',
                  bottom: 6,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
