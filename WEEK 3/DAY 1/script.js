$(document).ready(function() {
    let tasks = [];
    let showCompleted = false;
    let sortByPriority = false;
    
    const saveTasks = () => {
        try {
            localStorage.setItem("tasks", JSON.stringify(tasks));
        } catch (error) {
            console.error("Error saving tasks: ", error);
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
    
    // UI 
    const renderTasks = () => {
        
        $("#tasks-container").children().not("#no-tasks-message").remove();
        
        let filteredTasks = [...tasks];
        if (!showCompleted) {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (sortByPriority) {
            filteredTasks.sort((a, b) => {
                const priorityOrder = {high: 0, medium: 1, low: 2};
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
        }
        
        if (filteredTasks.length === 0) {
            $("#no-tasks-message").show();
        } else {
            $("#no-tasks-message").hide();
        }
        
        filteredTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            $("#tasks-container").append(taskCard);
        });
        
        // Drag & Drop 
        bindDragAndDropEvents();
    };
    
    
    const createTaskCard = (task) => {
        const priorityText = {
            low: "Low",
            medium: "Medium",
            high: "High",
        };
        
        const $taskCard = $("<div>")
            .addClass(`task-card ${task.priority}-priority ${task.completed ? 'completed' : ''}`)
            .attr("data-id", task.id)
            .attr("draggable", "true");
            
        const $priorityBadge = $("<span>")
            .addClass(`priority-badge ${task.priority}`)
            .text(priorityText[task.priority]);
            
        const $taskTitle = $("<h3>")
            .addClass("task-title")
            .text(task.title);
            
        const $taskDescription = $("<p>")
            .addClass("task-description")
            .text(task.description || 'No description');
            
        const $taskActions = $("<div>").addClass("task-actions");
        
        const $completeBtn = $("<button>")
            .addClass("btn-complete")
            .attr("data-action", "complete")
            .append($("<i>").addClass(`fas ${task.completed ? 'fa-undo' : 'fa-check'}`));
            
        const $deleteBtn = $("<button>")
            .addClass("btn-delete")
            .attr("data-action", "delete")
            .append($("<i>").addClass("fas fa-trash"));
            
        $taskActions.append($completeBtn, $deleteBtn);
        
        $taskCard.append($priorityBadge, $taskTitle, $taskDescription, $taskActions);
        
        return $taskCard;
    };
    
    // new task
    const addTask = (event) => {
        event.preventDefault();
        
        try {
            // Form validation
            let isValid = true;
        
            if (!$("#task-title").val().trim()) {
                $("#title-error").text("Task title is mandatory").show();
                isValid = false;
            } else {
                $("#title-error").hide();
            }
            
            const selectedPriority = $("input[name='priority']:checked");
            if (selectedPriority.length === 0) {
                $("#priority-error").text("Please select a priority").show();
                isValid = false;
            } else {
                $("#priority-error").hide();
            }
            
            if (!isValid) return;
            
            const newTask = {
                id: Date.now().toString(),
                title: $("#task-title").val().trim(),
                description: $("#task-description").val().trim(),
                priority: selectedPriority.val(),
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.unshift(newTask); 
            saveTasks();
            renderTasks();
            
            // clear form
            $("#task-form")[0].reset();
            
            showNotification("Task added successfully");
            
        } catch (error) {
            console.error("Error adding task", error);
            showNotification("Error adding task", "error");
        }
    };
 
    const handleTaskAction = (event) => {
        const $actionButton = $(event.target).closest('button[data-action]');
        if ($actionButton.length === 0) return;
   
        event.stopPropagation();
        
        const action = $actionButton.attr("data-action");
        const $taskCard = $actionButton.closest(".task-card");
        const taskId = $taskCard.attr("data-id");
        
        if (action === 'complete') {
            toggleTaskComplete(taskId, $taskCard);
        } else if (action === "delete") {
            deleteTask(taskId, $taskCard);
        }
    };
    
    const toggleTaskComplete = (taskId, $taskCard) => {
        try {
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex === -1) return;
            
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            
            if (tasks[taskIndex].completed) {
                $taskCard.addClass("completing");
                $("#complete-sound")[0].play();
                
                setTimeout(() => {
                    $taskCard.removeClass("completing");
                    $taskCard.addClass("completed");
                    
                    setTimeout(() => {
                        saveTasks();
                        renderTasks();
                    }, 800);
                }, 500);
            } else {
                $taskCard.removeClass("completed");
                saveTasks();
                renderTasks();
            }
        } catch (error) {
            console.error("Error completing task", error);
            showNotification("Error completing task", "error");
        }
    };
    
    const deleteTask = (taskId, $taskCard) => {
        try {

            $taskCard.addClass("deleting");
            

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
    
    // Drag & Drop
    let draggedTask = null;
    
    const handleDragStart = function(event) {
        draggedTask = $(this);
        $(this).addClass('dragging');
        
        event.originalEvent.dataTransfer.effectAllowed = "move";
        event.originalEvent.dataTransfer.setData("text/plain", $(this).attr('data-id'));
    };
    
    const handleDragEnd = function() {
        $(this).removeClass('dragging');
        draggedTask = null;
    };
    
    const handleDragOver = function(event) {
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = "move";
    };
    
    const handleDrop = function(event) {
        event.preventDefault();
        
        if (!draggedTask) return;
        
        try {
            const $dropTarget = $(event.target).closest(".task-card");
            if ($dropTarget.length && !$dropTarget.is(draggedTask)) {
                const draggedId = draggedTask.attr("data-id");
                const targetId = $dropTarget.attr("data-id");
                
                const draggedIndex = tasks.findIndex(task => task.id === draggedId);
                const targetIndex = tasks.findIndex(task => task.id === targetId);
                
                const [movedTask] = tasks.splice(draggedIndex, 1);
                tasks.splice(targetIndex, 0, movedTask);
                
                saveTasks();
                renderTasks();
            }
        } catch (error) {
            console.error("Error during drag and drop", error);
        }
    };
    
    const bindDragAndDropEvents = () => {
        $(".task-card").on('dragstart', handleDragStart);
        $(".task-card").on('dragend', handleDragEnd);
    };

    const toggleCompletedFilter = () => {
        showCompleted = !showCompleted;
        $("#show-completed-btn").toggleClass("active", showCompleted);
        renderTasks();
    };
    
    const togglePrioritySort = () => {
        sortByPriority = !sortByPriority;
        $("#sort-priority-btn").toggleClass("active", sortByPriority);
        renderTasks();
    };

    const escapeHtml = (unsafe) => {
        return $("<div>").text(unsafe).html();
    };
    
    const showNotification = (message, type = 'success') => {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Gerçek projede daha gelişmiş bir bildirim sistemi ekleyebilirim!
    };
    

    $(document).on("visibilitychange", () => {
        if (document.hidden) {
            document.title = "Hey! Your tasks need you! ⏳";
        } else {
            document.title = "DoLister | Organize, Prioritize, Achieve!";
        }
    });
    

    loadTasks();
    

    $("#task-form").on("submit", addTask);
    
   
    $("#tasks-container").on('click', handleTaskAction);
    
  
    $("#tasks-container").on('dragover', handleDragOver);
    $("#tasks-container").on('drop', handleDrop);

    $("#show-completed-btn").on('click', toggleCompletedFilter);
    $("#sort-priority-btn").on('click', togglePrioritySort);
});
