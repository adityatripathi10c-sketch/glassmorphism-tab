// ==========================================
// 1. DOM SELECTORS & REUSABLE STATE
// ==========================================
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

// Progress Ring DOM Selectors & Setup
const progressCircle = document.getElementById('progress-circle');
const progressPercentText = document.getElementById('progress-percent-text');
const radius = 40;
const circumference = 2 * Math.PI * radius; 

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// Timer Log DOM Selectors
const sessionCountDisplay = document.getElementById('session-count-display');
const sessionLogList = document.getElementById('session-log-list');

// Load Data Arrays from Browser Storage
let completedSessionsArray = JSON.parse(localStorage.getItem('myDashboardSessions')) || [];
let tasksArray = JSON.parse(localStorage.getItem('myDashboardTasks')) || [];

// ==========================================
// 2. TASK MANAGER ENGINE
// ==========================================
function renderUI() {
    taskList.innerHTML = '';
    
    tasksArray.forEach(function(task, index) {
        const taskItem = document.createElement('li');
        taskItem.style.display = "flex";
        taskItem.style.justifyContent = "space-between";
        taskItem.style.alignItems = "center";
        taskItem.style.marginTop = "10px";
        
        const leftContentWrapper = document.createElement('div');
        leftContentWrapper.style.display = "flex";
        leftContentWrapper.style.alignItems = "center";
        
        const bullet = document.createElement('div');
        bullet.className = 'task-bullet';
        if (task.completed) {
            bullet.style.backgroundColor = "#6b7280";
        }
        
        const taskSpan = document.createElement('span');
        taskSpan.textContent = task.text;
        taskSpan.style.cursor = "pointer";
        
        if (task.completed) {
            taskSpan.classList.add('completed');
        }
        
        taskSpan.addEventListener('click', function() {
            tasksArray[index].completed = !tasksArray[index].completed;
            saveAndRefresh();
        });
        
        leftContentWrapper.appendChild(bullet);
        leftContentWrapper.appendChild(taskSpan);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.style.padding = "4px 8px";
        deleteBtn.style.backgroundColor = "#ef4444";
        deleteBtn.style.color = "white";
        deleteBtn.style.fontSize = "12px";
        deleteBtn.style.marginLeft = "10px";
        
        deleteBtn.addEventListener('click', function() {
            tasksArray.splice(index, 1);
            saveAndRefresh();
        });
        
        taskItem.appendChild(leftContentWrapper);
        taskItem.appendChild(deleteBtn);
        taskList.appendChild(taskItem);
    });
    
    updateCounter();
}

function updateCounter() {
    const totalTasks = tasksArray.length;
    const completedTasks = tasksArray.filter(task => task.completed).length;
    
    let percentage = 0;
    if (totalTasks > 0) {
        percentage = Math.round((completedTasks / totalTasks) * 100);
    }
    
    progressPercentText.textContent = `${percentage}%`;
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function saveAndRefresh() {
    localStorage.setItem('myDashboardTasks', JSON.stringify(tasksArray));
    renderUI();
}

function addNewTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        taskInput.classList.add('input-error');
        setTimeout(function() {
            taskInput.classList.remove('input-error');
        }, 1500);
        return;
    }
    
    const newTaskObj = {
        text: taskText,
        completed: false
    };
    
    tasksArray.push(newTaskObj);
    taskInput.value = '';
    saveAndRefresh();
}

addButton.addEventListener('click', addNewTask);
taskInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addNewTask();
    }
});

// ==========================================
// 3. CUSTOM FOCUS TIMER ENGINE
// ==========================================
const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const modeButtons = document.querySelectorAll('.mode-btn');

let countdownInterval = null;
let isTimerRunning = false;
let currentSessionMinutes = 25; 
let totalSecondsLeft = currentSessionMinutes * 60; 

function updateTimerDisplay() {
    const minutes = Math.floor(totalSecondsLeft / 60);
    const seconds = totalSecondsLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

modeButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        if (isTimerRunning) {
            alert("Please pause the current session before switching focus modes!");
            return;
        }
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentSessionMinutes = parseInt(button.getAttribute('data-time'));
        resetTimer();
    });
});

