import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AIInsights from './AIInsights';

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

interface ProjectListProps {
  refresh?: number;
}

const ProjectList: React.FC<ProjectListProps> = ({ refresh = 0 }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectForAI, setSelectedProjectForAI] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [refresh]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleDelete = async (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleUpdate = async (updatedProject: Project) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/${updatedProject.id}`, updatedProject);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading projects...</div>;
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Your Projects ({projects.length})
      </h2>
      
      {projects.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          No projects yet. Create your first project to get started!
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {projects.map((project) => (
            <div key={project.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
              {editingProject?.id === project.id ? (
                <EditProjectForm 
                  project={editingProject} 
                  onSave={handleUpdate}
                  onCancel={() => setEditingProject(null)}
                />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{project.title}</h3>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>{project.description}</p>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      backgroundColor: project.status === 'active' ? '#dcfce7' : project.status === 'completed' ? '#dbeafe' : '#fef3c7',
                      color: project.status === 'active' ? '#166534' : project.status === 'completed' ? '#1e40af' : '#92400e'
                    }}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => setSelectedProjectForAI(project.id)}
                      style={{
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      🤖 AI Insights
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedProjectForAI && (
        <AIInsights 
          projectId={selectedProjectForAI} 
          onClose={() => setSelectedProjectForAI(null)} 
        />
      )}
    </div>
  );
};

// Edit Project Form Component
interface EditProjectFormProps {
  project: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    status: project.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...project, ...formData });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '4px',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={2}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '4px',
            fontSize: '0.875rem',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          style={{ 
            padding: '0.5rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectList;