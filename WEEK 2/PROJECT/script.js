// DOM Elements
const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const tasksContainer = document.getElementById("tasks-container");

const noTasksMessage = document.getElementById("no-tasks-message");

const showCompletedBtn = document.getElementById("show-completed-btn");
const sortPriorityBtn = document.getElementById("sort-priority-btn");
const completeSound = document.getElementById("complete-sound");
const titleError = document.getElementById("title-error");
const priorityError = document.getElementById("priority-error");



// Application State
let tasks = [];
let showCompleted = false; // means that initially completed tasks will be hidden
let sortByPriority = false;
let draggedTask = null;


// localStorage Func.
const saveTasks = () => {
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving tasks: ", error)
    }
};

const loadTasks = () => {
    try {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderTasks();
        }
    } catch (error) {
        console.error("Error loading tasks: ", error);
    }
};


// UI reload func.
const renderTasks = () => {
    // clear
    // taskContainer.innerHTML = "";
    while (tasksContainer.firstChild && tasksContainer.firstChild !== noTasksMessage){
        tasksContainer.removeChild(tasksContainer.firstChild);
    }
    //48-49-50. kod satırında render ederken sıkıntı var !!!

    // çözümü
    const childrenToRemove = Array.from(tasksContainer.children).filter(child => child !== noTasksMessage);
    childrenToRemove.forEach(child => tasksContainer.removeChild(child));

    // filetring and sorting
    let filteredTasks = [...tasks];
    if (!showCompleted) {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else {
        // Eğer "Show Completions" açıksa, sadece tamamlananları göster
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (sortByPriority) {
        filteredTasks.sort((a, b) => {
            const priorityOrder = {high: 0, medium: 1, low:2};
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    // show/hide empty list message
    if (filteredTasks.length === 0) {
        noTasksMessage.style.display = 'block';
    } 
    else {
        noTasksMessage.style.display = 'none';
    }

    // render tasks
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
};

// creating task card
const createTaskCard = (task) => {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
    taskCard.setAttribute("data-id", task.id);
    taskCard.draggable = true;

    const priorityText = {
        low: "Low",
        medium: "Medium",
        high: "High",
    };

    taskCard.innerHTML = `
        <span class="priority-badge ${task.priority}">${priorityText[task.priority]}</span>
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
        <p class="task-description">${escapeHtml(task.description || 'No description')}</p>
        <div class="task-actions">
            <button class="btn-complete" data-action="complete">
                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
            </button>
            <button class="btn-delete" data-action="delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Drag and Drop event listeners
    taskCard.addEventListener('dragstart', handleDragStart);
    taskCard.addEventListener('dragend', handleDragEnd);

    return taskCard;
};


// Add task func
const addTask = (event) => {
    event.preventDefault();

    try {
        // form validate
        let isValid = true;

        // title validate
        if (!taskTitle.value.trim()){
            titleError.textContent = "Task title is mandatory";
            titleError.style.display = "block";
            isValid = false;
        }
        else {
            titleError.style.display = "none";
        }

        // priority validate
        const selectedPriority = document.querySelector("input[name='priority']:checked");
        if (!selectedPriority) {
            priorityError.textContent = "Please select a priority";
            priorityError.style.display = "block";
            isValid = false;
        } else {
            priorityError.style.display = "none";
        }

        if (!isValid) return;

        // implement a new task
        const newTask = {
            id: Date.now().toString(),
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            priority: selectedPriority.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask); // new task on top
        saveTasks();
        renderTasks();

        // clear form
        taskForm.reset();

        showNotification("Task added successfully");
                
    } catch (error) {
        console.error("Error add task", error);
        showNotification('Error add task.', "error");
    }
};

// task complete / delete func
const handleTaskAction = (event) => {
    // find the clicked element with event del.
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) return;

    // stop event bubbling
    event.stopPropagation();

    const action = actionButton.getAttribute("data-action");
    const taskCard = actionButton.closest(".task-card");
    const taskId = taskCard.getAttribute("data-id");

    if (action === 'complete') {
        toggleTaskComplete(taskId, taskCard);
    }
    else if (action === "delete") {
        deleteTask(taskId, taskCard);
    }
};

const toggleTaskComplete = (taskId, taskCard) => {
    // try {
    //     // find the related task in the task list
    //     const taskIndex = tasks.findIndex(task => task.id === taskId);
    //     if (taskIndex === -1) return;

    //     tasks[taskIndex].completed = !tasks[taskIndex].completed;

    //     // give sound effect if task completed
    //     if (tasks[taskIndex].completed) {
    //         taskCard.classList.add("completing");
    //         completeSound.play();

    //         setTimeout(() => {
    //             taskCard.classList.remove("completing");
    //             taskCard.classList.add("completed");
    //         }, 800);
    //     } else {
    //         taskCard.classList.remove("completed");
    //     }

    //     // icon update
    //     const completeIcon = taskCard.querySelector(".btn-complete i");
    //     completeIcon.className = tasks[taskIndex].completed ? "fas fa-undo" : "fas fa-check";

    //     saveTasks();
    //     renderTasks();


    // } catch (error) {
    //     console.error("Error completing task", error);
    //     showNotification("Error completing task", "error");
    // }


    try {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;

        tasks[taskIndex].completed = !tasks[taskIndex].completed;

        if (tasks[taskIndex].completed) {
            taskCard.classList.add("completing");

            setTimeout(() => {
                taskCard.classList.remove("completing");
                taskCard.classList.add("completed");

                // 800ms sonra render et ve tamamlanmış görevi gizle
                setTimeout(() => {
                    saveTasks();
                    renderTasks();
                }, 800);
            }, 500);
        } else {
            taskCard.classList.remove("completed");
            saveTasks();
            renderTasks();
        }
    } catch (error) {
        console.error("Error completing task", error);
    }
};

const deleteTask = (taskId, taskCard) => {
    try {
        // delete animation:
        taskCard.classList.add("deleting"); // control in css file!!

        // remove task after animation
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();

            showNotification("Task deleted");
        }, 500);
    } catch (error) {
        console.error("Error deleting task", error);
        showNotification("Error deleting task", "error");
        
    }
};

// Drag&Drop
const handleDragStart = (event) => {
    draggedTask = event.target;
    event.target.classList.add('dragging');

    //
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", event.target.getAttribute('data-id'));
};

const handleDragEnd = (event) => {
    event.target.classList.remove('dragging');
    draggedTask = null;
};

const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
};

const handleDrop = (event) => {
    event.preventDefault();

    if (!draggedTask) return;

    try {
        const dropTarget = event.target.closest(".task-card");
        if (dropTarget && dropTarget !== draggedTask) {
            const draggedId = draggedTask.getAttribute("data-id");
            const targetId = dropTarget.getAttribute("data-id");

            const draggedIndex = tasks.findIndex(task => task.id === draggedId);
            const targetIndex = tasks.findIndex(task => task.id === targetId);

            const [movedTask] = tasks.splice(draggedIndex, 1);
            tasks.splice(targetIndex, 0, movedTask);

            saveTasks();
            renderTasks();
        }
    } catch (error) {
        console.error("Error drag drop", error);
    }
};


// Filtering and sorting
const toggleCompletedFilter = () => {
    showCompleted = !showCompleted;
    showCompletedBtn.classList.toggle("active", showCompleted)
    renderTasks();
}

const togglePrioritySort = () => {
    sortByPriority = !sortByPriority;
    sortPriorityBtn.classList.toggle("active", sortByPriority);
    renderTasks();
};

// other func
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const showNotification = (message, type = 'success') => {
    // Basit bir bildirim sistemi (opsiyonel)
    console.log(`${type.toUpperCase()}: ${message}`);
    // Gerçek projede daha gelişmiş bir bildirim sistemi eklenebilir
};



// let add visibilitychange
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.title = "Hey! Your tasks need you! ⏳";
    } else {
        document.title = "DoLister | Organize, Prioritize, Achieve!";
    }
});


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();

    taskForm.addEventListener("submit", addTask);

    tasksContainer.addEventListener('click', handleTaskAction);
    
    tasksContainer.addEventListener('dragover', handleDragOver);
    tasksContainer.addEventListener('drop', handleDrop);
    
    showCompletedBtn.addEventListener('click', toggleCompletedFilter);
    sortPriorityBtn.addEventListener('click', togglePrioritySort);


});

// ses animasyonu linki  --> iptal