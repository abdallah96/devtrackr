import React, { useState } from 'react';
import './JournalTracker.css';
import EditIcon from '../Icons/EditIcon';
import DeleteIcon from '../Icons/DeleteIcon';

const JournalTracker = ({ entries, addEntry, editEntry, deleteEntry }) => {
  const [entry, setEntry] = useState('');
  const [search, setSearch] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editText, setEditText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleSave = () => {
    if (!entry.trim()) return;
    addEntry(entry.trim());
    setEntry('');
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry.id);
    setEditText(entry.text);
  };

  const handleSaveEdit = async () => {
    if (editText.trim() === '') return;
    await editEntry(editingEntry, editText.trim());
    setEditingEntry(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditText('');
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      await deleteEntry(id);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
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
              {editingEntry === e.id ? (
                <div className="journal-edit-container">
                  <textarea
                    className="journal-edit-textarea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                  />
                  <div className="journal-edit-actions">
                    <button className="journal-edit-btn journal-edit-save" onClick={handleSaveEdit}>
                      Save
                    </button>
                    <button className="journal-edit-btn journal-edit-cancel" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="journal-entry-text">{e.text}</div>
                  <div className="journal-entry-actions">
                    <button 
                      className="journal-action-btn journal-edit-btn"
                      onClick={() => handleEditEntry(e)}
                      title="Edit entry"
                    >
                      <EditIcon />
                    </button>
                    {confirmDeleteId === e.id ? (
                      <>
                        <button className="journal-action-btn journal-delete-btn" onClick={() => handleDeleteEntry(e.id)} title="Delete entry">
                          <DeleteIcon />
                        </button>
                        <button className="journal-delete-confirm-btn" onClick={() => handleDeleteEntry(e.id)}>
                          Confirm?
                        </button>
                        <button className="journal-delete-cancel-btn" onClick={handleCancelDelete}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        className="journal-action-btn journal-delete-btn"
                        onClick={() => handleDeleteClick(e.id)}
                        title="Delete entry"
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalTracker;