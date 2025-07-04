import React from 'react';
import './Header.css';

const G_LOGO = (
  <div style={{
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#2196f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  }}>
    <span style={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: 'Inter, Arial, sans-serif' }}>G</span>
  </div>
);

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
        {G_LOGO}
        <div className="header__logo">G-Tracker</div>
      </div>
      <nav className="header__nav">
        {navLinks.map(link => (
          <a
            key={link.key}
            href="/"
            role="button"
            tabIndex={0}
            className={`header__link${activeTab === link.key ? ' header__link--active' : ''}`}
            onClick={e => { e.preventDefault(); onNav && onNav(link.key); }}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="header__profile">
        {user && (
          <div className="header__user-info">
            <span className="header__user-name">{user.name || user.email}</span>
            <button 
              className="header__logout-btn"
              onClick={onLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        )}
        <div className="header__avatar header__avatar--initials">
          {getUserInitials(user)}
        </div>
      </div>
    </header>
  );
};

export default Header; 