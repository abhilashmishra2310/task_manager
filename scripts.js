// scripts.js

document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    // Fetch tasks from backend on page load
    fetchTasks();

    // Show add task modal
    addTaskBtn.addEventListener('click', () => {
        taskModal.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Add Task';
        document.getElementById('saveTaskBtn').textContent = 'Save Task';
        taskForm.reset();
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            taskModal.style.display = 'none';
        }
    });

    // Handle form submission
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const dueDate = document.getElementById('dueDate').value;

        if (title.trim() === '' || description.trim() === '' || dueDate.trim() === '') {
            alert('Please fill in all fields');
            return;
        }

        const taskData = {
            title: title,
            description: description,
            dueDate: dueDate
        };

        saveTask(taskData);
    });

    // Fetch tasks from backend
    function fetchTasks() {
        fetch('http://localhost:3000/tasks')
            .then(response => response.json())
            .then(tasks => {
                displayTasks(tasks);
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Display tasks in the UI
    function displayTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task');
            taskItem.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Due Date: ${task.dueDate}</p>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            `;
            taskItem.querySelector('.editBtn').addEventListener('click', () => editTask(task));
            taskItem.querySelector('.deleteBtn').addEventListener('click', () => deleteTask(task._id));
            taskList.appendChild(taskItem);
        });
    }

    // Save new task or update existing task
    function saveTask(taskData) {
        const url = taskForm.dataset.taskId ? `http://localhost:3000/tasks/${taskForm.dataset.taskId}` : 'http://localhost:3000/tasks';

        const method = taskForm.dataset.taskId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        })
            .then(response => response.json())
            .then(savedTask => {
                taskModal.style.display = 'none';
                fetchTasks();
                taskForm.reset();
            })
            .catch(error => console.error('Error saving task:', error));
    }

    // Edit task
    function editTask(task) {
        taskModal.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('saveTaskBtn').textContent = 'Update Task';
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description;
        document.getElementById('dueDate').value = task.dueDate;
        taskForm.dataset.taskId = task._id;
    }

    // Delete task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.status === 204) {
                        fetchTasks();
                    } else {
                        console.error('Failed to delete task');
                    }
                })
                .catch(error => console.error('Error deleting task:', error));
        }
    }
})