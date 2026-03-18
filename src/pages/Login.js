import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // For demo: hardcoded authentication
    if (isSignup) {
      localStorage.setItem('cloudcrypt_user', JSON.stringify({ email }));
      onLogin(email);
    } else {
      // Login - accept any valid format for demo
      localStorage.setItem('cloudcrypt_user', JSON.stringify({ email }));
      onLogin(email);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="logo">CloudCrypt</h1>
          <p className="tagline">Secure Cloud Storage with Encryption</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>

          <button type="submit" className="btn-primary">
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>

          <div className="form-toggle">
            <span>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="demo-info">
          <p>🎯 Demo Mode: Any email/password works!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
