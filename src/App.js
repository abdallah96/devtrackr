import './App.css';
import JournalTracker from './components/JournalTracker';
import Stats from './components/Stats';
import TaskTracker from './components/TaskTracker';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('journal');
  return (
    <div className="App">
      <header className="App-header">
        <nav className="App-nav">
        <button onClick={() => setActiveTab('journal')}>Journal</button>
        <button onClick={() => setActiveTab('stats')}>Stats</button>
        <button onClick={() => setActiveTab('task')}>Task</button>
        </nav>
      </header>
      {activeTab === 'journal' && <JournalTracker />}
      {activeTab === 'stats' && <Stats />}
      {activeTab === 'task' && <TaskTracker />}
    </div>
  );
}

export default App;
