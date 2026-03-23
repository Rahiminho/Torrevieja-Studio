import { useState, useEffect, useCallback, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import ChatPanel from './ChatPanel';

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
        <ChatPanel isOpen={chatOpen} onClose={handleToggleChat} isMobile={true} />
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
          marginRight: chatOpen ? 320 : 0,
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

      <ChatPanel isOpen={chatOpen} onClose={handleToggleChat} isMobile={false} />
    </div>
  );
}
