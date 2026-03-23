import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import SunLogo from './SunLogo';

interface NavItem {
  label: string;
  path: string;
  shortcut: string;
  icon: JSX.Element;
}

/* ------------------------------------------------------------------ */
/* Inline SVG icons                                                    */
/* ------------------------------------------------------------------ */

const IconHome = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconMusic = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const IconText = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconFolder = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconUsers = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconStar = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', shortcut: '\u23181', icon: IconHome },
  { label: 'Tracklist', path: '/tracklist', shortcut: '\u23182', icon: IconMusic },
  { label: 'Paroles', path: '/paroles', shortcut: '\u23183', icon: IconText },
  { label: 'Fichiers', path: '/fichiers', shortcut: '\u23184', icon: IconFolder },
  { label: 'Crew', path: '/crew', shortcut: '\u23185', icon: IconUsers },
  { label: 'Finale', path: '/finale', shortcut: '\u23186', icon: IconStar },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const user = state.currentUser;

  return (
    <aside
      className="glass"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 220,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        borderRight: '1px solid rgba(255,220,130,0.38)',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRadius: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '20px 18px 16px',
        }}
      >
        <SunLogo size={48} />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--color-txt)',
            lineHeight: 1.2,
          }}
        >
          Torrevieja
          <br />
          Studio
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isFinale = item.path === '/finale';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? 'var(--color-gold)'
                  : isFinale
                    ? 'var(--color-gold2)'
                    : 'var(--color-txt2)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(200,134,10,0.12), rgba(232,160,32,0.08))'
                  : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,134,10,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: 2,
                    background: 'linear-gradient(180deg, var(--color-gold), var(--color-gold2))',
                  }}
                />
              )}

              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>

              {/* Keyboard shortcut - visible on hover */}
              <span
                className="opacity-0 group-hover:opacity-100"
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--color-txt4)',
                  background: 'rgba(200,134,10,0.08)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  transition: 'opacity 0.2s',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {item.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div
          style={{
            padding: '12px 14px 16px',
            borderTop: '1px solid rgba(255,220,130,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: user.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {user.initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-txt)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.pseudo}
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: 'var(--color-txt4)',
              }}
            >
              {user.role}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            title="Déconnexion"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-txt4)',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-gold)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-txt4)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
