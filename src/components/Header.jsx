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

const Header = ({ activeTab, onNav }) => {
  const navLinks = [
    { label: 'Dashboard', key: 'dashboard' },
    { label: 'Tasks', key: 'task' },
    { label: 'Journal', key: 'journal' },
    { label: 'Insights', key: 'stats' },
  ];
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
            href="#"
            className={`header__link${activeTab === link.key ? ' header__link--active' : ''}`}
            onClick={e => { e.preventDefault(); onNav && onNav(link.key); }}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="header__profile">
        <div className="header__avatar header__avatar--initials">AG</div>
      </div>
    </header>
  );
};

export default Header; 