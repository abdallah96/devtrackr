import React from 'react';
import './JournalPreview.css';

const JournalPreview = ({ latestEntry }) => {
  return (
    <div className="journal-preview">
      <div className="journal-preview__title">Journal Preview</div>
      <div className="journal-preview__content">
        {latestEntry ? (
          <div className="journal-preview__entry-text">{latestEntry.text}</div>
        ) : (
          <div className="journal-preview__placeholder">No journal entry yet.</div>
        )}
      </div>
    </div>
  );
};

export default JournalPreview; 