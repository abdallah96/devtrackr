import './App.css';
import JournalTracker from './components/JournalTracker';
import Stats from './components/Stats';
import TaskTracker from './components/TaskTracker';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import JournalPreview from './components/JournalPreview';
import TaskGraph from './components/TaskGraph';
import { useState, useEffect } from 'react';

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

const defaultTasks = [
  { id: 1, text: 'Implement user authentication', completed: false, date: getToday() },
  { id: 2, text: 'Set up database connection', completed: false, date: getToday() },
  { id: 3, text: 'Create API endpoints', completed: false, date: getToday() },
  { id: 4, text: 'Design UI components', completed: false, date: getToday() },
  { id: 5, text: 'Write unit tests', completed: false, date: getToday() },
  { id: 6, text: 'Deploy application', completed: false, date: getToday() },
];
const defaultJournal = [
  { id: 1, text: 'Worked on UI components and fixed bugs.', date: getToday() },
  { id: 2, text: 'Set up authentication and tested login flow.', date: getToday() },
  { id: 3, text: 'Brainstormed new features for the dashboard.', date: getToday() },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('devtrackr_tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('devtrackr_journal');
    return saved ? JSON.parse(saved) : defaultJournal;
  });
  useEffect(() => {
    // Force clear localStorage
    localStorage.clear();
    
    const loadData = async () => {
      // ... rest of your code
    };
    loadData();
  }, []);
  useEffect(() => {
    localStorage.setItem('devtrackr_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('devtrackr_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Task handlers
  const addTask = (text) => {
    setTasks([
      ...tasks,
      { id: Date.now(), text, completed: false, date: getToday() },
    ]);
  };
  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Journal handlers
  const addJournalEntry = (text) => {
    setJournalEntries([
      { id: Date.now(), text, date: getToday() },
      ...journalEntries,
    ]);
  };

  // Dashboard data
  const todayTasks = tasks.filter(t => t.date === getToday());
  const todayCompleted = todayTasks.filter(t => t.completed);
  const weekDates = getThisWeek();
  const weekData = weekDates.map(date =>
    tasks.filter(t => t.date === date && t.completed).length
  );
  const weekTotal = weekDates.map(date =>
    tasks.filter(t => t.date === date).length
  );
  const weekPercent = weekTotal.reduce((acc, t, i) => acc + (t ? weekData[i] / t : 0), 0) / 7 * 100;
  const weekChange = '+10%'; // Placeholder for now

  // Insights data (last week)
  const lastWeekDates = getLastWeek();
  const lastWeekData = lastWeekDates.map(date =>
    tasks.filter(t => t.date === date && t.completed).length
  );
  const lastWeekTotal = lastWeekDates.map(date =>
    tasks.filter(t => t.date === date).length
  );
  const lastWeekPercent = lastWeekTotal.reduce((acc, t, i) => acc + (t ? lastWeekData[i] / t : 0), 0) / 7 * 100;
  const lastWeekJournals = journalEntries.filter(e => lastWeekDates.includes(e.date));

  return (
    <div className="App">
      <Header activeTab={activeTab} onNav={setActiveTab} />
      <div className="app-main-container">
        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-title">Dashboard</div>
            <div className="dashboard-section">
              <div className="dashboard-section-title">Today's Progress</div>
              <div style={{ marginBottom: '0.5rem', color: '#cfd8dc', fontSize: '0.98rem', fontWeight: 500 }}>Tasks Completed</div>
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
          </>
        )}
        {activeTab === 'journal' && <JournalTracker entries={journalEntries} addEntry={addJournalEntry} />}
        {activeTab === 'stats' && <Insights percent={Math.round(lastWeekPercent)} days={lastWeekData} journals={lastWeekJournals} />}
        {activeTab === 'task' && <TaskTracker tasks={tasks} addTask={addTask} toggleTask={toggleTask} />}
      </div>
    </div>
  );
}

// Dummy Insights component for now
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
          <div style={{ color: '#90caf9', fontStyle: 'italic' }}>No journal entries for last week.</div>
        ) : (
          <ul style={{ color: '#cfd8dc', fontSize: '1.1rem', paddingLeft: 0 }}>
            {journals.map(j => (
              <li key={j.id} style={{ marginBottom: '1rem', listStyle: 'none', background: '#1e242c', borderRadius: 10, padding: '1rem 1.5rem' }}>{j.text}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
