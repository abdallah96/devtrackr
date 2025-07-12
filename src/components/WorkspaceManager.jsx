import React, { useState, useEffect } from 'react';
import { workspaceAPI } from '../api';
import { Users, Plus, Settings, Trash2, UserPlus, Calendar } from 'lucide-react';
import './WorkspaceManager.css';

const WorkspaceManager = ({ user }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await workspaceAPI.getAll();
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (formData) => {
    try {
      const newWorkspace = await workspaceAPI.create(
        formData.name,
        formData.description,
        formData.color
      );
      setWorkspaces([...workspaces, newWorkspace]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInviteUser = async (formData) => {
    try {
      await workspaceAPI.invite(
        activeWorkspace.id,
        formData.email,
        formData.role
      );
      setShowInviteModal(false);
      loadWorkspaces(); // Refresh to show new member
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTeam = async (formData) => {
    try {
      await workspaceAPI.createTeam(
        activeWorkspace.id,
        formData.name,
        formData.description,
        formData.color
      );
      setShowTeamModal(false);
      loadWorkspaces(); // Refresh to show new team
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="workspace-loading">Loading workspaces...</div>;

  return (
    <div className="workspace-manager">
      <div className="workspace-header">
        <h2>Workspaces</h2>
        <button 
          className="create-workspace-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          Create Workspace
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="workspace-content">
        <div className="workspace-sidebar">
          <div className="workspace-list">
            {workspaces.map(workspace => (
              <div 
                key={workspace.id}
                className={`workspace-item ${activeWorkspace?.id === workspace.id ? 'active' : ''}`}
                onClick={() => setActiveWorkspace(workspace)}
              >
                <div 
                  className="workspace-color"
                  style={{ backgroundColor: workspace.color || '#6366f1' }}
                ></div>
                <div className="workspace-info">
                  <h3>{workspace.name}</h3>
                  <p>{workspace.description}</p>
                  <div className="workspace-stats">
                    <span><Users size={14} /> {workspace.members.length + 1}</span>
                    <span><Calendar size={14} /> {workspace._count.tasks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="workspace-main">
          {activeWorkspace ? (
            <div className="workspace-details">
              <div className="workspace-detail-header">
                <h3>{activeWorkspace.name}</h3>
                <div className="workspace-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UserPlus size={16} />
                    Invite User
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setShowTeamModal(true)}
                  >
                    <Plus size={16} />
                    Create Team
                  </button>
                </div>
              </div>

              <div className="workspace-sections">
                <div className="section">
                  <h4>Members ({activeWorkspace.members.length + 1})</h4>
                  <div className="members-grid">
                    <div className="member-card owner">
                      <div className="member-avatar">
                        {activeWorkspace.owner.name?.[0] || activeWorkspace.owner.email[0]}
                      </div>
                      <div className="member-info">
                        <h5>{activeWorkspace.owner.name || activeWorkspace.owner.email}</h5>
                        <span className="member-role">Owner</span>
                      </div>
                    </div>
                    {activeWorkspace.members.map(member => (
                      <div key={member.id} className="member-card">
                        <div className="member-avatar">
                          {member.user.name?.[0] || member.user.email[0]}
                        </div>
                        <div className="member-info">
                          <h5>{member.user.name || member.user.email}</h5>
                          <span className="member-role">{member.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section">
                  <h4>Teams ({activeWorkspace.teams.length})</h4>
                  <div className="teams-grid">
                    {activeWorkspace.teams.map(team => (
                      <div key={team.id} className="team-card">
                        <div 
                          className="team-color"
                          style={{ backgroundColor: team.color || '#8b5cf6' }}
                        ></div>
                        <div className="team-info">
                          <h5>{team.name}</h5>
                          <p>{team.description}</p>
                          <div className="team-stats">
                            <span><Users size={14} /> {team.members.length}</span>
                            <span><Calendar size={14} /> {team._count.tasks}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-workspace">
              <h3>No workspace selected</h3>
              <p>Select a workspace from the sidebar or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <WorkspaceModal
          title="Create Workspace"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateWorkspace}
        />
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteUser}
        />
      )}

      {/* Create Team Modal */}
      {showTeamModal && (
        <TeamModal
          title="Create Team"
          onClose={() => setShowTeamModal(false)}
          onSubmit={handleCreateTeam}
        />
      )}
    </div>
  );
};

const WorkspaceModal = ({ title, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Workspace Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InviteModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Invite User</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Invite</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeamModal = ({ title, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8b5cf6'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Team Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceManager;