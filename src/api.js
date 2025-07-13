// API base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-app-name.vercel.app/api'
  : 'http://localhost:5001/api';

// Auth token management
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Auth API functions
export const authAPI = {
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  
  register: async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Task API functions
export const taskAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },
  
  create: async (text, date) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, date }),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },
  
  update: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  }
};

// Journal API functions
export const journalAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/journal`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch journal entries');
    return response.json();
  },
  
  create: async (text, date) => {
    const response = await fetch(`${API_BASE_URL}/journal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, date }),
    });
    if (!response.ok) throw new Error('Failed to create journal entry');
    return response.json();
  }
};

// Workspace API functions
export const workspaceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch workspaces');
    return response.json();
  },
  
  create: async (name, description, color) => {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, color }),
    });
    if (!response.ok) throw new Error('Failed to create workspace');
    return response.json();
  },
  
  update: async (id, name, description, color) => {
    const response = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, color }),
    });
    if (!response.ok) throw new Error('Failed to update workspace');
    return response.json();
  },
  
  invite: async (workspaceId, email, role = 'member') => {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, role }),
    });
    if (!response.ok) throw new Error('Failed to invite user to workspace');
    return response.json();
  },
  
  getTeams: async (workspaceId) => {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/teams`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch teams');
    return response.json();
  },
  
  createTeam: async (workspaceId, name, description, color) => {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, color }),
    });
    if (!response.ok) throw new Error('Failed to create team');
    return response.json();
  }
};

// Google Calendar API functions
export const calendarAPI = {
  getAuthUrl: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/google/url`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get Google auth URL');
    return response.json();
  },
  callback: async (code) => {
    const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });
    if (!response.ok) throw new Error('Failed to authenticate with Google');
    return response.json();
  },
  getEvents: async (timeMin, timeMax) => {
    const params = new URLSearchParams();
    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);
    
    const response = await fetch(`${API_BASE_URL}/calendar/events?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch calendar events');
    return response.json();
  },
  sync: async () => {
    const response = await fetch(`${API_BASE_URL}/calendar/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to sync calendar');
    return response.json();
  }
};

// Time Tracking API functions
export const timeAPI = {
  startTracking: async (taskId, description = '') => {
    const response = await fetch(`${API_BASE_URL}/time/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskId, description }),
    });
    if (!response.ok) throw new Error('Failed to start time tracking');
    return response.json();
  },
  
  stopTracking: async (timeEntryId = null) => {
    const response = await fetch(`${API_BASE_URL}/time/stop`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ timeEntryId }),
    });
    if (!response.ok) throw new Error('Failed to stop time tracking');
    return response.json();
  },
  
  getActiveEntry: async () => {
    const response = await fetch(`${API_BASE_URL}/time/active`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get active time entry');
    return response.json();
  },
  
  getEntries: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.taskId) params.append('taskId', filters.taskId);
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userId) params.append('userId', filters.userId);
    
    const response = await fetch(`${API_BASE_URL}/time/entries?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch time entries');
    return response.json();
  },
  
  getReports: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);
    
    const response = await fetch(`${API_BASE_URL}/time/reports?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch time reports');
    return response.json();
  },
  
  updateEntry: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/time/entries/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update time entry');
    return response.json();
  },
  
  deleteEntry: async (id) => {
    const response = await fetch(`${API_BASE_URL}/time/entries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete time entry');
  },
  
  // Utility functions
  formatDuration: (seconds) => {
    if (!seconds) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },
  
  formatDurationDetailed: (seconds) => {
    if (!seconds) return '0:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}; 