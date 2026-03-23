import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import type { ChatChannel } from '../types';

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'à l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHANNELS: ChatChannel[] = ['général', 'prods', 'paroles', 'mix', 'random'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

// ---------------------------------------------------------------------------
// Shared inner content
// ---------------------------------------------------------------------------

interface ChatContentProps {
  isMobile: boolean;
  onClose: () => void;
}

function ChatContent({ isMobile, onClose }: ChatContentProps) {
  const { state, dispatch } = useStore();
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('général');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelMessages = state.messages.filter((m) => m.channel === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, activeChannel]);

  function getUser(userId: string) {
    return state.users.find((u) => u.id === userId);
  }

  function handleSend() {
    const content = inputValue.trim();
    if (!content || !state.currentUser) return;
    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        channel: activeChannel,
        authorId: state.currentUser.id,
        content,
      },
    });
    setInputValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(200,134,10,0.14)',
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-txt)',
            letterSpacing: '-0.01em',
            fontFamily: 'var(--font-display)',
          }}
        >
          Chat Studio
        </h2>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(200,134,10,0.08)',
              color: 'var(--color-txt3)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* Channel tabs */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          padding: '8px 12px',
          borderBottom: '1px solid rgba(200,134,10,0.12)',
          flexShrink: 0,
        }}
      >
        {CHANNELS.map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch)}
            style={{
              flexShrink: 0,
              padding: '5px 10px',
              fontSize: '0.78rem',
              fontWeight: activeChannel === ch ? 700 : 500,
              fontFamily: 'var(--font-body)',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              background: activeChannel === ch ? 'rgba(200,134,10,0.12)' : 'transparent',
              color: activeChannel === ch ? 'var(--color-gold)' : 'var(--color-txt3)',
              borderBottom: activeChannel === ch ? '2px solid var(--color-gold)' : '2px solid transparent',
            }}
          >
            # {ch}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {channelMessages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: 0.5,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-txt3)" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-txt3)' }}>Aucun message dans # {activeChannel}</p>
          </div>
        ) : (
          channelMessages.map((msg) => {
            const author = getUser(msg.authorId);
            const isCurrentUser = state.currentUser?.id === msg.authorId;
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: '#fff',
                    backgroundColor: author?.color ?? 'hsl(0,0%,60%)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  }}
                >
                  {author?.initials ?? '??'}
                </div>
                {/* Bubble */}
                <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 6,
                      flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: author?.color ?? 'var(--color-txt2)',
                      }}
                    >
                      {author?.pseudo ?? 'Inconnu'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--color-txt4)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {relativeTime(msg.createdAt)}
                    </span>
                  </div>
                  <div
                    className="glass-medium"
                    style={{
                      padding: '8px 12px',
                      borderRadius: isCurrentUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--color-txt)',
                      wordBreak: 'break-word',
                      lineHeight: 1.45,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid rgba(200,134,10,0.14)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            className="input-field"
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
            placeholder={state.currentUser ? `Message # ${activeChannel}...` : 'Connectez-vous pour chatter'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!state.currentUser}
          />
          <button
            onClick={handleSend}
            disabled={!state.currentUser || !inputValue.trim()}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              border: 'none',
              background: inputValue.trim() ? 'var(--color-gold)' : 'rgba(200,134,10,0.12)',
              color: inputValue.trim() ? '#fff' : 'var(--color-txt4)',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ChatPanel({ isOpen, onClose, isMobile }: ChatPanelProps) {
  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0.96)',
          pointerEvents: isOpen ? 'all' : 'none',
          background: 'rgba(253,246,232,0.88)',
          backdropFilter: 'blur(32px) saturate(1.7)',
          borderTop: '1px solid rgba(200,134,10,0.18)',
        }}
      >
        <ChatContent isMobile onClose={onClose} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--topbar-height, 56px)',
        right: 0,
        bottom: 0,
        width: 320,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(253,246,232,0.82)',
        backdropFilter: 'blur(32px) saturate(1.7)',
        borderLeft: '1px solid rgba(200,134,10,0.18)',
        boxShadow: '-4px 0 32px rgba(180,100,10,0.08)',
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      <ChatContent isMobile={false} onClose={onClose} />
    </div>
  );
}
