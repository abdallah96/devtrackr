import React, { useState } from 'react';
import './JournalTracker.css';

const JournalTracker = ({ entries, addEntry }) => {
  const [entry, setEntry] = useState('');
  const [search, setSearch] = useState('');

  const handleSave = () => {
    if (!entry.trim()) return;
    addEntry(entry.trim());
    setEntry('');
  };

  const filteredEntries = entries.filter(e =>
    e.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-container">
      <div className="journal-page">
        <h1 className="journal-title">Journal</h1>
        <textarea
          className="journal-textarea"
          placeholder="Write your journal entry here..."
          value={entry}
          onChange={e => setEntry(e.target.value)}
          rows={6}
        />
        <div className="journal-save-row">
          <button className="journal-save-btn" onClick={handleSave}>Save Entry</button>
        </div>
        <div className="journal-previous-title">Previous Entries</div>
        <input
          className="journal-search"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="journal-entries-list">
          {filteredEntries.map(e => (
            <div key={e.id} className="journal-entry-card">
              {e.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalTracker;