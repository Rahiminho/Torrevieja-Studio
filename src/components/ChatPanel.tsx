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
// Component
// ---------------------------------------------------------------------------

export default function ChatPanel({ isOpen, onClose, isMobile }: ChatPanelProps) {
  const { state, dispatch } = useStore();
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('général');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages by active channel
  const channelMessages = state.messages.filter((m) => m.channel === activeChannel);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  // Look up a user by id
  function getUser(userId: string) {
    return state.users.find((u) => u.id === userId);
  }

  // Send message handler
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

  // ---- Mobile: full-screen overlay ----
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col glass transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Chat</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Channel tabs */}
        <div className="flex overflow-x-auto gap-1 px-4 py-2 border-b border-white/10 scrollbar-hide">
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                activeChannel === ch
                  ? 'text-gold border-b-2 border-gold font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              # {ch}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {channelMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">Pas encore de messages</p>
            </div>
          ) : (
            channelMessages.map((msg) => {
              const author = getUser(msg.authorId);
              return (
                <div key={msg.id} className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ backgroundColor: author?.color ?? '#666' }}
                  >
                    {author?.initials ?? '??'}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold" style={{ color: author?.color ?? '#ccc' }}>
                        {author?.pseudo ?? 'Inconnu'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {relativeTime(msg.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 px-3 py-2 rounded-lg glass-medium text-sm text-gray-200 break-words">
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
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Écrire un message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gold/20 hover:bg-gold/30 transition-colors text-gold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Desktop: side panel ----
  return (
    <div
      className={`fixed top-[var(--topbar-height,56px)] right-0 bottom-0 w-[320px] z-40 glass flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Chat</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
      </div>

      {/* Channel tabs */}
      <div className="flex overflow-x-auto gap-1 px-4 py-2 border-b border-white/10 scrollbar-hide">
        {CHANNELS.map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch)}
            className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
              activeChannel === ch
                ? 'text-gold border-b-2 border-gold font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            # {ch}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {channelMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">Pas encore de messages</p>
          </div>
        ) : (
          channelMessages.map((msg) => {
            const author = getUser(msg.authorId);
            return (
              <div key={msg.id} className="flex items-start gap-2.5">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ backgroundColor: author?.color ?? '#666' }}
                >
                  {author?.initials ?? '??'}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold" style={{ color: author?.color ?? '#ccc' }}>
                      {author?.pseudo ?? 'Inconnu'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {relativeTime(msg.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 px-3 py-2 rounded-lg glass-medium text-sm text-gray-200 break-words">
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
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Écrire un message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gold/20 hover:bg-gold/30 transition-colors text-gold"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
