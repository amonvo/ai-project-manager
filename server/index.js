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
const projects = [
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
  const { title, description } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  
  const newProject = {
    id: projects.length + 1,
    title,
    description,
    status: 'active',
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
