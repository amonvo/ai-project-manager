import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AIInsightsProps {
  projectId: number;
  onClose: () => void;
}

interface AIPrediction {
  progress: number;
  estimatedCompletion: string;
  estimatedDaysRemaining: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  confidence: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  complexity: number;
  deadline?: string;
  aiPriority?: number;
  priorityReason?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ projectId, onClose }) => {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [prioritizedTasks, setPrioritizedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prediction' | 'prioritization'>('prediction');

  useEffect(() => {
    fetchAIInsights();
  }, [projectId]);

  const fetchAIInsights = async () => {
    try {
      const [predictionResponse, prioritizationResponse] = await Promise.all([
        axios.post(`http://localhost:5000/api/projects/${projectId}/ai-predict`),
        axios.post(`http://localhost:5000/api/projects/${projectId}/ai-prioritize`)
      ]);
      
      setPrediction(predictionResponse.data);
      setPrioritizedTasks(prioritizationResponse.data.tasks);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#16a34a';
      case 'medium': return '#d97706';
      case 'high': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return '#dc2626';
    if (priority >= 6) return '#d97706';
    if (priority >= 4) return '#2563eb';
    return '#16a34a';
  };

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          🤖 AI analyzing project...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          padding: '2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
            🤖 AI Project Insights
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          padding: '0 2rem',
          display: 'flex',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('prediction')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              borderBottom: activeTab === 'prediction' ? '2px solid #2563eb' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'prediction' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            📊 Predictions
          </button>
          <button
            onClick={() => setActiveTab('prioritization')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              borderBottom: activeTab === 'prioritization' ? '2px solid #2563eb' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'prioritization' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🎯 Task Prioritization
          </button>
        </div>

        <div style={{ 
          flex: 1,
          overflow: 'auto',
          padding: '2rem'
        }}>
          {activeTab === 'prediction' && prediction && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Progress</h4>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                    {prediction.progress}%
                  </div>
                  <div style={{ 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '4px', 
                    height: '8px', 
                    marginTop: '0.5rem' 
                  }}>
                    <div style={{ 
                      backgroundColor: '#2563eb', 
                      height: '100%', 
                      borderRadius: '4px',
                      width: `${prediction.progress}%`
                    }} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Estimated Completion</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                    {new Date(prediction.estimatedCompletion).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {prediction.estimatedDaysRemaining} days remaining
                  </div>
                </div>

                <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Risk Level</h4>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: getRiskColor(prediction.riskLevel),
                    textTransform: 'capitalize'
                  }}>
                    {prediction.riskLevel}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {prediction.confidence}% confidence
                  </div>
                </div>
              </div>

              {prediction.riskFactors.length > 0 && (
                <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#dc2626' }}>⚠️ Risk Factors:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {prediction.riskFactors.map((factor, index) => (
                      <li key={index} style={{ color: '#dc2626', fontSize: '0.875rem' }}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prioritization' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                🎯 AI-Prioritized Tasks
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {prioritizedTasks.map((task, index) => (
                  <div key={task.id} style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    borderLeft: `4px solid ${getPriorityColor(task.aiPriority || 0)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 'bold',
                            color: getPriorityColor(task.aiPriority || 0)
                          }}>
                            #{index + 1}
                          </span>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{task.title}</h4>
                        </div>
                        <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                          {task.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            🎯 Priority: {task.aiPriority}/10
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            📊 Complexity: {task.complexity}/10
                          </span>
                          {task.deadline && (
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              📅 Due: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {task.priorityReason && (
                          <div style={{ 
                            marginTop: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#7c3aed',
                            fontStyle: 'italic'
                          }}>
                            💡 {task.priorityReason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
