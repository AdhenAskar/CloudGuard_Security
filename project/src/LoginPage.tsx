import { useState } from 'react';
import {
  ShieldCheck, Eye, EyeOff, Moon, Sun, AlertCircle, KeyRound,
  Users, Clock, Monitor, Globe, CheckCircle2, XCircle, ChevronRight,
  Activity, Lock,
} from 'lucide-react';
import type { User, Role, Theme } from './types';

// ── Demo credentials ──────────────────────────────────────────────────────────
const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'admin@cloudguard.io': {
    password: 'admin123',
    user: {
      name: 'Jordan Davis',
      email: 'admin@cloudguard.io',
      role: 'admin',
      title: 'Workspace Owner & Admin',
      initials: 'JD',
    },
  },
  'alex.morgan@cloudguard.io': {
    password: 'user123',
    user: {
      name: 'Alex Morgan',
      email: 'alex.morgan@cloudguard.io',
      role: 'user',
      title: 'Security Analyst',
      initials: 'AM',
    },
  },
};

// ── Simulated login activity log (admin can see this) ────────────────────────
type LoginEvent = {
  id: number;
  user: string;
  email: string;
  role: Role;
  initials: string;
  time: string;
  ip: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
};

const LOGIN_HISTORY: LoginEvent[] = [
  { id: 1, user: 'Jordan Davis',   email: 'admin@cloudguard.io',        role: 'admin', initials: 'JD', time: 'Today, 09:14 AM',    ip: '192.168.1.101', device: 'Chrome / Windows',  location: 'London, UK',      status: 'success' },
  { id: 2, user: 'Alex Morgan',    email: 'alex.morgan@cloudguard.io',  role: 'user',  initials: 'AM', time: 'Today, 08:52 AM',    ip: '192.168.1.104', device: 'Safari / macOS',    location: 'Manchester, UK',  status: 'success' },
  { id: 3, user: 'Sam Patel',      email: 'sam.patel@cloudguard.io',    role: 'user',  initials: 'SP', time: 'Today, 08:30 AM',    ip: '10.0.0.55',     device: 'Firefox / Linux',   location: 'Birmingham, UK',  status: 'success' },
  { id: 4, user: 'Unknown',        email: 'admin@cloudguard.io',        role: 'admin', initials: '?',  time: 'Yesterday, 11:47 PM', ip: '45.33.22.11',   device: 'Chrome / Unknown',  location: 'Unknown',         status: 'failed'  },
  { id: 5, user: 'Priya Nair',     email: 'priya.nair@cloudguard.io',   role: 'user',  initials: 'PN', time: 'Yesterday, 05:12 PM', ip: '192.168.1.110', device: 'Edge / Windows',    location: 'London, UK',      status: 'success' },
  { id: 6, user: 'Alex Morgan',    email: 'alex.morgan@cloudguard.io',  role: 'user',  initials: 'AM', time: 'Yesterday, 09:01 AM', ip: '192.168.1.104', device: 'Safari / macOS',    location: 'Manchester, UK',  status: 'success' },
  { id: 7, user: 'Unknown',        email: 'priya.nair@cloudguard.io',   role: 'user',  initials: '?',  time: 'Nov 3, 10:22 PM',    ip: '77.88.55.22',   device: 'Unknown',           location: 'Unknown',         status: 'failed'  },
  { id: 8, user: 'Jordan Davis',   email: 'admin@cloudguard.io',        role: 'admin', initials: 'JD', time: 'Nov 3, 08:45 AM',    ip: '192.168.1.101', device: 'Chrome / Windows',  location: 'London, UK',      status: 'success' },
];

// ── Shared form component ─────────────────────────────────────────────────────
interface LoginFormProps {
  onLogin: (user: User) => void;
  compact?: boolean;
}

function LoginForm({ onLogin, compact = false }: LoginFormProps) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const account = DEMO_ACCOUNTS[email.toLowerCase()];
      if (account && account.password === password) {
        onLogin(account.user);
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 600);
  };

  const quickLogin = (role: Role) => {
    const account =
      role === 'admin'
        ? DEMO_ACCOUNTS['admin@cloudguard.io']
        : DEMO_ACCOUNTS['alex.morgan@cloudguard.io'];
    onLogin(account.user);
  };

  return (
    <div className={compact ? 'login-form-compact' : ''}>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-field">
          <label htmlFor={compact ? 'email-compact' : 'email'}>Email address</label>
          <input
            id={compact ? 'email-compact' : 'email'}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor={compact ? 'password-compact' : 'password'}>Password</label>
          <div className="login-password-wrap">
            <input
              id={compact ? 'password-compact' : 'password'}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="login-submit primary-btn"
          disabled={loading || !email || !password}
        >
          {loading ? <span className="login-spinner" /> : 'Sign in'}
        </button>
      </form>

      <div className="login-divider"><span>or use a demo account</span></div>

      <div className="login-demo-accounts">
        <button type="button" className="login-demo-btn admin" onClick={() => quickLogin('admin')}>
          <span className="demo-account-icon admin"><KeyRound size={14} /></span>
          <div>
            <strong>Admin account</strong>
            <span>admin@cloudguard.io · admin123</span>
          </div>
          <span className="demo-role-badge admin">Admin</span>
        </button>
        <button type="button" className="login-demo-btn user" onClick={() => quickLogin('user')}>
          <span className="demo-account-icon user"><Users size={14} /></span>
          <div>
            <strong>Analyst account</strong>
            <span>alex.morgan@cloudguard.io · user123</span>
          </div>
          <span className="demo-role-badge user">Analyst</span>
        </button>
      </div>
    </div>
  );
}

