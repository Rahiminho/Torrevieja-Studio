import { useState } from 'react';
import { useStore } from '../store';
import SunLogo from '../components/SunLogo';
import type { Role } from '../types';

type AuthTab = 'login' | 'register';

const ROLES: Role[] = ['Rappeur', 'Beatmaker', 'Chanteur', 'Mixeur', 'DA', 'Multi'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fdf6e8', padding: '24px' }}>
      {/* Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <SunLogo />
        <h1 style={{ fontSize: '28px', fontFamily: 'serif', marginTop: '12px', color: '#1c1408' }}>Torrevieja Studio</h1>
        <p style={{ color: '#8c6830', fontSize: '14px', marginTop: '4px' }}>La mixtape de l'été</p>
      </div>

      {/* Auth Card */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => switchTab('login')}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'login' ? '#c8860a' : '#f9fafb',
              color: tab === 'login' ? 'white' : '#6b7280',
              transition: 'all 0.2s',
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => switchTab('register')}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'register' ? '#c8860a' : '#f9fafb',
              color: tab === 'register' ? 'white' : '#6b7280',
              transition: 'all 0.2s',
            }}
          >
            Créer un compte
          </button>
        </div>

        <div style={{ padding: '28px' }}>
          {/* Error message */}
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="email@exemple.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mot de passe</label>
                <input
                  type="password"
                  style={inputStyle}
                  placeholder="••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#c8860a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                Se connecter
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Prénom</label>
                <input type="text" style={inputStyle} placeholder="Prénom" value={regPrenom} onChange={(e) => setRegPrenom(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Pseudo / Nom d'artiste</label>
                <input type="text" style={inputStyle} placeholder="Nom d'artiste" value={regPseudo} onChange={(e) => setRegPseudo(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email</label>
                <input type="email" style={inputStyle} placeholder="email@exemple.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mot de passe</label>
                <input type="password" style={inputStyle} placeholder="Min. 6 caractères" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Rôle</label>
                <select style={inputStyle} value={regRole} onChange={(e) => setRegRole(e.target.value as Role)}>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#c8860a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                Créer un compte
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Demo access */}
          <button onClick={handleDemo} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#c8860a', border: '1px solid #c8860a', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Accès démo
          </button>
        </div>
      </div>
    </div>
  );
}
