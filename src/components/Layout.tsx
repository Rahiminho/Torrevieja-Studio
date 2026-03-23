import { useState, useEffect, useCallback, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

const MOBILE_BREAKPOINT = 768;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleChat = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, []);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar isMobile={true} chatOpen={chatOpen} onToggleChat={handleToggleChat} />

        <main
          style={{
            flex: 1,
            padding: '12px 16px 88px',
            overflowY: 'auto',
          }}
          className="animate-fade-in"
        >
          {children}
        </main>

        <BottomNav />
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          marginLeft: 232,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-right 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          marginRight: chatOpen ? 360 : 0,
        }}
      >
        <Topbar isMobile={false} chatOpen={chatOpen} onToggleChat={handleToggleChat} />

        <main
          style={{
            flex: 1,
            padding: '24px 32px',
            overflowY: 'auto',
          }}
          className="animate-fade-in"
        >
          {children}
        </main>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div
          className="glass"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 360,
            height: '100vh',
            zIndex: 95,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '0.5px solid rgba(255,140,0,0.18)',
            borderRadius: 0,
            borderTop: 'none',
            borderBottom: 'none',
            borderRight: 'none',
            animation: 'fade-in 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
          }}
        >
          {/* Chat header */}
          <div
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              borderBottom: '0.5px solid rgba(255,140,0,0.12)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--color-txt)',
                letterSpacing: '-0.01em',
              }}
            >
              Chat
            </span>
            <button
              onClick={handleToggleChat}
              style={{
                background: 'rgba(255,122,0,0.06)',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-txt3)',
                padding: 6,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,122,0,0.12)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-gold)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,122,0,0.06)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-txt3)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Chat body placeholder */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-txt4)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-body)',
              padding: 24,
              textAlign: 'center',
            }}
          >
            Chat bientot disponible...
          </div>
        </div>
      )}
    </div>
  );
}
