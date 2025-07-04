import React, { useState } from 'react';
import { Button } from '@headlessui/react';
import './TaskTracker.css';
import EditIcon from '../Icons/EditIcon';
import DeleteIcon from '../Icons/DeleteIcon';

function TaskTracker({ tasks, addTask, toggleTask, editTask, deleteTask }) {
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletingTasks, setDeletingTasks] = useState(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    addTask(newTask.trim());
    setNewTask('');
  };

  const handleEditTask = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = async () => {
    if (editText.trim() === '') return;
    await editTask(editingTask, editText.trim());
    setEditingTask(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setDeletingTasks(prev => new Set(prev).add(id));
      try {
        await deleteTask(id);
      } finally {
        setDeletingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="main-container">
      <div className="task-page">
        <h1 className="task-title">Tasks</h1>
        <div className="task-input-container">
          <input
            className="task-input"
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
          />
          <Button
            className="task-add-button"
            onClick={handleAddTask}
            disabled={!newTask.trim()}
          >
            Add Task
          </Button>
        </div>
        
        <ul className="task-list">
          {activeTasks.map(task => (
            <li key={task.id} className="task-item">
              {editingTask === task.id ? (
                <div className="task-edit-container">
                  <input
                    type="text"
                    className="task-edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                  <div className="task-edit-actions">
                    <Button className="task-edit-btn task-edit-save" onClick={handleSaveEdit}>
                      Save
                    </Button>
                    <Button className="task-edit-btn task-edit-cancel" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="task-content">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className="task-text">{task.text}</span>
                  </div>
                  <div className="task-actions">
                    <Button 
                      className="task-action-btn task-edit-btn"
                      onClick={() => handleEditTask(task)}
                    >
                      <EditIcon />
                    </Button>
                    {confirmDeleteId === task.id ? (
                      <div className="task-delete-confirm">
                        <Button className="task-delete-confirm-btn" onClick={() => handleDeleteTask(task.id)} disabled={deletingTasks.has(task.id)}>
                          {deletingTasks.has(task.id) ? 'Deleting...' : 'Confirm'}
                        </Button>
                        <Button className="task-delete-cancel-btn" onClick={handleCancelDelete} disabled={deletingTasks.has(task.id)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="task-action-btn task-delete-btn"
                        onClick={() => handleDeleteClick(task.id)}
                        disabled={deletingTasks.has(task.id)}
                      >
                        <DeleteIcon />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        
        {completedTasks.length > 0 && (
          <>
            <h2 className="task-completed-title">Completed Tasks</h2>
            <ul className="task-list">
              {completedTasks.map(task => (
                <li key={task.id} className="task-item task-item-completed">
                  <div className="task-content">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className="task-text task-text-completed">{task.text}</span>
                  </div>
                  <div className="task-actions">
                    <Button 
                      className="task-action-btn task-edit-btn"
                      onClick={() => handleEditTask(task)}
                    >
                      <EditIcon />
                    </Button>
                    {confirmDeleteId === task.id ? (
                      <div className="task-delete-confirm">
                        <Button className="task-delete-confirm-btn" onClick={() => handleDeleteTask(task.id)} disabled={deletingTasks.has(task.id)}>
                          {deletingTasks.has(task.id) ? 'Deleting...' : 'Confirm'}
                        </Button>
                        <Button className="task-delete-cancel-btn" onClick={handleCancelDelete} disabled={deletingTasks.has(task.id)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="task-action-btn task-delete-btn"
                        onClick={() => handleDeleteClick(task.id)}
                        disabled={deletingTasks.has(task.id)}
                      >
                        <DeleteIcon />
                      </Button>
                    )}
                  </div>
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