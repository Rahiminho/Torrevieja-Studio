import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import Modal from '../components/Modal';
import FilePreview from '../components/FilePreview';
import { uploadFileToStorage } from '../lib/supabaseSync';
import type { FileItem } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type FileCategory = FileItem['category'];

const ACCEPTED_EXTENSIONS = [
  'wav', 'mp3', 'flac', 'aiff', 'ogg',
  'txt', 'pdf', 'docx',
  'zip',
  'png', 'jpg', 'jpeg',
];

const ACCEPT_STRING = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',');

function categorizeExtension(ext: string): FileCategory {
  const lower = ext.toLowerCase();
  if (['wav', 'mp3', 'flac', 'aiff', 'ogg'].includes(lower)) return 'audio';
  if (['txt', 'pdf', 'docx'].includes(lower)) return 'text';
  if (['png', 'jpg', 'jpeg'].includes(lower)) return 'image';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// ---------------------------------------------------------------------------
// Icons (inline SVG helpers)
// ---------------------------------------------------------------------------

function FolderIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function MusicNoteIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zm16.5-13.5h.008v.008h-.008V7.5zm0 0a1.125 1.125 0 10-2.25 0 1.125 1.125 0 002.25 0z" />
    </svg>
  );
}

function GenericFileIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25H6.75a2.25 2.25 0 00-2.25 2.25v15a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V10.5a2.25 2.25 0 00-.659-1.591l-5.091-5.021z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  );
}

