import React, { useState, useEffect } from 'react';
import { timeAPI } from '../api';
import { Play, Pause, Square, Clock, Calendar, Users, TrendingUp, Edit, Trash2, Filter } from 'lucide-react';
import './TimeTracker.css';

const TimeTracker = ({ user, tasks = [], workspaces = [] }) => {
  const [activeEntry, setActiveEntry] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('timer'); // timer, entries, reports
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    taskId: '',
    workspaceId: ''
  });
  const [reports, setReports] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeEntry) {
      interval = setInterval(() => {
        const startTime = new Date(activeEntry.startTime);
        const now = new Date();
        setCurrentTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  // Load initial data
  useEffect(() => {
    loadActiveEntry();
    loadTimeEntries();
  }, []);

  const loadActiveEntry = async () => {
    try {
      const entry = await timeAPI.getActiveEntry();
      setActiveEntry(entry);
      if (entry) {
        const startTime = new Date(entry.startTime);
        const now = new Date();
        setCurrentTime(Math.floor((now - startTime) / 1000));
      }
    } catch (err) {
      // No active entry is fine
      setActiveEntry(null);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const entries = await timeAPI.getEntries(filters);
      setTimeEntries(entries);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadReports = async () => {
    try {
      const [userReport, taskReport, workspaceReport] = await Promise.all([
        timeAPI.getReports({ ...filters, groupBy: 'user' }),
        timeAPI.getReports({ ...filters, groupBy: 'task' }),
        timeAPI.getReports({ ...filters, groupBy: 'workspace' })
      ]);
      setReports({
        byUser: userReport,
        byTask: taskReport,
        byWorkspace: workspaceReport
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartTracking = async () => {
    if (!selectedTask) {
      setError('Please select a task to track');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const entry = await timeAPI.startTracking(selectedTask, description);
      setActiveEntry(entry);
      setCurrentTime(0);
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTracking = async () => {
    try {
      setLoading(true);
      await timeAPI.stopTracking();
      setActiveEntry(null);
      setCurrentTime(0);
      loadTimeEntries(); // Refresh entries
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = async (entryId, data) => {
    try {
      await timeAPI.updateEntry(entryId, data);
      setEditingEntry(null);
      loadTimeEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) return;
    
    try {
      await timeAPI.deleteEntry(entryId);
      loadTimeEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.text : 'Unknown Task';
  };

  const getTotalHoursForPeriod = () => {
    return timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  return (
    <div className="time-tracker">
      <div className="time-tracker-header">
        <h2>Time Tracking</h2>
        <div className="time-tracker-tabs">
          <button 
            className={`tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            <Clock size={16} />
            Timer
          </button>
          <button 
            className={`tab-btn ${activeTab === 'entries' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('entries');
              loadTimeEntries();
            }}
          >
            <Calendar size={16} />
            Entries
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reports');
              loadReports();
            }}
          >
            <TrendingUp size={16} />
            Reports
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'timer' && (
        <div className="timer-section">
          <div className="timer-display">
            <div className="timer-clock">
              {formatDuration(currentTime)}
            </div>
            {activeEntry && (
              <div className="timer-info">
                <p><strong>Task:</strong> {activeEntry.task.text}</p>
                {activeEntry.workspace && (
                  <p><strong>Workspace:</strong> {activeEntry.workspace.name}</p>
                )}
                {activeEntry.description && (
                  <p><strong>Description:</strong> {activeEntry.description}</p>
                )}
                <p><strong>Started:</strong> {formatDate(activeEntry.startTime)}</p>
              </div>
            )}
          </div>

          {!activeEntry ? (
            <div className="timer-controls">
              <div className="form-group">
                <label>Select Task</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  required
                >
                  <option value="">Choose a task...</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.text} {task.totalTimeSpent > 0 && `(${timeAPI.formatDuration(task.totalTimeSpent)})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                />
              </div>

              <button 
                className="start-btn"
                onClick={handleStartTracking}
                disabled={loading || !selectedTask}
              >
                <Play size={16} />
                {loading ? 'Starting...' : 'Start Timer'}
              </button>
            </div>
          ) : (
            <div className="timer-controls">
              <button 
                className="stop-btn"
                onClick={handleStopTracking}
                disabled={loading}
              >
                <Square size={16} />
                {loading ? 'Stopping...' : 'Stop Timer'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'entries' && (
        <div className="entries-section">
          <div className="entries-header">
            <div className="entries-filters">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                placeholder="End Date"
              />
              <select
                value={filters.taskId}
                onChange={(e) => setFilters({...filters, taskId: e.target.value})}
              >
                <option value="">All Tasks</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.text}</option>
                ))}
              </select>
              <button onClick={loadTimeEntries} className="filter-btn">
                <Filter size={16} />
                Apply Filters
              </button>
            </div>
            <div className="entries-summary">
              <p><strong>Total Entries:</strong> {timeEntries.length}</p>
              <p><strong>Total Time:</strong> {timeAPI.formatDuration(getTotalHoursForPeriod())}</p>
            </div>
          </div>

          <div className="entries-list">
            {timeEntries.length === 0 ? (
              <div className="no-entries">
                <Clock size={48} />
                <p>No time entries found</p>
              </div>
            ) : (
              timeEntries.map(entry => (
                <div key={entry.id} className="entry-card">
                  {editingEntry === entry.id ? (
                    <EditEntryForm 
                      entry={entry}
                      onSave={(data) => handleEditEntry(entry.id, data)}
                      onCancel={() => setEditingEntry(null)}
                    />
                  ) : (
                    <>
                      <div className="entry-info">
                        <h4>{getTaskName(entry.taskId)}</h4>
                        {entry.description && <p className="entry-description">{entry.description}</p>}
                        <div className="entry-meta">
                          <span>{formatDate(entry.startTime)}</span>
                          {entry.endTime && (
                            <span> - {formatDate(entry.endTime)}</span>
                          )}
                          {entry.workspace && (
                            <span className="workspace-tag">{entry.workspace.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="entry-duration">
                        {entry.duration ? timeAPI.formatDuration(entry.duration) : 'Active'}
                      </div>
                      <div className="entry-actions">
                        <button 
                          onClick={() => setEditingEntry(entry.id)}
                          className="edit-btn"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="reports-section">
          <div className="reports-filters">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              placeholder="End Date"
            />
            <select
              value={filters.workspaceId}
              onChange={(e) => setFilters({...filters, workspaceId: e.target.value})}
            >
              <option value="">All Workspaces</option>
              {workspaces.map(workspace => (
                <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
              ))}
            </select>
            <button onClick={loadReports} className="filter-btn">
              <TrendingUp size={16} />
              Generate Reports
            </button>
          </div>

          <div className="reports-grid">
            <ReportCard 
              title="Time by User" 
              data={reports.byUser} 
              icon={<Users size={20} />}
            />
            <ReportCard 
              title="Time by Task" 
              data={reports.byTask} 
              icon={<Clock size={20} />}
            />
            <ReportCard 
              title="Time by Workspace" 
              data={reports.byWorkspace} 
              icon={<Calendar size={20} />}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EditEntryForm = ({ entry, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    description: entry.description || '',
    startTime: new Date(entry.startTime).toISOString().slice(0, 16),
    endTime: entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-entry-form">
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start Time</label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
};

const ReportCard = ({ title, data = {}, icon }) => {
  const entries = Object.entries(data);
  const totalHours = entries.reduce((sum, [, info]) => sum + info.totalHours, 0);

  return (
    <div className="report-card">
      <div className="report-header">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="report-summary">
        <p><strong>Total Hours:</strong> {totalHours.toFixed(2)}h</p>
        <p><strong>Categories:</strong> {entries.length}</p>
      </div>
      <div className="report-list">
        {entries.length === 0 ? (
          <p className="no-data">No data available</p>
        ) : (
          entries
            .sort((a, b) => b[1].totalHours - a[1].totalHours)
            .slice(0, 5)
            .map(([key, info]) => (
              <div key={key} className="report-item">
                <span className="report-name">{key.split(' (')[0]}</span>
                <span className="report-time">{info.totalHours.toFixed(2)}h</span>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default TimeTracker;