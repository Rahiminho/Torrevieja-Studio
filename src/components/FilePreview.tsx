import React, { useState } from 'react';
import type { FileItem } from '../types';

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    switch (file.category) {
      case 'audio':
        return (
          <div className="space-y-4">
            <div className="glass-card h-48 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <div className="text-sm text-txt2">{file.name}</div>
                <div className="text-xs text-txt3 mt-1">{file.extension.toUpperCase()}</div>
              </div>
            </div>

            <audio ref={audioRef} src={file.dataUrl} onEnded={() => setIsPlaying(false)} />

            <div className="glass-card p-4 flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold2 flex items-center justify-center text-white hover:shadow-lg transition-all"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <div className="text-sm font-medium text-txt">{file.name}</div>
                <div className="text-xs text-txt3">Cliquez pour jouer</div>
              </div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-full text-sm font-medium text-gold bg-white/40 hover:bg-white/60 transition-colors"
              >
                Télécharger
              </button>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div className="glass-card overflow-hidden">
              <img
                src={file.dataUrl}
                alt={file.name}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex items-center justify-between glass-card px-4 py-3">
              <div>
                <div className="text-sm font-medium text-txt">{file.name}</div>
                <div className="text-xs text-txt3">{(file.sizeBytes / 1024).toFixed(1)} KB</div>
              </div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-full text-sm font-medium text-gold bg-white/40 hover:bg-white/60 transition-colors"
              >
                Télécharger
              </button>
            </div>
          </div>
        );

      case 'text':
        if (file.extension === 'pdf') {
          return (
            <div className="space-y-4">
              <div className="glass-card p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="text-sm text-txt2 mb-2">{file.name}</div>
                <div className="text-xs text-txt3 mb-4">Document PDF</div>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={file.dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn inline-block"
                  >
                    Ouvrir le PDF
                  </a>
                  <button
                    onClick={handleDownload}
                    className="btn-outline inline-block text-sm"
                  >
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="glass-card p-6 text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div className="text-sm text-txt2 mb-2">{file.name}</div>
              <div className="text-xs text-txt3 mb-4">Fichier texte</div>
              <button
                onClick={handleDownload}
                className="btn inline-block"
              >
                Télécharger
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="glass-card p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-3 text-txt3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm text-txt2 mb-2">{file.name}</div>
            <div className="text-xs text-txt3 mb-4">
              {file.extension.toUpperCase()} · {(file.sizeBytes / 1024).toFixed(1)} KB
            </div>
            <button
              onClick={handleDownload}
              className="btn inline-block"
            >
              Télécharger le fichier
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-txt font-[family-name:var(--font-display)]">
              Prévisualisation
            </h3>
            <p className="text-xs text-txt3 mt-1">{file.category.toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-txt2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {renderPreview()}
      </div>
    </div>
  );
}