function fileIcon(category: FileCategory) {
  switch (category) {
    case 'audio': return <MusicNoteIcon />;
    case 'text': return <DocumentIcon />;
    case 'image': return <ImageIcon />;
    default: return <GenericFileIcon />;
  }
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

type FilterTab = 'all' | FileCategory;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'audio', label: 'Audio' },
  { key: 'text', label: 'Texte' },
  { key: 'image', label: 'Images' },
  { key: 'other', label: 'Autres' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FilesPage() {
  const { state, dispatch } = useStore();
  const { currentUser, files, folders, users } = state;

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Breadcrumb path ----
  const breadcrumbPath: { id: string | null; name: string }[] = [];
  {
    let folderId = currentFolderId;
    while (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) break;
      breadcrumbPath.unshift({ id: folder.id, name: folder.name });
      folderId = folder.parentId;
    }
    breadcrumbPath.unshift({ id: null, name: 'Fichiers' });
  }

  // ---- Items in current directory ----
  const currentFolders = folders.filter((f) => f.parentId === currentFolderId);
  const currentFiles = files.filter((f) => f.folderId === currentFolderId);
  const filteredFiles =
    activeFilter === 'all' ? currentFiles : currentFiles.filter((f) => f.category === activeFilter);

  // ---- Helpers ----
  const getUserPseudo = (userId: string) => users.find((u) => u.id === userId)?.pseudo ?? 'Inconnu';

  const folderFileCount = (folderId: string) => files.filter((f) => f.folderId === folderId).length;

  // ---- Read file as base64 (fallback) ----
  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ---- File processing (Storage with base64 fallback) ----
  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (!currentUser) return;
      const arr = Array.from(fileList);
      if (arr.length === 0) return;

      setUploading(true);
      setUploadProgress(0);

      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        const ext = getExtension(file.name);
        const category = categorizeExtension(ext);
        const storagePath = `${currentUser.id}/${Date.now()}-${file.name}`;

        let fileUrl: string;
        try {
          fileUrl = await uploadFileToStorage(file, storagePath);
        } catch {
          // Fallback: read as base64 data URL
          fileUrl = await readFileAsDataUrl(file);
        }

        setUploadProgress(((i + 1) / arr.length) * 100);

        dispatch({
          type: 'ADD_FILE',
          payload: {
            name: file.name,
            category,
            extension: ext,
            sizeBytes: file.size,
            authorId: currentUser.id,
            folderId: currentFolderId,
            dataUrl: fileUrl,
          },
        });
      }

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
    },
    [currentUser, currentFolderId, dispatch],
  );

  // ---- Drag & drop handlers ----
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        e.target.value = '';
      }
    },
    [processFiles],
  );

  // ---- New folder ----
  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !currentUser) return;
    dispatch({
      type: 'ADD_FOLDER',
      payload: {
        name: newFolderName.trim(),
        parentId: currentFolderId,
        createdBy: currentUser.id,
      },
    });
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  // ---- Delete file ----
  const handleDeleteFile = (fileId: string) => {
    if (!currentUser) return;
    dispatch({ type: 'DELETE_FILE', payload: { id: fileId, userId: currentUser.id } });
  };

  // ---- Open file (preview modal) ----
  const handleOpenFile = (file: FileItem) => {
    setPreviewFile(file);
  };

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-txt">
          Fichiers
        </h1>
        <button
          onClick={() => setShowNewFolderModal(true)}
          className="btn-outline flex items-center gap-2 text-sm"
        >
          <span className="text-lg leading-none">+</span> Nouveau dossier
        </button>
      </div>

      {/* ---- Upload zone ---- */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          dragging
            ? 'border-gold bg-gold/10'
            : 'border-gold/40 hover:border-gold hover:bg-gold/5'
        }`}
      >
        <UploadIcon />
        <p className="text-txt2 text-sm text-center">
          Glissez-déposez vos fichiers ici ou <span className="text-gold font-medium">cliquez pour parcourir</span>
        </p>
        <p className="text-txt3 text-xs">
          WAV, MP3, FLAC, AIFF, OGG, TXT, PDF, ZIP, PNG, JPG, DOCX
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_STRING}
          onChange={handleFileInputChange}
          className="hidden"
        />
        {/* Upload progress bar */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-surface2 rounded-b-xl overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-200 ease-out rounded-b-xl"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* ---- Breadcrumb ---- */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {currentFolderId && (
          <button
            onClick={() => {
              const currentFolder = folders.find((f) => f.id === currentFolderId);
              setCurrentFolderId(currentFolder?.parentId ?? null);
            }}
            className="text-gold hover:underline flex items-center gap-1 mr-2"
          >
            &larr; Retour
          </button>
        )}
        {breadcrumbPath.map((crumb, idx) => (
          <React.Fragment key={crumb.id ?? 'root'}>
            {idx > 0 && <span className="text-txt3">/</span>}
            {idx < breadcrumbPath.length - 1 ? (
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className="text-gold hover:underline"
              >
                {crumb.name}
              </button>
            ) : (
              <span className="text-txt font-medium">{crumb.name}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ---- Filter tabs ---- */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? 'bg-gold text-white'
                : 'bg-surface2 text-txt2 hover:bg-surface3'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- Folder grid ---- */}
      {currentFolders.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-txt3 mb-3 font-semibold">Dossiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolderId(folder.id)}
                className="glass-card flex items-center gap-3 p-4 text-left hover:ring-1 hover:ring-gold/40 transition-all"
              >
                <span className="text-gold">
                  <FolderIcon />
                </span>
                <div className="min-w-0">
                  <p className="text-txt font-medium truncate">{folder.name}</p>
                  <p className="text-txt3 text-xs">
                    {folderFileCount(folder.id)} fichier{folderFileCount(folder.id) !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- File grid ---- */}
      {filteredFiles.length > 0 ? (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-txt3 mb-3 font-semibold">Fichiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="glass-card p-4 flex flex-col gap-2 group">
                <div className="flex items-start justify-between">
                  <span className="text-gold">{fileIcon(file.category)}</span>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-txt3 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Supprimer"
                  >
                    <TrashIcon />
                  </button>
                  <button
                    onClick={() => handleOpenFile(file)}
                    className="text-txt3 hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Ouvrir"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <p className="text-txt text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-txt3 text-xs truncate">{getUserPseudo(file.authorId)}</p>
                <div className="flex items-center justify-between text-xs text-txt3 mt-auto">
                  <span>{formatFileSize(file.sizeBytes)}</span>
                  <span>{formatDate(file.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        currentFolders.length === 0 && (
          <div className="text-center py-16 text-txt3">
            <p className="text-lg mb-1">Aucun fichier</p>
            <p className="text-sm">Uploadez des fichiers ou créez un dossier pour commencer.</p>
          </div>
        )
      )}

      {/* ---- File preview modal ---- */}
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* ---- New folder modal ---- */}
      <Modal isOpen={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} title="Nouveau dossier">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom du dossier"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            className="w-full px-3 py-2 rounded-lg bg-surface2 border border-[rgba(0,0,0,0.06)] text-txt placeholder:text-txt3 focus:outline-none focus:ring-2 focus:ring-gold/50"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewFolderModal(false)}
              className="px-4 py-2 text-sm text-txt2 hover:text-txt transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="btn-gold text-sm disabled:opacity-40"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
