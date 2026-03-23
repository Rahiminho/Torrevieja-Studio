import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../store';
import Modal from '../components/Modal';
import type { Role, VoteDirection } from '../types';

// ---------------------------------------------------------------------------
// Reputation helpers
// ---------------------------------------------------------------------------

interface ReputationLevel {
  label: string;
  color: string;
}

function getReputationLevel(score: number): ReputationLevel {
  if (score <= -4) return { label: 'Rappeur de merde', color: '#C0392B' };
  if (score <= -2) return { label: 'Exécrable', color: '#E74C3C' };
  if (score <= 0) return { label: 'Minable', color: '#E67E22' };
  if (score <= 2) return { label: 'Nabot', color: '#D4AC0D' };
  if (score <= 4) return { label: 'Débutant', color: '#B8960C' };
  if (score <= 7) return { label: 'Rajel', color: '#27AE60' };
  return { label: 'Vrai Rappeur', color: '#1E7E4A' };
}

function formatScore(score: number): string {
  if (score > 0) return `+${score}`;
  return String(score);
}

// Progress bar: map score to 0-100 range. We'll use -6..+10 as bounds.
function scoreToProgress(score: number): number {
  const clamped = Math.max(-6, Math.min(10, score));
  return Math.round(((clamped + 6) / 16) * 100);
}

// ---------------------------------------------------------------------------
// Roles for the dropdown
// ---------------------------------------------------------------------------

const ROLES: Role[] = ['Rappeur', 'Beatmaker', 'Chanteur', 'Mixeur', 'DA', 'Multi'];

// ---------------------------------------------------------------------------
// CrewPage
// ---------------------------------------------------------------------------

