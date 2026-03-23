import { useState } from 'react';
import { useStore } from '../store';
import SunLogo from '../components/SunLogo';
import type { Role } from '../types';

type AuthTab = 'login' | 'register';

const ROLES: Role[] = ['Rappeur', 'Beatmaker', 'Chanteur', 'Mixeur', 'DA', 'Multi'];

export default function AuthPage() {
  const { state, dispatch, loginAsync } = useStore();
  const [tab, setTab] = useState<AuthTab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regPrenom, setRegPrenom] = useState('');
  const [regPseudo, setRegPseudo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('Rappeur');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    const user = await loginAsync(loginEmail, loginPassword);
    setLoading(false);

    if (!user) {
      setError('Email ou mot de passe incorrect.');
    }
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

  async function handleDemo() {
    const demoUser = state.users[0];
    if (demoUser) {
      setLoading(true);
      await loginAsync(demoUser.email, demoUser.password);
      setLoading(false);
    }
  }

  function switchTab(newTab: AuthTab) {
    setTab(newTab);
    setError('');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          'radial-gradient(ellipse 100% 80% at 50% 20%, rgba(232,160,32,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(200,134,10,0.10) 0%, transparent 60%), var(--color-cream)',
      }}
    >
      <div className="w-full max-w-[400px] animate-fade-in">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <SunLogo size={100} />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--color-gold)',
              marginTop: 16,
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            Torrevieja Studio
          </h1>
          <p
            style={{
              color: 'var(--color-txt3)',
              fontStyle: 'italic',
              marginTop: 4,
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            La mixtape de l&apos;été
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {/* Tabs - iOS segmented control style */}
          <div
            style={{
              display: 'flex',
              marginBottom: 24,
              borderRadius: 10,
              overflow: 'hidden',
              background: 'rgba(200,134,10,0.06)',
              padding: 3,
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => switchTab('login')}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: '0.85rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                transition: 'all 0.2s ease',
                background: tab === 'login' ? 'rgba(253,246,232,0.85)' : 'transparent',
                color: tab === 'login' ? 'var(--color-gold)' : 'var(--color-txt3)',
                boxShadow: tab === 'login' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: '0.85rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                transition: 'all 0.2s ease',
                background: tab === 'register' ? 'rgba(253,246,232,0.85)' : 'transparent',
                color: tab === 'register' ? 'var(--color-gold)' : 'var(--color-txt3)',
                boxShadow: tab === 'register' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Créer un compte
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.08)',
                border: '0.5px solid rgba(239,68,68,0.2)',
                color: '#dc2626',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 4, fontWeight: 500 }}
                >
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
                <label
                  htmlFor="login-password"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 4, fontWeight: 500 }}
                >
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
              <button type="submit" className="btn-gold w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="reg-prenom"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 4, fontWeight: 500 }}
                >
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
                <label
                  htmlFor="reg-pseudo"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 4, fontWeight: 500 }}
                >
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
                <label
                  htmlFor="reg-email"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 4, fontWeight: 500 }}
                >
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
                <label
                  htmlFor="reg-password"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 4, fontWeight: 500 }}
                >
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
                <label
                  htmlFor="reg-role"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 4, fontWeight: 500 }}
                >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 0.5, background: 'rgba(200,134,10,0.12)' }} />
            <span style={{ color: 'var(--color-txt4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
            <div style={{ flex: 1, height: 0.5, background: 'rgba(200,134,10,0.12)' }} />
          </div>

          {/* Demo access */}
          <button
            type="button"
            onClick={handleDemo}
            className="btn-outline w-full"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Accès démo'}
          </button>
        </div>
      </div>
    </div>
  );
}
