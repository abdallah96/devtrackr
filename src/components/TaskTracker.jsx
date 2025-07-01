import React, { useState } from 'react';
import './TaskTracker.css';

function TaskTracker({ tasks, addTask, toggleTask }) {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    addTask(newTask.trim());
    setNewTask('');
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="main-container">
      <div className="task-page">
        <h1 className="task-title">Tasks</h1>
        <input
          className="task-input"
          type="text"
          placeholder="Add a task"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTask()}
        />
        <ul className="task-list">
          {activeTasks.map(task => (
            <li key={task.id} className="task-item">
              <span className="task-text">{task.text}</span>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
            </li>
          ))}
        </ul>
        {completedTasks.length > 0 && (
          <>
            <h2 className="task-completed-title">Completed Tasks</h2>
            <ul className="task-list">
              {completedTasks.map(task => (
                <li key={task.id} className="task-item task-item-completed">
                  <span className="task-text task-text-completed">{task.text}</span>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default TaskTracker; 