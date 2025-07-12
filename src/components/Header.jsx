import React from 'react';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = ({ activeTab, onNav, user, onLogout }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header__logo-row">
        <div className="header__logo-icon">DT</div>
        <h1 className="header__logo">DevTrackr</h1>
      </div>

      <nav className="header__nav">
        <button
          className={`header__link ${activeTab === 'dashboard' ? 'header__link--active' : ''}`}
          onClick={() => onNav('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`header__link ${activeTab === 'task' ? 'header__link--active' : ''}`}
          onClick={() => onNav('task')}
        >
          Tasks
        </button>
        <button
          className={`header__link ${activeTab === 'time' ? 'header__link--active' : ''}`}
          onClick={() => onNav('time')}
        >
          Time Tracking
        </button>
        <button
          className={`header__link ${activeTab === 'journal' ? 'header__link--active' : ''}`}
          onClick={() => onNav('journal')}
        >
          Journal
        </button>
        <button
          className={`header__link ${activeTab === 'workspaces' ? 'header__link--active' : ''}`}
          onClick={() => onNav('workspaces')}
        >
          Workspaces
        </button>
        <button
          className={`header__link ${activeTab === 'calendar' ? 'header__link--active' : ''}`}
          onClick={() => onNav('calendar')}
        >
          Calendar
        </button>
        <button
          className={`header__link ${activeTab === 'stats' ? 'header__link--active' : ''}`}
          onClick={() => onNav('stats')}
        >
          Insights
        </button>
      </nav>

      <div className="header__profile">
        <ThemeToggle />
        <div className="header__user-info">
          <div className="header__user-name">{user?.name || user?.email}</div>
          <button className="header__logout-btn" onClick={onLogout}>
            Sign out
          </button>
        </div>
        <div className="header__avatar">
          {getInitials(user?.name || user?.email)}
        </div>
      </div>
    </header>
  );
};

export default Header; 