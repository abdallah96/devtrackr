// Dynamic API base URL for development and production
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use relative URL (same domain)
    return process.env.REACT_APP_API_BASE_URL || 'https://devtrackr-one.vercel.app/api';
  }
  
  // In development, try to detect the backend port
  // You can also set this via environment variable
  const backendPort = process.env.REACT_APP_API_PORT || '5001';
  return `http://localhost:${backendPort}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Task API functions
export const taskAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },
  create: async (text, date) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, date }),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },
  update: async (id, completed) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },
  edit: async (id, text) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to edit task');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },
};

// Journal API functions
export const journalAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/journal`);
    if (!response.ok) throw new Error('Failed to fetch journal entries');
    return response.json();
  },
  create: async (text, date) => {
    const response = await fetch(`${API_BASE_URL}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, date }),
    });
    if (!response.ok) throw new Error('Failed to create journal entry');
    return response.json();
  },
  edit: async (id, text) => {
    const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to edit journal entry');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/journal?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete journal entry');
  },
}; 