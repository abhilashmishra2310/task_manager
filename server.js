const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const conn=require("./keys").mongoURI
const cors = require('cors');
const URI='mongodb+srv://abhilash1225be20:Abhilash2310@cluster0.ogrdm7m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(URI)
  //  useNewUrlParser: true,
   // useUnifiedTopology: true

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Task Schema
const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: Date
});
const Task = mongoose.model('Task', taskSchema);

// Routes

// Retrieve all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new task
app.post('/tasks', async (req, res) => {
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Retrieve a single task by its ID
app.get('/tasks/:id', getTask, (req, res) => {
    res.json(res.task);
});

// Update an existing task
app.put('/tasks/:id', getTask, async (req, res) => {
    if (req.body.title != null) {
        res.task.title = req.body.title;
    }
    if (req.body.description != null) {
        res.task.description = req.body.description;
    }
    if (req.body.dueDate != null) {
        res.task.dueDate = req.body.dueDate;
    }

    try {
        const updatedTask = await res.task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a task
app.delete('/tasks/:id', getTask, async (req, res) => {
    try {
        await res.task.remove();
        res.status(204).json({ message: 'Deleted task' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware function to get task by ID
async function getTask(req, res, next) {
    let task;
    try {
        task = await Task.findById(req.params.id);
        if (task == null) {
            return res.status(404).json({ message: 'Cannot find task' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.task = task;
    next();
}

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
})