import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateProjectForm from './components/CreateProjectForm';
import ProjectList from './components/ProjectList';
import './App.css';

function App() {
  const [serverStatus, setServerStatus] = useState('checking...');
  const [refreshProjects, setRefreshProjects] = useState(0);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/health');
        setServerStatus('connected ✅');
      } catch (error) {
        setServerStatus('disconnected ❌');
      }
    };
    checkServer();
  }, []);

  const handleProjectCreated = () => {
    setRefreshProjects(prev => prev + 1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <nav style={{ backgroundColor: '#2563eb', color: 'white', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            AI Project Manager
          </h1>
          <span style={{ fontSize: '0.875rem' }}>Backend: {serverStatus}</span>
        </div>
      </nav>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Welcome to AI Project Manager!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Modern project management with AI-powered features
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#dbeafe', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: '600', color: '#1e40af', margin: '0 0 0.5rem 0' }}>Smart Task Prioritization</h3>
              <p style={{ fontSize: '0.875rem', color: '#2563eb', margin: 0 }}>AI-powered task management</p>
            </div>
            <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: '600', color: '#166534', margin: '0 0 0.5rem 0' }}>Real-time Collaboration</h3>
              <p style={{ fontSize: '0.875rem', color: '#16a34a', margin: 0 }}>Team synchronization</p>
            </div>
            <div style={{ backgroundColor: '#faf5ff', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: '600', color: '#7c3aed', margin: '0 0 0.5rem 0' }}>Predictive Analytics</h3>
              <p style={{ fontSize: '0.875rem', color: '#a855f7', margin: 0 }}>Project completion forecasts</p>
            </div>
          </div>
        </div>
        
        <CreateProjectForm onProjectCreated={handleProjectCreated} />
        <ProjectList refresh={refreshProjects} />
      </main>
    </div>
  );
}

export default App;
