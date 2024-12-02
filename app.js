// app.js
const createTodo = (title, description, dueDate, priority, notes = '', checklist = []) => ({
    title,
    description,
    dueDate,
    priority,
    notes,
    checklist,
    completed: false,
});

const createFolder = (name) => ({
    name,
    todos: [],
    addTodo(todo) {
        this.todos.push(todo);
    },
    removeTodo(todoTitle) {
        this.todos = this.todos.filter((todo) => todo.title !== todoTitle);
    },
});

// Application Logic
const appLogic = (() => {
    let folders = JSON.parse(localStorage.getItem('todoFolders')) || [createFolder('General')];
    let currentFolder = folders[0];

    const saveToStorage = () => {
        localStorage.setItem('todoFolders', JSON.stringify(folders));
    };

    const addFolder = (name) => {
        const folder = createFolder(name);
        folders.push(folder);
        saveToStorage();
        return folder;
    };

    const deleteFolder = (name) => {
        if (folders.length <= 1) {
            alert('You must have at least one folder.');
            return;
        }

        folders = folders.filter((folder) => folder.name !== name);
        if (currentFolder.name === name) {
            currentFolder = folders[0];
        }
        saveToStorage();
    };

    const findFolder = (name) => folders.find((folder) => folder.name === name);

    const setCurrentFolder = (name) => {
        currentFolder = findFolder(name);
    };

    const getCurrentFolder = () => currentFolder;

    return { folders, addFolder, deleteFolder, setCurrentFolder, getCurrentFolder, saveToStorage };
})();

// DOM Manipulation
const domLogic = (() => {
    const folderList = document.getElementById('folder-list');
    const todoList = document.getElementById('todo-list');
    const currentFolderTitle = document.getElementById('current-folder-title');

    const renderFolders = () => {
        folderList.innerHTML = ''; // Clear existing folder list
        appLogic.folders.forEach((folder) => {
            const li = document.createElement('li');
            li.textContent = folder.name;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-folder-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const confirmation = confirm(`Are you sure you want to delete the folder "${folder.name}"?`);
                if (confirmation) {
                    appLogic.deleteFolder(folder.name); // Delete folder
                    domLogic.renderFolders(); // Re-render folders
                    domLogic.renderTodos(); // Re-render todos
                    currentFolderTitle.textContent = appLogic.getCurrentFolder().name; // Update title
                }
            });

            li.appendChild(deleteBtn);
            li.addEventListener('click', () => {
                appLogic.setCurrentFolder(folder.name);
                renderTodos();
                currentFolderTitle.textContent = folder.name;
            });

            folderList.appendChild(li);
        });
    };

    const renderTodos = () => {
        todoList.innerHTML = '';
        const currentFolder = appLogic.getCurrentFolder();
        currentFolder.todos.forEach((todo) => {
            const li = document.createElement('li');
            li.classList.add('todo-item', todo.priority);
            li.textContent = `${todo.title} (Due: ${todo.dueDate})`;
            li.addEventListener('click', () => {
                alert(`Description: ${todo.description}`);
            });
            todoList.appendChild(li);
        });

        currentFolderTitle.textContent = currentFolder.name;
    };

    return { renderFolders, renderTodos };
})();

// Event Listeners
document.getElementById('add-folder-btn').addEventListener('click', () => {
    const name = prompt('Enter folder name:');
    if (name) {
        appLogic.addFolder(name);
        domLogic.renderFolders();
    }
});

document.getElementById('add-todo-btn').addEventListener('click', () => {
    const title = prompt('Enter todo title:');
    const description = prompt('Enter todo description:');
    const dueDate = prompt('Enter todo due date:');
    const priority = prompt('Enter todo priority (low, medium, high):');
    if (title && description && dueDate && priority) {
        const todo = createTodo(title, description, dueDate, priority);
        appLogic.getCurrentFolder().addTodo(todo);
        appLogic.saveToStorage();
        domLogic.renderTodos();
    }
});

// Initial Render
domLogic.renderFolders();
domLogic.renderTodos();

