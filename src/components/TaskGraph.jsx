import React from 'react';
import './TaskGraph.css';

const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TaskGraph = ({ percent, comparison, days }) => {
  return (
    <div className="task-graph">
      <div className="task-graph__title">Weekly Productivity</div>
      <div className="task-graph__card">
        <div className="task-graph__header-row">
          <div>
            <div className="task-graph__subtitle">Tasks Completed</div>
            <div className="task-graph__percent">{percent}%</div>
            <div className="task-graph__comparison">This Week <span>{comparison}</span></div>
          </div>
        </div>
        <div className="task-graph__bars">
          {days.map((val, idx) => (
            <div key={idx} className="task-graph__bar-group">
              <div className="task-graph__bar" style={{ height: `${val * 18}px` }} />
              <div className="task-graph__day">{daysShort[idx]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskGraph; 