export default function CrewPage() {
  const { state, dispatch } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  // Add member form state
  const [formPrenom, setFormPrenom] = useState('');
  const [formPseudo, setFormPseudo] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>('Rappeur');
  const [formBio, setFormBio] = useState('');

  const resetForm = () => {
    setFormPrenom('');
    setFormPseudo('');
    setFormEmail('');
    setFormRole('Rappeur');
    setFormBio('');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPseudo.trim() || !formEmail.trim()) return;
    dispatch({
      type: 'ADD_MEMBER',
      payload: {
        prenom: formPrenom.trim(),
        pseudo: formPseudo.trim(),
        email: formEmail.trim(),
        password: 'default123',
        role: formRole,
        bio: formBio.trim() || undefined,
      },
    });
    resetForm();
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-txt">Le Crew</h1>
        <button className="btn-gold" onClick={() => setModalOpen(true)}>
          + Membre
        </button>
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.users.map((user) => (
          <MemberCard key={user.id} userId={user.id} />
        ))}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un membre">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm text-txt2 mb-1">Prénom</label>
            <input
              type="text"
              value={formPrenom}
              onChange={(e) => setFormPrenom(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-txt placeholder:text-txt3 focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="Prénom"
            />
          </div>
          <div>
            <label className="block text-sm text-txt2 mb-1">Pseudo *</label>
            <input
              type="text"
              value={formPseudo}
              onChange={(e) => setFormPseudo(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-txt placeholder:text-txt3 focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="Pseudo"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-txt2 mb-1">Email *</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-txt placeholder:text-txt3 focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-txt2 mb-1">Rôle</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as Role)}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-txt focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-txt2 mb-1">Bio</label>
            <textarea
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-txt placeholder:text-txt3 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
              placeholder="Quelques mots..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-txt3 hover:text-txt transition-colors">
              Annuler
            </button>
            <button type="submit" className="btn-gold">
              Ajouter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MemberCard (extracted for clarity)
// ---------------------------------------------------------------------------

function MemberCard({ userId }: { userId: string }) {
  const { state, dispatch } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = state.users.find((u) => u.id === userId);
  if (!user) return null;

  const currentUserId = state.currentUser?.id;

  // Tracks where this user is an artist
  const userTracks = useMemo(
    () => state.tracks.filter((t) => t.artistIds.includes(userId)),
    [state.tracks, userId],
  );

  // Vote score per track
  const trackScores = useMemo(() => {
    const map: Record<string, number> = {};
    for (const track of userTracks) {
      const trackVotes = state.votes.filter((v) => v.trackId === track.id);
      map[track.id] = trackVotes.reduce((sum, v) => sum + (v.direction === 'up' ? 1 : -1), 0);
    }
    return map;
  }, [userTracks, state.votes]);

  // Total reputation score
  const totalScore = useMemo(() => {
    let sum = 0;
    for (const track of userTracks) {
      const trackVotes = state.votes.filter((v) => v.trackId === track.id);
      sum += trackVotes.reduce((s, v) => s + (v.direction === 'up' ? 1 : -1), 0);
    }
    return sum;
  }, [userTracks, state.votes]);

  const reputation = getReputationLevel(totalScore);

  // Current user's vote per track
  const myVotes = useMemo(() => {
    if (!currentUserId) return {};
    const map: Record<string, VoteDirection | null> = {};
    for (const track of userTracks) {
      const vote = state.votes.find((v) => v.trackId === track.id && v.userId === currentUserId);
      map[track.id] = vote?.direction ?? null;
    }
    return map;
  }, [userTracks, state.votes, currentUserId]);

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      dispatch({
        type: 'UPDATE_USER',
        payload: { id: userId, photoUrl: reader.result as string },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleVote = (trackId: string, direction: VoteDirection) => {
    if (!currentUserId) return;
    dispatch({
      type: 'CAST_VOTE',
      payload: { trackId, userId: currentUserId, direction },
    });
  };

  return (
    <div className="glass-card flex flex-col items-center text-center space-y-3">
      {/* Photo area */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold text-white shrink-0 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-transform hover:scale-105"
        style={{ backgroundColor: user.photoUrl ? undefined : user.color }}
        title="Changer la photo"
      >
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.pseudo} className="w-full h-full object-cover" />
        ) : (
          user.initials
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Pseudo */}
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-txt">{user.pseudo}</h3>

      {/* Prénom */}
      <p className="text-sm text-txt3">{user.prenom}</p>

      {/* Role pill */}
      <span className="pill pill-gold">{user.role}</span>

      {/* Bio */}
      {user.bio && <p className="text-sm text-txt2 leading-relaxed">{user.bio}</p>}

      {/* Reputation */}
      <div className="w-full space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: reputation.color, color: '#fff' }}
          >
            {reputation.label}
          </span>
          <span className="text-sm font-mono font-bold text-txt" style={{ color: reputation.color }}>
            {formatScore(totalScore)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${scoreToProgress(totalScore)}%`,
              backgroundColor: reputation.color,
            }}
          />
        </div>
      </div>

      {/* Track scores */}
      {userTracks.length > 0 && (
        <div className="w-full space-y-2 pt-2 border-t border-white/10">
          {userTracks.map((track) => {
            const score = trackScores[track.id] ?? 0;
            const myVote = myVotes[track.id] ?? null;

            return (
              <div key={track.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-txt2 truncate">{track.title}</span>
                  <span
                    className="font-mono text-xs font-bold shrink-0"
                    style={{ color: score > 0 ? '#27AE60' : score < 0 ? '#E74C3C' : undefined }}
                  >
                    {formatScore(score)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleVote(track.id, 'up')}
                    className={`px-1.5 py-0.5 rounded text-base transition-colors ${
                      myVote === 'up'
                        ? 'bg-green-500/30 ring-1 ring-green-400'
                        : 'hover:bg-white/10'
                    }`}
                    title="Upvote"
                  >
                    {'👍'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote(track.id, 'down')}
                    className={`px-1.5 py-0.5 rounded text-base transition-colors ${
                      myVote === 'down'
                        ? 'bg-red-500/30 ring-1 ring-red-400'
                        : 'hover:bg-white/10'
                    }`}
                    title="Downvote"
                  >
                    {'👎'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