function toggleTimer() {
    if (isTimerRunning) {
        clearInterval(countdownInterval);
        isTimerRunning = false;
        timerStartBtn.textContent = 'Start';
        timerStartBtn.style.backgroundColor = '#a78bfa';
    } else {
        isTimerRunning = true;
        timerStartBtn.textContent = 'Pause';
        timerStartBtn.style.backgroundColor = '#fbbf24'; 
        
        countdownInterval = setInterval(function() {
            if (totalSecondsLeft > 0) {
                totalSecondsLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(countdownInterval);
                if (currentSessionMinutes === 25) {
                    logCompletedSession(); 
                }
                alert("Time's up! Let's swap mode blocks to keep your brain fresh.");
                resetTimer();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(countdownInterval);
    isTimerRunning = false;
    totalSecondsLeft = currentSessionMinutes * 60;
    updateTimerDisplay();
    timerStartBtn.textContent = 'Start';
    timerStartBtn.style.backgroundColor = '#a78bfa';
}

timerStartBtn.addEventListener('click', toggleTimer);
timerResetBtn.addEventListener('click', resetTimer);

// ==========================================
// 4. FOCUS LOG ANALYTICS ENGINE
// ==========================================
function renderSessionsUI() {
    sessionLogList.innerHTML = '';
    sessionCountDisplay.textContent = `${completedSessionsArray.length} Session${completedSessionsArray.length === 1 ? '' : 's'}`;
    
    for (let i = completedSessionsArray.length - 1; i >= 0; i--) {
        const logItem = document.createElement('li');
        logItem.className = 'log-item';
        logItem.textContent = `✓ Focus Block Completed at ${completedSessionsArray[i].time}`;
        sessionLogList.appendChild(logItem);
    }
}

function logCompletedSession() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newSessionRecord = { time: timeString };
    completedSessionsArray.push(newSessionRecord);
    localStorage.setItem('myDashboardSessions', JSON.stringify(completedSessionsArray));
    renderSessionsUI();
}

// ==========================================
// 5. INITIALIZE APPLICATION BOOT
// ==========================================
renderUI();
renderSessionsUI();
updateTimerDisplay();
// ==========================================
// 5. LIVE API WEATHER MONITOR ENGINE
// ==========================================

function fetchLocalWeather() {
    const loadingEl = document.getElementById('weather-loading');
    const contentEl = document.getElementById('weather-content');
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');

    // Make an API request to fetch weather data as JSON format
    fetch('https://wttr.in/?format=j1')
        .then(function(response) {
            // Check if the connection request was successful
            if (!response.ok) {
                throw new Error("Weather service status error");
            }
            return response.json(); // Transform the incoming stream into a readable object
        })
        .then(function(data) {
            // Drill down into the weather dataset structure
            const currentCondition = data.current_condition[0];
            const temperatureCelsius = currentCondition.temp_C;
            const descriptionText = currentCondition.weatherDesc[0].value;
            
            // Map simple condition descriptions to visual emoji indicators
            let conditionEmoji = "☁️";
            const descLower = descriptionText.toLowerCase();
            if (descLower.includes("sun") || descLower.includes("clear")) {
                conditionEmoji = "☀️";
            } else if (descLower.includes("rain") || descLower.includes("shower")) {
                conditionEmoji = "🌧️";
            } else if (descLower.includes("snow")) {
                conditionEmoji = "❄️";
            } else if (descLower.includes("thunder") || descLower.includes("storm")) {
                conditionEmoji = "⚡";
            } else if (descLower.includes("fog") || descLower.includes("mist")) {
                conditionEmoji = "🌫️";
            }

            // Update DOM element values dynamically with real live parameters
            tempEl.textContent = `${temperatureCelsius}°C`;
            descEl.textContent = descriptionText;
            iconEl.textContent = conditionEmoji;

            // Swap visual screens: Hide loading text loader and blend card contents visible
            loadingEl.style.display = 'none';
            contentEl.style.display = 'flex';
        })
        .catch(function(error) {
            console.error("Failed to fetch weather data:", error);
            loadingEl.textContent = "Unable to load live weather parameters.";
        });
}

// Fire off the weather data network call immediately upon script boot initialization
fetchLocalWeather();