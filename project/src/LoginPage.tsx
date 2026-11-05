import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Moon, Sun, AlertCircle, KeyRound, Users } from 'lucide-react';
import type { User, Role, Theme } from './types';

// Demo credentials — swap these out or replace with a real auth call later
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

interface LoginPageProps {
  onLogin: (user: User) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function LoginPage({ onLogin, theme, onToggleTheme }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const account = DEMO_ACCOUNTS[email.toLowerCase()];
      if (account && account.password === password) {
        onLogin(account.user);
      } else {
        setError('Invalid email or password. Try one of the demo accounts below.');
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
    <div className="login-shell">
      <button
        className="login-theme-toggle icon-btn"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>CloudGuard</strong>
            <span>SME security platform</span>
          </div>
        </div>

        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-password-wrap">
              <input
                id="password"
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

        <div className="login-divider">
          <span>or use a demo account</span>
        </div>

        <div className="login-demo-accounts">
          <button
            type="button"
            className="login-demo-btn admin"
            onClick={() => quickLogin('admin')}
          >
            <span className="demo-account-icon admin">
              <KeyRound size={14} />
            </span>
            <div>
              <strong>Admin account</strong>
              <span>admin@cloudguard.io</span>
            </div>
            <span className="demo-role-badge admin">Admin</span>
          </button>

          <button
            type="button"
            className="login-demo-btn user"
            onClick={() => quickLogin('user')}
          >
            <span className="demo-account-icon user">
              <Users size={14} />
            </span>
            <div>
              <strong>Analyst account</strong>
              <span>alex.morgan@cloudguard.io</span>
            </div>
            <span className="demo-role-badge user">Analyst</span>
          </button>
        </div>

        <p className="login-note">
          This is a preview login page. Credentials and role logic can be updated at any time.
        </p>
      </div>
    </div>
  );
}
