import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import type { Role } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLES: Role[] = ['Rappeur', 'Beatmaker', 'Chanteur', 'Mixeur', 'DA', 'Multi'];

// ---------------------------------------------------------------------------
// Saved indicator component
// ---------------------------------------------------------------------------

function SavedIndicator({ show }: { show: boolean }) {
  return (
    <span
      className={`ml-3 text-green-400 text-sm transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      ✓ Sauvegardé
    </span>
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

  // Sync from store when currentUser changes
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

    dispatch({
      type: 'UPDATE_USER',
      payload: { id: user.id, password: newPassword },
    });
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

  // ---- Render ----

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Paramètres</h1>

      {/* ---------------------------------------------------------------- */}
      {/* Section 1 – Mon Profil                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Mon Profil</h2>

        {/* Photo upload */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: user.color }}
              >
                {user.initials}
              </div>
            )}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <span className="text-sm text-white/50">Cliquez pour changer la photo</span>
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Prénom</label>
          <input
            type="text"
            className="input-field w-full"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </div>

        {/* Pseudo */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Pseudo</label>
          <input
            type="text"
            className="input-field w-full"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Rôle</label>
          <select
            className="input-field w-full"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Bio</label>
          <textarea
            className="input-field w-full"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Save */}
        <div className="flex items-center">
          <button type="button" className="btn-gold" onClick={handleProfileSave}>
            Sauvegarder
          </button>
          <SavedIndicator show={profileSaved} />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Section 2 – Projet                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Projet</h2>

        {/* Mixtape name */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Nom de la mixtape</label>
          <input
            type="text"
            className="input-field w-full"
            value={mixtapeName}
            onChange={(e) => setMixtapeName(e.target.value)}
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Sous-titre</label>
          <input
            type="text"
            className="input-field w-full"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        {/* Target date */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Date cible</label>
          <input
            type="date"
            className="input-field w-full"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        {/* Save */}
        <div className="flex items-center">
          <button type="button" className="btn-gold" onClick={handleProjectSave}>
            Sauvegarder
          </button>
          <SavedIndicator show={projectSaved} />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Section 3 – Compte                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Compte</h2>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Email</label>
          <input
            type="email"
            className="input-field w-full bg-white/5 cursor-not-allowed"
            value={user.email}
            readOnly
          />
        </div>

        {/* Change password */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/80">Changer le mot de passe</h3>

          <input
            type="password"
            className="input-field w-full"
            placeholder="Ancien mot de passe"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            className="input-field w-full"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="input-field w-full"
            placeholder="Confirmer nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-400 text-sm">{passwordSuccess}</p>}

          <button type="button" className="btn-outline" onClick={handlePasswordChange}>
            Changer
          </button>
        </div>

        {/* Delete account */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white/80">Supprimer le compte</h3>
          <p className="text-red-400 text-sm">
            Attention : cette action est irréversible. Toutes vos données seront supprimées.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            onClick={handleDeleteAccount}
          >
            Supprimer mon compte
          </button>
        </div>
      </section>
    </div>
  );
}
