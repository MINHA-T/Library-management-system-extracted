'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    let valid = true;
    const nextUsernameError = username.trim() === '' ? 'Username is required.' : '';
    const nextPasswordError = password.trim() === '' ? 'Password is required.' : '';
    setUsernameError(nextUsernameError);
    setPasswordError(nextPasswordError);
    if (nextUsernameError || nextPasswordError) valid = false;

    if (!valid) return;

    setServerError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setServerError(data.message || 'Invalid username or password.');
        setLoading(false);
      }
    } catch {
      setServerError('Something went wrong. Please try again later.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-body">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-brand">
            <img src="/images/logo.png" alt="Library logo" className="auth-logo" />
            <h2>LibraryMS</h2>
            <p>Sign in to manage your library</p>
          </div>

          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                autoFocus
                className={usernameError ? 'input-error' : ''}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="field-error">{usernameError}</span>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className={passwordError ? 'input-error' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="field-error">{passwordError}</span>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-demo-hint">
            <strong>Demo credentials:</strong> admin / admin123
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay active">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}
