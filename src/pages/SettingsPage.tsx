import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import type { Role } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLES: Role[] = ['Rappeur', 'Beatmaker', 'Chanteur', 'Mixeur', 'DA', 'Multi'];

// ---------------------------------------------------------------------------
// Saved indicator
// ---------------------------------------------------------------------------

function SavedIndicator({ show }: { show: boolean }) {
  return (
    <span
      style={{
        marginLeft: 12,
        fontSize: '0.82rem',
        color: '#16a34a',
        fontWeight: 600,
        transition: 'opacity 0.4s ease',
        opacity: show ? 1 : 0,
      }}
    >
      ✓ Sauvegardé
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--color-txt)',
        letterSpacing: '-0.01em',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        fontFamily: 'var(--font-display)',
      }}
    >
      {title}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Label helper
// ---------------------------------------------------------------------------

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontSize: '0.8rem',
        color: 'var(--color-txt2)',
        marginBottom: 5,
        fontWeight: 500,
      }}
    >
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// SettingsPage
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const user = state.currentUser;

  // ---- Profile state ----
  const [prenom, setPrenom] = useState(user?.prenom ?? '');
  const [pseudo, setPseudo] = useState(user?.pseudo ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'Rappeur');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? '');
  const [profileSaved, setProfileSaved] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ---- Project state ----
  const [mixtapeName, setMixtapeName] = useState(state.projectSettings.mixtapeName);
  const [subtitle, setSubtitle] = useState(state.projectSettings.subtitle);
  const [targetDate, setTargetDate] = useState(state.projectSettings.targetDate);
  const [projectSaved, setProjectSaved] = useState(false);

  // ---- Account state ----
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Sync from store
  useEffect(() => {
    if (user) {
      setPrenom(user.prenom);
      setPseudo(user.pseudo);
      setRole(user.role);
      setBio(user.bio);
      setPhotoUrl(user.photoUrl);
    }
  }, [user]);

  useEffect(() => {
    setMixtapeName(state.projectSettings.mixtapeName);
    setSubtitle(state.projectSettings.subtitle);
    setTargetDate(state.projectSettings.targetDate);
  }, [state.projectSettings]);

  if (!user) return null;

  // ---- Handlers ----

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = () => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { id: user.id, prenom, pseudo, role, bio, photoUrl },
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleProjectSave = () => {
    dispatch({
      type: 'UPDATE_PROJECT_SETTINGS',
      payload: { mixtapeName, subtitle, targetDate },
    });
    setProjectSaved(true);
    setTimeout(() => setProjectSaved(false), 2000);
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (oldPassword !== user.password) {
      setPasswordError('Ancien mot de passe incorrect.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    dispatch({ type: 'UPDATE_USER', payload: { id: user.id, password: newPassword } });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess('Mot de passe modifié avec succès.');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
    );
    if (!confirmed) return;
    dispatch({ type: 'DELETE_USER', payload: { id: user.id } });
    dispatch({ type: 'LOGOUT' });
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 560,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
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
          Paramètres
        </h1>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Section 1 – Mon Profil                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="glass-card" style={{ padding: '22px 24px' }}>
        <SectionHeader title="Mon Profil" />
        <div style={sectionStyle}>

          {/* Photo upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(232,160,32,0.25)',
                flexShrink: 0,
                cursor: 'pointer',
                background: 'none',
                padding: 0,
                transition: 'opacity 0.2s',
              }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#fff',
                    backgroundColor: user.color,
                  }}
                >
                  {user.initials}
                </div>
              )}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-txt)' }}>{user.pseudo}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-txt3)', marginTop: 2 }}>
                Cliquez pour changer la photo
              </p>
            </div>
          </div>

          {/* Prénom */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-prenom">Prénom</FieldLabel>
            <input
              id="s-prenom"
              type="text"
              className="input-field"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>

          {/* Pseudo */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-pseudo">Pseudo / Nom d&apos;artiste</FieldLabel>
            <input
              id="s-pseudo"
              type="text"
              className="input-field"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
            />
          </div>

          {/* Rôle */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-role">Rôle</FieldLabel>
            <select
              id="s-role"
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-bio">Bio</FieldLabel>
            <textarea
              id="s-bio"
              className="input-field"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button type="button" className="btn-gold" onClick={handleProfileSave}>
              Sauvegarder
            </button>
            <SavedIndicator show={profileSaved} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Section 2 – Projet                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="glass-card" style={{ padding: '22px 24px' }}>
        <SectionHeader title="Projet" />
        <div style={sectionStyle}>

          {/* Nom mixtape */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-mixtape">Nom de la mixtape</FieldLabel>
            <input
              id="s-mixtape"
              type="text"
              className="input-field"
              value={mixtapeName}
              onChange={(e) => setMixtapeName(e.target.value)}
            />
          </div>

          {/* Subtitle */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-subtitle">Sous-titre</FieldLabel>
            <input
              id="s-subtitle"
              type="text"
              className="input-field"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          {/* Target date */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-date">Date cible</FieldLabel>
            <input
              id="s-date"
              type="date"
              className="input-field"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button type="button" className="btn-gold" onClick={handleProjectSave}>
              Sauvegarder
            </button>
            <SavedIndicator show={projectSaved} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Section 3 – Compte                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="glass-card" style={{ padding: '22px 24px' }}>
        <SectionHeader title="Compte" />
        <div style={sectionStyle}>

          {/* Email (readonly) */}
          <div style={fieldStyle}>
            <FieldLabel htmlFor="s-email">Email</FieldLabel>
            <input
              id="s-email"
              type="email"
              className="input-field"
              value={user.email}
              readOnly
              style={{
                background: 'rgba(0,0,0,0.03)',
                color: 'var(--color-txt3)',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Change password */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              paddingTop: 4,
            }}
          >
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-txt2)' }}>
              Changer le mot de passe
            </p>

            <input
              type="password"
              className="input-field"
              placeholder="Ancien mot de passe"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {passwordError && (
              <p style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 500 }}>
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 500 }}>
                {passwordSuccess}
              </p>
            )}

            <button
              type="button"
              className="btn-outline"
              onClick={handlePasswordChange}
              style={{ alignSelf: 'flex-start' }}
            >
              Changer
            </button>
          </div>

          {/* Delete account – danger zone */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              paddingTop: 16,
              borderTop: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>
              Zone dangereuse
            </p>
            <p style={{ fontSize: '0.82rem', color: '#ef4444' }}>
              La suppression du compte est irréversible. Toutes vos données seront perdues.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              style={{
                alignSelf: 'flex-start',
                padding: '8px 16px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.30)',
                color: '#dc2626',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s',
              }}
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
