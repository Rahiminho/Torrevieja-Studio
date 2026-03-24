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
  if (score <= -3) return { label: 'Exécrable', color: '#E74C3C' };
  if (score <= -2) return { label: 'Exécrable', color: '#E74C3C' };
  if (score <= -1) return { label: 'Minable', color: '#E67E22' };
  if (score <= 0)  return { label: 'Minable', color: '#E67E22' };
  if (score <= 2)  return { label: 'Nabot', color: '#D4AC0D' };
  if (score <= 4)  return { label: 'Débutant', color: '#B8960C' };
  if (score <= 7)  return { label: 'Rajel', color: '#27AE60' };
  return { label: 'Vrai Rappeur', color: '#1E7E4A' };
}

function formatScore(score: number): string {
  if (score > 0) return `+${score}`;
  return String(score);
}

function scoreToProgress(score: number): number {
  const clamped = Math.max(-6, Math.min(10, score));
  return Math.round(((clamped + 6) / 16) * 100);
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

const ROLES: Role[] = ['Rappeur', 'Beatmaker', 'Chanteur', 'Mixeur', 'DA', 'Multi'];

// ---------------------------------------------------------------------------
// MemberCard
// ---------------------------------------------------------------------------

function MemberCard({ userId }: { userId: string }) {
  const { state, dispatch } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = state.users.find((u) => u.id === userId);
  if (!user) return null;

  const currentUserId = state.currentUser?.id;

  const userTracks = useMemo(
    () => state.tracks.filter((t) => t.artistIds.includes(userId)),
    [state.tracks, userId],
  );

  const trackScores = useMemo(() => {
    const map: Record<string, number> = {};
    for (const track of userTracks) {
      const trackVotes = state.votes.filter((v) => v.trackId === track.id);
      map[track.id] = trackVotes.reduce((sum, v) => sum + (v.direction === 'up' ? 1 : -1), 0);
    }
    return map;
  }, [userTracks, state.votes]);

  const totalScore = useMemo(() => {
    return Object.values(trackScores).reduce((sum, s) => sum + s, 0);
  }, [trackScores]);

  const reputation = getReputationLevel(totalScore);

  const myVotes = useMemo(() => {
    if (!currentUserId) return {} as Record<string, VoteDirection | null>;
    const map: Record<string, VoteDirection | null> = {};
    for (const track of userTracks) {
      const vote = state.votes.find((v) => v.trackId === track.id && v.userId === currentUserId);
      map[track.id] = vote?.direction ?? null;
    }
    return map;
  }, [userTracks, state.votes, currentUserId]);

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
    dispatch({ type: 'CAST_VOTE', payload: { trackId, userId: currentUserId, direction } });
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 12,
        padding: '20px 18px',
      }}
    >
      {/* Photo */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
          border: 'none',
          cursor: 'pointer',
          backgroundColor: user.photoUrl ? undefined : user.color,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          transition: 'transform 0.2s ease',
        }}
        title="Changer la photo"
      >
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.pseudo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          user.initials
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* Name */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--color-txt)',
            letterSpacing: '-0.01em',
          }}
        >
          {user.pseudo}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-txt3)', marginTop: 2 }}>{user.prenom}</p>
      </div>

      {/* Role pill */}
      <span className="pill pill-gold">{user.role}</span>

      {/* Bio */}
      {user.bio && (
        <p style={{ fontSize: '0.82rem', color: 'var(--color-txt2)', lineHeight: 1.5 }}>
          {user.bio}
        </p>
      )}

      {/* Reputation */}
      <div
        style={{
          width: '100%',
          paddingTop: 12,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 999,
              backgroundColor: reputation.color,
              color: '#fff',
            }}
          >
            {reputation.label}
          </span>
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: reputation.color,
            }}
          >
            {formatScore(totalScore)}
          </span>
        </div>
        {/* Score progress bar */}
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 999,
            background: 'rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              width: `${scoreToProgress(totalScore)}%`,
              backgroundColor: reputation.color,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Track votes */}
      {userTracks.length > 0 && (
        <div
          style={{
            width: '100%',
            paddingTop: 12,
            borderTop: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {userTracks.map((track) => {
            const score = trackScores[track.id] ?? 0;
            const myVote = myVotes[track.id] ?? null;

            return (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      color: 'var(--color-txt2)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {track.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      color: score > 0 ? '#27AE60' : score < 0 ? '#E74C3C' : 'var(--color-txt4)',
                    }}
                  >
                    {formatScore(score)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleVote(track.id, 'up')}
                    style={{
                      padding: '3px 6px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: currentUserId ? 'pointer' : 'default',
                      fontSize: '0.9rem',
                      background: myVote === 'up' ? 'rgba(39,174,96,0.22)' : 'rgba(0,0,0,0.04)',
                      boxShadow: myVote === 'up' ? 'inset 0 0 0 1px rgba(39,174,96,0.40)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote(track.id, 'down')}
                    style={{
                      padding: '3px 6px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: currentUserId ? 'pointer' : 'default',
                      fontSize: '0.9rem',
                      background: myVote === 'down' ? 'rgba(231,76,60,0.22)' : 'rgba(0,0,0,0.04)',
                      boxShadow: myVote === 'down' ? 'inset 0 0 0 1px rgba(231,76,60,0.40)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    👎
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

// ---------------------------------------------------------------------------
// CrewPage
// ---------------------------------------------------------------------------

export default function CrewPage() {
  const { state, dispatch } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--color-txt)',
              letterSpacing: '-0.02em',
            }}
          >
            Le Crew
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-txt3)', marginTop: 3 }}>
            {state.users.length} membre{state.users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          className="btn-gold"
          onClick={() => setModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
          Inviter
        </button>
      </div>

      {/* Members grid */}
      {state.users.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-txt3)' }}
        >
          <p style={{ fontSize: '0.9rem' }}>Aucun membre pour le moment.</p>
          <button
            type="button"
            className="btn-gold"
            style={{ marginTop: 16 }}
            onClick={() => setModalOpen(true)}
          >
            + Inviter le premier membre
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {state.users.map((user) => (
            <MemberCard key={user.id} userId={user.id} />
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title="Inviter un membre">
        <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}>
              Prénom
            </label>
            <input
              type="text"
              className="input-field"
              value={formPrenom}
              onChange={(e) => setFormPrenom(e.target.value)}
              placeholder="Prénom"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}>
              Pseudo *
            </label>
            <input
              type="text"
              className="input-field"
              value={formPseudo}
              onChange={(e) => setFormPseudo(e.target.value)}
              placeholder="Nom d'artiste"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}>
              Email *
            </label>
            <input
              type="email"
              className="input-field"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}>
              Rôle
            </label>
            <select
              className="input-field"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as Role)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}>
              Bio
            </label>
            <textarea
              className="input-field"
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              rows={3}
              placeholder="Quelques mots..."
              style={{ resize: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => { setModalOpen(false); resetForm(); }}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                color: 'var(--color-txt3)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
              }}
            >
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
