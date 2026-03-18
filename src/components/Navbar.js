import React from 'react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 className="navbar-logo">  CloudCrypt</h1>
        </div>
        
        <div className="navbar-user">
          <span className="user-email">{user}</span>
          <button 
            className="btn-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
