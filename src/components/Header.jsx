import React from 'react';
import { Button } from '@headlessui/react';
import './Header.css';

const Header = ({ activeTab, onNav, user, onLogout }) => {
  const navLinks = [
    { label: 'Dashboard', key: 'dashboard' },
    { label: 'Tasks', key: 'task' },
    { label: 'Journal', key: 'journal' },
    { label: 'Insights', key: 'stats' },
  ];

  const getUserInitials = (user) => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="header">
      <div className="header__logo-row">
        <div className="header__logo-icon">G</div>
        <div className="header__logo">G-Tracker</div>
      </div>
      <nav className="header__nav">
        {navLinks.map(link => (
          <Button
            key={link.key}
            className={`header__link${activeTab === link.key ? ' header__link--active' : ''}`}
            onClick={() => onNav && onNav(link.key)}
          >
            {link.label}
          </Button>
        ))}
      </nav>
      <div className="header__profile">
        {user && (
          <div className="header__user-info">
            <span className="header__user-name">{user.name || user.email}</span>
            <Button 
              className="header__logout-btn"
              onClick={onLogout}
            >
              Sign out
            </Button>
          </div>
        )}
        <div className="header__avatar">
          {getUserInitials(user)}
        </div>
      </div>
    </header>
  );
};

export default Header; 