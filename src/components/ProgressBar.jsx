import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ label, value, max }) => {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="progressbar">
      <div className="progressbar__label-row">
        <span className="progressbar__label">{label}</span>
        <span className="progressbar__value">{value}/{max}</span>
      </div>
      <div className="progressbar__track">
        <div className="progressbar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar; 