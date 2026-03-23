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
            padding: '16px 16px 80px',
            overflowY: 'auto',
          }}
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
          marginLeft: 220,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-right 0.3s ease',
          marginRight: chatOpen ? 360 : 0,
        }}
      >
        <Topbar isMobile={false} chatOpen={chatOpen} onToggleChat={handleToggleChat} />

        <main
          style={{
            flex: 1,
            padding: '24px 28px',
            overflowY: 'auto',
          }}
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
            borderLeft: '1px solid rgba(255,220,130,0.38)',
            borderRadius: 0,
            borderTop: 'none',
            borderBottom: 'none',
            borderRight: 'none',
            animation: 'fade-in 0.2s ease forwards',
          }}
        >
          {/* Chat header */}
          <div
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              borderBottom: '1px solid rgba(255,210,100,0.20)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--color-txt)',
              }}
            >
              Chat
            </span>
            <button
              onClick={handleToggleChat}
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
            ChatPanel coming soon...
          </div>
        </div>
      )}
    </div>
  );
}
