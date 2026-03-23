import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({ isOpen, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* iOS-style backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(28, 20, 8, 0.18)',
          backdropFilter: 'blur(8px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(8px) saturate(1.5)',
        }}
      />
      {/* Modal card */}
      <div
        className={`relative glass-card ${width} w-full animate-scale-in max-h-[85vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow:
            '0 0.5px 0 0 rgba(255, 248, 220, 0.8) inset, 0 24px 80px rgba(28, 20, 8, 0.12), 0 8px 32px rgba(28, 20, 8, 0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              fontWeight: 600,
              color: 'var(--color-txt)',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(200,134,10,0.06)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-txt3)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              lineHeight: 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,134,10,0.12)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-txt)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,134,10,0.06)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-txt3)';
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
