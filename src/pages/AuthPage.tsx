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
  const [regBio, setRegBio] = useState('');

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
        bio: regBio || undefined,
      },
    });
  }

  async function handleDemo() {
    setLoading(true);
    // Try the known demo credentials first
    let user = await loginAsync('demo@torrevieja.studio', 'demo123');
    if (!user) {
      // Fallback: use the first user in state
      const first = state.users[0];
      if (first) {
        user = await loginAsync(first.email, first.password);
      }
    }
    if (!user) {
      // Last resort: create a demo user inline and login
      dispatch({
        type: 'REGISTER',
        payload: {
          prenom: 'Demo',
          pseudo: 'DemoUser',
          email: 'demo@torrevieja.studio',
          password: 'demo123',
          role: 'Rappeur',
        },
      });
    }
    setLoading(false);
  }

  function switchTab(newTab: AuthTab) {
    setTab(newTab);
    setError('');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-[420px] animate-fade-in">
        {/* Logo & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <SunLogo size={120} />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--color-gold)',
              marginTop: 16,
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Torrevieja Studio
          </h1>
          <p
            style={{
              color: 'var(--color-txt3)',
              fontStyle: 'italic',
              marginTop: 6,
              textAlign: 'center',
              fontSize: '0.95rem',
            }}
          >
            La mixtape de l&apos;été
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          {/* iOS segmented tabs */}
          <div
            style={{
              display: 'flex',
              marginBottom: 24,
              borderRadius: 12,
              overflow: 'hidden',
              background: 'rgba(200,134,10,0.07)',
              padding: 3,
              gap: 2,
            }}
          >
            {(['login', 'register'] as AuthTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 9,
                  transition: 'all 0.2s ease',
                  background: tab === t ? 'rgba(253,246,232,0.95)' : 'transparent',
                  color: tab === t ? 'var(--color-gold)' : 'var(--color-txt3)',
                  boxShadow: tab === t ? '0 1px 4px rgba(180,100,10,0.10)' : 'none',
                }}
              >
                {t === 'login' ? 'Connexion' : 'Créer un compte'}
              </button>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#dc2626',
                fontSize: '0.85rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  htmlFor="login-email"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="email@exemple.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="input-field"
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
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label
                  htmlFor="reg-prenom"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Prénom
                </label>
                <input
                  id="reg-prenom"
                  type="text"
                  className="input-field"
                  placeholder="Prénom"
                  value={regPrenom}
                  onChange={(e) => setRegPrenom(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="reg-pseudo"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Pseudo / Nom d&apos;artiste
                </label>
                <input
                  id="reg-pseudo"
                  type="text"
                  className="input-field"
                  placeholder="Nom d'artiste"
                  value={regPseudo}
                  onChange={(e) => setRegPseudo(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="reg-email"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="input-field"
                  placeholder="email@exemple.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="reg-password"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Mot de passe
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 caractères"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="reg-role"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Rôle
                </label>
                <select
                  id="reg-role"
                  className="input-field"
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
              <div>
                <label
                  htmlFor="reg-bio"
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-txt2)', marginBottom: 5, fontWeight: 500 }}
                >
                  Bio (optionnel)
                </label>
                <textarea
                  id="reg-bio"
                  className="input-field"
                  placeholder="Quelques mots sur toi..."
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn-gold w-full">
                Créer un compte
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(200,134,10,0.14)' }} />
            <span style={{ color: 'var(--color-txt4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(200,134,10,0.14)' }} />
          </div>

          {/* Demo access – always works */}
          <button
            type="button"
            onClick={handleDemo}
            className="btn-outline w-full"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Accès démo'}
          </button>

          <p
            style={{
              textAlign: 'center',
              marginTop: 10,
              fontSize: '0.72rem',
              color: 'var(--color-txt4)',
            }}
          >
            demo@torrevieja.studio · demo123
          </p>
        </div>
      </div>
    </div>
  );
}
