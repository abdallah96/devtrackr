import './App.css';
import JournalTracker from './components/JournalTracker';
import Stats from './components/Stats';
import TaskTracker from './components/TaskTracker';
import TimeTracker from './components/TimeTracker';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import JournalPreview from './components/JournalPreview';
import TaskGraph from './components/TaskGraph';
import Login from './components/Login';
import Register from './components/Register';
import WorkspaceManager from './components/WorkspaceManager';
import CalendarIntegration from './components/CalendarIntegration';
import { ThemeProvider } from './contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { taskAPI, journalAPI, authAPI, workspaceAPI } from './api';

const getToday = () => new Date().toISOString().slice(0, 10);

const getThisWeek = () => {
  const today = new Date();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i + 1); // Mon-Sun
    week.push(d.toISOString().slice(0, 10));
  }
  return week;
};

const getLastWeek = () => {
  const today = new Date();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i + 1 - 7); // Mon-Sun last week
    week.push(d.toISOString().slice(0, 10));
  }
  return week;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    // Clear any stale auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoading(false);
  }, []);

  // Load data from API
  const loadData = async () => {
    try {
      const [tasksData, journalData, workspacesData] = await Promise.all([
        taskAPI.getAll(),
        journalAPI.getAll(),
        workspaceAPI.getAll().catch(() => []) // Workspaces might not exist yet
      ]);
      setTasks(tasksData);
      setJournalEntries(journalData);
      setWorkspaces(workspacesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // If authentication fails, logout user
      if (error.message.includes('Authentication required')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Authentication handlers
  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    try {
      const { user: userData, token } = await authAPI.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      await loadData();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setAuthLoading(true);
    try {
      const { user: userData, token } = await authAPI.register(email, password, name);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      await loadData();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setTasks([]);
    setJournalEntries([]);
    setWorkspaces([]);
    setActiveTab('dashboard');
  };

  // Task handlers
  const addTask = async (text) => {
    try {
      const newTask = await taskAPI.create(text, getToday());
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (id) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === id);
      const updatedTask = await taskAPI.update(id, !taskToUpdate.completed);
      setTasks(tasks.map(task =>
        task.id === id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const editTask = async (id, text) => {
    const prevTasks = tasks;
    try {
      const updatedTask = await taskAPI.edit(id, text);
      setTasks(tasks.map(task =>
        task.id === id ? updatedTask : task
      ));
    } catch (error) {
      setTasks(prevTasks);
      console.error('Failed to edit task:', error);
    }
  };

  const deleteTask = async (id) => {
    const prevTasks = tasks;
    setTasks(tasks.filter(task => task.id !== id));
    try {
      await taskAPI.delete(id);
    } catch (error) {
      setTasks(prevTasks);
      console.error('Failed to delete task:', error);
    }
  };

  // Journal handlers
  const addJournalEntry = async (text) => {
    try {
      const newEntry = await journalAPI.create(text, getToday());
      setJournalEntries([newEntry, ...journalEntries]);
    } catch (error) {
      console.error('Failed to add journal entry:', error);
    }
  };

  const editJournalEntry = async (id, text) => {
    const prevEntries = journalEntries;
    try {
      const updatedEntry = await journalAPI.edit(id, text);
      setJournalEntries(journalEntries.map(entry =>
        entry.id === id ? updatedEntry : entry
      ));
    } catch (error) {
      setJournalEntries(prevEntries);
      console.error('Failed to edit journal entry:', error);
    }
  };

  const deleteJournalEntry = async (id) => {
    const prevEntries = journalEntries;
    setJournalEntries(journalEntries.filter(entry => entry.id !== id));
    try {
      await journalAPI.delete(id);
    } catch (error) {
      setJournalEntries(prevEntries);
      console.error('Failed to delete journal entry:', error);
    }
  };

  // Show authentication screens if not logged in
  if (!user) {
    return (
      <ThemeProvider>
        {authMode === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </ThemeProvider>
    );
  }

  // Dashboard data
  const todayTasks = tasks.filter(t => t.date.slice(0, 10) === getToday());
  const todayCompleted = todayTasks.filter(t => t.completed);
  const weekDates = getThisWeek();
  const weekData = weekDates.map(date =>
    tasks.filter(t => t.date.slice(0, 10) === date && t.completed).length
  );
  const weekTotal = weekDates.map(date =>
    tasks.filter(t => t.date.slice(0, 10) === date).length
  );
  const weekPercent = weekTotal.reduce((acc, t, i) => acc + (t ? weekData[i] / t : 0), 0) / 7 * 100;
  const weekChange = '+10%'; // Placeholder for now

  // Insights data (last week)
  const lastWeekDates = getLastWeek();
  const lastWeekData = lastWeekDates.map(date =>
    tasks.filter(t => t.date.slice(0, 10) === date && t.completed).length
  );
  const lastWeekTotal = lastWeekDates.map(date =>
    tasks.filter(t => t.date.slice(0, 10) === date).length
  );
  const lastWeekPercent = lastWeekTotal.reduce((acc, t, i) => acc + (t ? lastWeekData[i] / t : 0), 0) / 7 * 100;
  const lastWeekJournals = journalEntries.filter(e => lastWeekDates.includes(e.date.slice(0, 10)));

  if (loading) {
    return (
      <ThemeProvider>
        <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="App">
        <Header 
          activeTab={activeTab} 
          onNav={setActiveTab} 
          user={user}
          onLogout={handleLogout}
        />
        <div className="app-main-container">
          {activeTab === 'dashboard' && (
            <>
              <div className="dashboard-title">Dashboard</div>
              <div className="dashboard-section">
                <div className="dashboard-section-title">Today's Progress</div>
                <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.98rem', fontWeight: 500 }}>Tasks Completed</div>
                <ProgressBar label="" value={todayCompleted.length} max={todayTasks.length || 1} />
              </div>
              <div className="dashboard-section">
                <div className="dashboard-section-title">Journal Preview</div>
                <JournalPreview latestEntry={journalEntries[0]} />
              </div>
              <div className="dashboard-section">
                <div className="dashboard-section-title">Weekly Productivity</div>
                <TaskGraph percent={Math.round(weekPercent)} comparison={weekChange} days={weekData} />
              </div>
              {workspaces.length > 0 && (
                <div className="dashboard-section">
                  <div className="dashboard-section-title">Workspaces Overview</div>
                  <div className="workspace-preview">
                    <p>You have {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} available</p>
                    <button 
                      className="dashboard-action-btn"
                      onClick={() => setActiveTab('workspaces')}
                    >
                      Manage Workspaces
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {activeTab === 'journal' && (
            <JournalTracker 
              entries={journalEntries} 
              addEntry={addJournalEntry} 
              editEntry={editJournalEntry} 
              deleteEntry={deleteJournalEntry} 
            />
          )}
          {activeTab === 'stats' && (
            <Insights 
              percent={Math.round(lastWeekPercent)} 
              days={lastWeekData} 
              journals={lastWeekJournals} 
            />
          )}
          {activeTab === 'task' && (
            <TaskTracker 
              tasks={tasks} 
              addTask={addTask} 
              toggleTask={toggleTask} 
              editTask={editTask} 
              deleteTask={deleteTask} 
            />
          )}
          {activeTab === 'time' && (
            <TimeTracker 
              user={user} 
              tasks={tasks} 
              workspaces={workspaces} 
            />
          )}
          {activeTab === 'workspaces' && (
            <WorkspaceManager user={user} />
          )}
          {activeTab === 'calendar' && (
            <CalendarIntegration user={user} />
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

// Insights component
function Insights({ percent, days, journals }) {
  return (
    <div>
      <div className="dashboard-title">Insights (Last Week)</div>
      <div className="dashboard-section">
        <div className="dashboard-section-title">Last Week's Progress</div>
        <TaskGraph percent={percent} comparison={"-5%"} days={days} />
      </div>
      <div className="dashboard-section">
        <div className="dashboard-section-title">Last Week's Journal Entries</div>
        {journals.length === 0 ? (
          <div style={{ color: 'var(--accent-color)', fontStyle: 'italic' }}>No journal entries for last week.</div>
        ) : (
          <ul style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', paddingLeft: 0 }}>
            {journals.map(j => (
              <li key={j.id} style={{ marginBottom: '1rem', listStyle: 'none', background: 'var(--bg-secondary)', borderRadius: 10, padding: '1rem 1.5rem' }}>{j.text}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
