import React, { useState } from 'react';
import './TaskTracker.css';
import { EditIcon } from '../Icons/EditIcon';
import { DeleteIcon } from '../Icons/DeleteIcon';

function TaskTracker() {
  // Local state for tasks
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finish React setup', completed: false },
    { id: 2, text: 'Read JavaScript notes', completed: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Add a new task
  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    setTasks([
      ...tasks,
      { id: Date.now(), text: newTask, completed: false },
    ]);
    setNewTask('');
  };

  // Toggle task completion
  const handleToggle = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Start editing a task
  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  // Save edited task
  const handleSaveEdit = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: editingText } : task
    ));
    setEditingId(null);
    setEditingText('');
  };

  // Delete a task
  const handleDelete = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="task-tracker">
      <h2 className="task-title">My Tasks</h2>
      <div className="task-add-row">
        <input
          className="task-input"
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTask()}
        />
        <button className="task-add-btn" onClick={handleAddTask}>Add Task</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task.id)}
            />
            {editingId === task.id ? (
              <>
                <input
                  className="task-edit-input"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveEdit(task.id)}
                  autoFocus
                />
                <button className="task-save-btn" onClick={() => handleSaveEdit(task.id)}>Save</button>
              </>
            ) : (
              <span className={task.completed ? 'task-completed' : ''}>{task.text}</span>
            )}
            <button className="task-edit-btn" onClick={() => handleEdit(task.id, task.text)} title="Edit"><EditIcon /></button>
            <button className="task-delete-btn" onClick={() => handleDelete(task.id)} title="Delete"><DeleteIcon /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskTracker; 