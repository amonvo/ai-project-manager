const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock AI algoritmus pro prioritizaci úkolů
const prioritizeTasks = (tasks, project) => {
  return tasks.map(task => {
    let priority = 0;
    
    // Faktor deadline (čím blíže deadline, tím vyšší priorita)
    if (task.deadline) {
      const daysUntilDeadline = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      priority += Math.max(0, 10 - daysUntilDeadline);
    }
    
    // Faktor složitosti (složitější úkoly = vyšší priorita)
    priority += task.complexity || 0;
    
    // Faktor důležitosti projektu
    const projectImportance = {
      'active': 5,
      'paused': 2,
      'completed': 0
    };
    priority += projectImportance[project.status] || 0;
    
    // Faktor závislostí
    priority += (task.dependencies?.length || 0) * 2;
    
    return {
      ...task,
      aiPriority: Math.min(priority, 10),
      priorityReason: generatePriorityReason(priority, task)
    };
  }).sort((a, b) => b.aiPriority - a.aiPriority);
};

const generatePriorityReason = (priority, task) => {
  const reasons = [];
  
  if (task.deadline) {
    const daysUntilDeadline = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline <= 3) reasons.push("Urgent deadline");
    else if (daysUntilDeadline <= 7) reasons.push("Approaching deadline");
  }
  
  if (task.complexity >= 7) reasons.push("High complexity");
  if (task.dependencies?.length > 0) reasons.push("Has dependencies");
  
  return reasons.length > 0 ? reasons.join(", ") : "Standard priority";
};

// Predikce dokončení projektu
const predictProjectCompletion = (project, tasks) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Průměrný čas dokončení úkolu (simulace)
  const avgTaskCompletionDays = 3;
  const remainingTasks = totalTasks - completedTasks;
  const estimatedDaysToComplete = remainingTasks * avgTaskCompletionDays;
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + estimatedDaysToComplete);
  
  // Rizikové faktory
  const riskFactors = [];
  if (progress < 30 && project.status === 'active') riskFactors.push("Low progress");
  if (remainingTasks > 20) riskFactors.push("High task count");
  if (project.status === 'paused') riskFactors.push("Project paused");
  
  return {
    progress: Math.round(progress),
    estimatedCompletion: completionDate.toISOString().split('T')[0],
    estimatedDaysRemaining: estimatedDaysToComplete,
    riskLevel: riskFactors.length > 1 ? 'high' : riskFactors.length === 1 ? 'medium' : 'low',
    riskFactors,
    confidence: Math.max(20, 100 - (riskFactors.length * 20))
  };
};

// NLP pro extrakci úkolů z textu
const extractTasksFromText = (text) => {
  const actionWords = ['create', 'build', 'implement', 'design', 'develop', 'test', 'deploy', 'fix', 'update', 'review'];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const extractedTasks = sentences
    .filter(sentence => actionWords.some(word => sentence.toLowerCase().includes(word)))
    .map((sentence, index) => ({
      id: `extracted_${index}`,
      title: sentence.trim(),
      description: `Auto-extracted from: "${sentence.trim()}"`,
      priority: 'medium',
      status: 'todo',
      aiGenerated: true
    }));
  
  return extractedTasks;
};

// API endpoints
app.post('/api/ai/prioritize-tasks', (req, res) => {
  const { tasks, project } = req.body;
  const prioritizedTasks = prioritizeTasks(tasks, project);
  res.json({ tasks: prioritizedTasks });
});

app.post('/api/ai/predict-completion', (req, res) => {
  const { project, tasks } = req.body;
  const prediction = predictProjectCompletion(project, tasks);
  res.json(prediction);
});

app.post('/api/ai/extract-tasks', (req, res) => {
  const { text } = req.body;
  const extractedTasks = extractTasksFromText(text);
  res.json({ tasks: extractedTasks });
});

app.get('/api/ai/health', (req, res) => {
  res.json({ status: 'AI service healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT}`);
});
