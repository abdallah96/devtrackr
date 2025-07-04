// Dynamic API base URL for development and production
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use relative URL (same domain)
    return process.env.REACT_APP_API_BASE_URL || 'https://devtrackr-one.vercel.app/api' || `https://devtrackr-ag.vercel.app/api`;
  }
  
  // In development, try to detect the backend port
  // You can also set this via environment variable
  const backendPort = process.env.REACT_APP_API_PORT || '5001';
  return `http://localhost:${backendPort}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth API functions
export const authAPI = {
  register: async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  },
  
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
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
  update: async (id, completed) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },
  edit: async (id, text) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to edit task');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },
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
  },
  edit: async (id, text) => {
    const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to edit journal entry');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/journal?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete journal entry');
  },
}; 