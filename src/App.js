import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getCurrentUser, logout as authLogout } from './services/authService';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser.email);
    }
    setLoading(false);
  }, []);

  const handleLogin = (email) => {
    setUser(email);
  };

  const handleLogout = () => {
    authLogout();
    setUser(null);
    localStorage.removeItem('cloudcrypt_files');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h1>☁️🔐 CloudCrypt</h1>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
