const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for projects
let projects = [
  {
    id: 1,
    title: "AI Project Manager Development",
    description: "Building a modern project management tool with AI capabilities",
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Website Redesign",
    description: "Updating company website with modern design and features",
    status: "paused",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Mobile App Development",
    description: "Creating cross-platform mobile application",
    status: "completed",
    createdAt: new Date().toISOString()
  }
];

// Mock data for tasks
let tasks = [
  {
    id: 1,
    projectId: 1,
    title: "Setup development environment",
    description: "Configure React, Node.js and database",
    status: "completed",
    priority: "high",
    complexity: 5,
    deadline: "2025-07-20",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    projectId: 1,
    title: "Implement user authentication",
    description: "JWT-based authentication system",
    status: "in_progress",
    priority: "high",
    complexity: 8,
    deadline: "2025-07-25",
    dependencies: [1],
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    projectId: 1,
    title: "Create dashboard UI",
    description: "Design and implement main dashboard",
    status: "todo",
    priority: "medium",
    complexity: 6,
    deadline: "2025-07-30",
    dependencies: [1, 2],
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    projectId: 2,
    title: "Design new homepage",
    description: "Create modern homepage design",
    status: "completed",
    priority: "high",
    complexity: 7,
    deadline: "2025-07-22",
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    projectId: 2,
    title: "Implement responsive layout",
    description: "Make website mobile-friendly",
    status: "todo",
    priority: "medium",
    complexity: 5,
    deadline: "2025-07-28",
    createdAt: new Date().toISOString()
  }
];

// Helper function to make HTTP requests
const makeRequest = async (url, method = 'GET', data = null) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Project Manager API', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Projects API endpoints
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const { title, description, status } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  
  const newProject = {
    id: Math.max(...projects.map(p => p.id), 0) + 1,
    title,
    description,
    status: status || 'active',
    createdAt: new Date().toISOString()
  };
  
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.get('/api/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const { title, description, status } = req.body;
  
  if (title) projects[projectIndex].title = title;
  if (description) projects[projectIndex].description = description;
  if (status) projects[projectIndex].status = status;
  
  res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects.splice(projectIndex, 1);
  res.json({ message: 'Project deleted successfully' });
});

// Tasks API endpoints
app.get('/api/projects/:id/tasks', (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  res.json(projectTasks);
});

app.post('/api/projects/:id/tasks', (req, res) => {
  const projectId = parseInt(req.params.id);
  const { title, description, priority, complexity, deadline } = req.body;
  
  const newTask = {
    id: Math.max(...tasks.map(t => t.id), 0) + 1,
    projectId,
    title,
    description,
    priority: priority || 'medium',
    complexity: complexity || 5,
    deadline,
    status: 'todo',
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// AI Integration endpoints
app.post('/api/projects/:id/ai-prioritize', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const aiResponse = await makeRequest('http://localhost:5001/api/ai/prioritize-tasks', 'POST', {
      tasks: projectTasks,
      project
    });
    
    res.json({ tasks: aiResponse.tasks });
  } catch (error) {
    console.error('AI prioritization error:', error);
    res.status(500).json({ error: 'AI prioritization failed' });
  }
});

app.post('/api/projects/:id/ai-predict', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const prediction = await makeRequest('http://localhost:5001/api/ai/predict-completion', 'POST', {
      project,
      tasks: projectTasks
    });
    
    res.json(prediction);
  } catch (error) {
    console.error('AI prediction error:', error);
    res.status(500).json({ error: 'AI prediction failed' });
  }
});

app.post('/api/projects/:id/ai-extract-tasks', async (req, res) => {
  try {
    const { text } = req.body;
    
    const extractedTasks = await makeRequest('http://localhost:5001/api/ai/extract-tasks', 'POST', {
      text
    });
    
    res.json(extractedTasks);
  } catch (error) {
    console.error('AI task extraction error:', error);
    res.status(500).json({ error: 'AI task extraction failed' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
