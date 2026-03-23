import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export default function Modal({ isOpen, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className={`relative glass-card ${width} w-full animate-scale-in max-h-[85vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-txt">{title}</h2>
          <button onClick={onClose} className="text-txt3 hover:text-txt transition-colors text-xl leading-none p-1">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
