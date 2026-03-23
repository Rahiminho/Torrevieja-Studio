import { useState } from 'react';
import { useStore } from '../store';
import SunLogo from '../components/SunLogo';
import type { Role } from '../types';

type AuthTab = 'login' | 'register';

const ROLES: Role[] = ['Rappeur', 'Beatmaker', 'Chanteur', 'Mixeur', 'DA', 'Multi'];

export default function AuthPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<AuthTab>('login');
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regPrenom, setRegPrenom] = useState('');
  const [regPseudo, setRegPseudo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('Rappeur');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const user = state.users.find(
      (u) => u.email === loginEmail && u.password === loginPassword,
    );

    if (!user) {
      setError('Email ou mot de passe incorrect.');
      return;
    }

    dispatch({ type: 'LOGIN', payload: { email: loginEmail, password: loginPassword } });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!regPrenom || !regPseudo || !regEmail || !regPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (state.users.some((u) => u.email === regEmail)) {
      setError('Un compte avec cet email existe déjà.');
      return;
    }

    dispatch({
      type: 'REGISTER',
      payload: {
        prenom: regPrenom,
        pseudo: regPseudo,
        email: regEmail,
        password: regPassword,
        role: regRole,
      },
    });
  }

  function handleDemo() {
    const demoUser = state.users[0];
    if (demoUser) {
      dispatch({ type: 'LOGIN', payload: { email: demoUser.email, password: demoUser.password } });
    }
  }

  function switchTab(newTab: AuthTab) {
    setTab(newTab);
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[400px]">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <SunLogo size={120} />
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-gold mt-4 text-center">
            Torrevieja Studio
          </h1>
          <p className="text-white/60 italic mt-1 text-center">La mixtape de l&apos;été</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-6">
          {/* Tabs */}
          <div className="flex mb-6 rounded-lg overflow-hidden border border-white/10">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === 'login'
                  ? 'bg-gold/20 text-gold'
                  : 'bg-white/5 text-white/50 hover:text-white/70'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === 'register'
                  ? 'bg-gold/20 text-gold'
                  : 'bg-white/5 text-white/50 hover:text-white/70'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm text-white/70 mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="input-field w-full"
                  placeholder="email@exemple.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm text-white/70 mb-1">
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="input-field w-full"
                  placeholder="••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-gold w-full">
                Se connecter
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="reg-prenom" className="block text-sm text-white/70 mb-1">
                  Prénom
                </label>
                <input
                  id="reg-prenom"
                  type="text"
                  className="input-field w-full"
                  placeholder="Prénom"
                  value={regPrenom}
                  onChange={(e) => setRegPrenom(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reg-pseudo" className="block text-sm text-white/70 mb-1">
                  Pseudo / Nom d&apos;artiste
                </label>
                <input
                  id="reg-pseudo"
                  type="text"
                  className="input-field w-full"
                  placeholder="Nom d'artiste"
                  value={regPseudo}
                  onChange={(e) => setRegPseudo(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm text-white/70 mb-1">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="input-field w-full"
                  placeholder="email@exemple.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm text-white/70 mb-1">
                  Mot de passe
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className="input-field w-full"
                  placeholder="Min. 6 caractères"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reg-role" className="block text-sm text-white/70 mb-1">
                  Rôle
                </label>
                <select
                  id="reg-role"
                  className="input-field w-full"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as Role)}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-gold w-full">
                Créer un compte
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs uppercase">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo access */}
          <button
            type="button"
            onClick={handleDemo}
            className="w-full py-2.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5 hover:text-white/80 transition-colors"
          >
            Accès démo
          </button>
        </div>
      </div>
    </div>
  );
}
