import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading projects...</div>;
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '2rem', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Your Projects
      </h2>
      
      {projects.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          No projects yet. Create your first project to get started!
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {projects.map((project) => (
            <div key={project.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