// ── Main LoginPage export ─────────────────────────────────────────────────────
interface LoginPageProps {
  onLogin: (user: User) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function LoginPage({ onLogin, theme, onToggleTheme }: LoginPageProps) {
  // Which portal tab is selected
  const [portal, setPortal] = useState<'user' | 'admin'>('user');

  const failed  = LOGIN_HISTORY.filter((e) => e.status === 'failed').length;
  const today   = LOGIN_HISTORY.filter((e) => e.time.startsWith('Today')).length;

  return (
    <div className="login-shell">
      {/* Theme toggle */}
      <button
        className="login-theme-toggle icon-btn"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ── Portal switcher ── */}
      <div className="login-portal-wrap">
        {/* Header brand */}
        <div className="login-portal-brand">
          <div className="login-brand-mark"><ShieldCheck size={20} /></div>
          <strong>CloudGuard</strong>
          <span>SME security platform</span>
        </div>

        {/* Tab switcher */}
        <div className="login-portal-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={portal === 'user'}
            className={`login-tab ${portal === 'user' ? 'active' : ''}`}
            onClick={() => setPortal('user')}
          >
            <Users size={14} /> User portal
          </button>
          <button
            role="tab"
            aria-selected={portal === 'admin'}
            className={`login-tab ${portal === 'admin' ? 'active' : ''}`}
            onClick={() => setPortal('admin')}
          >
            <Lock size={14} /> Admin portal
          </button>
        </div>

        {/* ── USER PORTAL ── */}
        {portal === 'user' && (
          <div className="login-card user-card-layout">
            <div className="login-header">
              <h1>Welcome back</h1>
              <p>Sign in as a security analyst</p>
            </div>
            <LoginForm onLogin={onLogin} />
            <p className="login-note">
              Need admin access? Switch to the Admin portal tab above.
            </p>
          </div>
        )}

        {/* ── ADMIN PORTAL ── */}
        {portal === 'admin' && (
          <div className="login-card admin-card-layout">
            <div className="admin-login-grid">

              {/* Left: sign-in form */}
              <div className="admin-login-left">
                <div className="login-header">
                  <div className="admin-portal-badge">
                    <KeyRound size={13} /> Admin portal
                  </div>
                  <h1>Admin sign in</h1>
                  <p>Full workspace access and user oversight</p>
                </div>
                <LoginForm onLogin={onLogin} compact />
                <p className="login-note">
                  Admin sessions are logged and audited.
                </p>
              </div>

              {/* Right: login activity panel */}
              <div className="admin-login-right">
                <div className="admin-activity-header">
                  <div>
                    <span className="eyebrow-small">Live audit log</span>
                    <h3>User login activity</h3>
                  </div>
                  <Activity size={16} />
                </div>

                {/* Summary stats */}
                <div className="admin-activity-stats">
                  <div className="activity-stat">
                    <CheckCircle2 size={14} />
                    <div>
                      <strong>{today}</strong>
                      <span>Logins today</span>
                    </div>
                  </div>
                  <div className="activity-stat failed">
                    <XCircle size={14} />
                    <div>
                      <strong>{failed}</strong>
                      <span>Failed attempts</span>
                    </div>
                  </div>
                  <div className="activity-stat">
                    <Users size={14} />
                    <div>
                      <strong>{new Set(LOGIN_HISTORY.filter(e => e.status === 'success').map(e => e.email)).size}</strong>
                      <span>Active users</span>
                    </div>
                  </div>
                </div>

                {/* Event list */}
                <div className="admin-event-list">
                  {LOGIN_HISTORY.map((event) => (
                    <div key={event.id} className={`admin-event-row ${event.status}`}>
                      <div className={`admin-event-avatar ${event.role} ${event.status === 'failed' ? 'failed' : ''}`}>
                        {event.initials}
                      </div>
                      <div className="admin-event-info">
                        <div className="admin-event-top">
                          <strong>{event.user}</strong>
                          <span className={`admin-event-status ${event.status}`}>
                            {event.status === 'success'
                              ? <><CheckCircle2 size={11} /> Success</>
                              : <><XCircle size={11} /> Failed</>}
                          </span>
                        </div>
                        <span className="admin-event-email">{event.email}</span>
                        <div className="admin-event-meta">
                          <span><Clock size={10} /> {event.time}</span>
                          <span><Globe size={10} /> {event.location}</span>
                          <span><Monitor size={10} /> {event.device}</span>
                        </div>
                      </div>
                      <span className="admin-event-ip">{event.ip}</span>
                    </div>
                  ))}
                </div>

                <button className="admin-activity-footer">
                  View full audit log <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
