// Questions with correct answers
const QUESTIONS = [
    {
        id: 1,
        text: "A frog jumps forward 2 steps, then back 1 step, then forward 2 steps again. If it starts at 0, where does it end?",
        type: "multiple",
        options: ["1", "2", "3", "4"],
        correctIndex: 2
    },
    {
        id: 2,
        text: "Amy is taller than Bob. Bob is taller than Carol. Dave is shorter than Carol. Who is the shortest?",
        type: "multiple",
        options: ["Amy", "Bob", "Carol", "Dave"],
        correctIndex: 3
    },
    {
        id: 3,
        text: "Complete the sequence: 1, 2, 4, 7, 11, ___",
        type: "multiple",
        options: ["14", "15", "16", "17"],
        correctIndex: 2
    },
    {
        id: 4,
        text: "If this arrow rotates 90° clockwise, which direction will it point? ↑",
        type: "multiple",
        options: ["→", "↓", "←"],
        correctIndex: 0
    },
    {
        id: 5,
        text: "Each shape has a value: ● = 2, ▲ = 3. What is the total value of: ● + ▲ + ● + ▲ ?",
        type: "multiple",
        options: ["6", "7", "8", "10"],
        correctIndex: 3
    },
    {
        id: 6,
        text: "A turtle is 10 steps from a rock. It moves half the distance to the rock each time. Will the turtle ever actually touch the rock?",
        type: "multiple",
        options: ["Yes", "No", "It gets very close but never quite touches"],
        correctIndex: 2
    },
    {
        id: 7,
        text: "A farmer has 17 sheep. All but 9 die. How many sheep are left?",
        type: "text",
        correctAnswer: "9"
    },
    {
        id: 8,
        text: "If the day after tomorrow is two days before Thursday, what day is today?",
        type: "multiple",
        options: ["Saturday", "Sunday", "Monday", "Tuesday"],
        correctIndex: 1
    },
    {
        id: 9,
        text: "You flip a fair coin three times. Which is more likely: Getting exactly two heads, or Getting three heads?",
        type: "multiple",
        options: ["Getting exactly two heads", "Getting three heads"],
        correctIndex: 0
    },
    {
        id: 10,
        text: "Start at the center of a compass. Move 2 steps north, 3 steps east, 2 steps south, 3 steps west. Where are you relative to the start?",
        type: "multiple",
        options: ["East", "West", "Same place", "None of these"],
        correctIndex: 2
    }
];

// Music groups
const MUSIC_GROUPS = [
    { id: 1, name: "Instrumental Concentration Music", file: "/audio/group1_instrumental.mp3" },
    { id: 2, name: "Upbeat Music with Lyrics", file: "/audio/group2_upbeat_lyrics.mp3" },
    { id: 3, name: "No Music (Control)", file: null }
];

// Global state
let assignedGroup = null;
let timerInterval = null;
let timeRemaining = 120; // 2 minutes in seconds
let musicPlayer = null;
let participantData = {};

// Page elements
const welcomePage = document.getElementById('welcomePage');
const surveyPage = document.getElementById('surveyPage');
const resultsPage = document.getElementById('resultsPage');
const startBtn = document.getElementById('startBtn');
const personalInfoForm = document.getElementById('personalInfoForm');
const personalInfoSection = document.getElementById('personalInfoSection');
const surveySection = document.getElementById('surveySection');
const surveyForm = document.getElementById('surveyForm');
const timerDisplay = document.getElementById('timer');
const groupInfo = document.getElementById('groupInfo');
const resultsContent = document.getElementById('resultsContent');

// Event listeners
startBtn.addEventListener('click', showSurveyPage);
personalInfoForm.addEventListener('submit', beginSurvey);
surveyForm.addEventListener('submit', submitSurvey);

function showSurveyPage() {
    welcomePage.classList.remove('active');
    surveyPage.classList.add('active');
}

function beginSurvey(e) {
    e.preventDefault();
    
    // Collect personal information (name removed)
    participantData.name = "Anonymous"; // Default name since field removed
    participantData.ageRange = document.getElementById('ageRange').value;
    participantData.gender = document.querySelector('input[name="gender"]:checked').value;
    participantData.timestamp = new Date().toISOString();
    
    // Randomly assign group
    assignedGroup = MUSIC_GROUPS[Math.floor(Math.random() * MUSIC_GROUPS.length)];
    participantData.group = assignedGroup.id;
    participantData.groupName = assignedGroup.name;
    
    // Hide personal info form, show survey
    personalInfoSection.style.display = 'none';
    surveySection.style.display = 'block';
    
    // Update group info display
    groupInfo.textContent = `Group ${assignedGroup.id}: ${assignedGroup.name}`;
    
    // Start music if applicable
    if (assignedGroup.file) {
        musicPlayer = document.getElementById('musicPlayer');
        musicPlayer.src = assignedGroup.file;
        musicPlayer.play().catch(err => {
            console.log('Autoplay prevented. Music will start on user interaction.');
        });
    }
    
    // Start timer
    startTimer();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Warning when 30 seconds left
        if (timeRemaining === 30) {
            timerDisplay.classList.add('warning');
        }
        
        // Auto-submit when time runs out
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            autoSubmitSurvey();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function stopMusic() {
    if (musicPlayer) {
        musicPlayer.pause();
        musicPlayer.currentTime = 0;
    }
}

function autoSubmitSurvey() {
    // Trigger form submission
    submitSurvey(null, true);
}

function submitSurvey(e, isAutoSubmit = false) {
    if (e) {
        e.preventDefault();
    }
    
    // Stop timer and music
    stopTimer();
    stopMusic();
    
    // Collect answers
    const answers = [];
    let correctCount = 0;
    
    QUESTIONS.forEach((question, index) => {
        const questionNum = index + 1;
        let userAnswer = null;
        let isCorrect = false;
        
        if (question.type === "multiple") {
            const selected = document.querySelector(`input[name="q${questionNum}"]:checked`);
            if (selected) {
                userAnswer = parseInt(selected.value);
                isCorrect = userAnswer === question.correctIndex;
            }
        } else if (question.type === "text") {
            const textInput = document.querySelector(`input[name="q${questionNum}"]`);
            if (textInput) {
                userAnswer = textInput.value.trim();
                // Case-insensitive comparison
                isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
            }
        }
        
        if (isCorrect) {
            correctCount++;
        }
        
        answers.push({
            questionId: question.id,
            questionText: question.text,
            userAnswer: userAnswer,
            correctAnswer: question.type === "multiple" ? question.correctIndex : question.correctAnswer,
            isCorrect: isCorrect
        });
    });
    
    // Calculate score
    const percentage = Math.round((correctCount / QUESTIONS.length) * 100);
    
    participantData.answers = answers;
    participantData.score = correctCount;
    participantData.totalQuestions = QUESTIONS.length;
    participantData.percentage = percentage;
    participantData.timeSpent = 120 - timeRemaining;
    participantData.autoSubmitted = isAutoSubmit;
    
    // Show results
    displayResults();
    
    // Send data to backend
    sendDataToBackend();
}

function displayResults() {
    surveyPage.classList.remove('active');
    resultsPage.classList.add('active');
    
    const { score, totalQuestions, percentage, groupName } = participantData;
    
    resultsContent.innerHTML = `
        <div class="score-display">${score} / ${totalQuestions}</div>
        <p><strong>Percentage:</strong> ${percentage}%</p>
        <p><strong>Your Group:</strong> ${groupName}</p>
        <p style="margin-top: 20px;">Your results have been recorded and sent to the research team.</p>
    `;
    
    window.scrollTo(0, 0);
}

async function sendDataToBackend() {
    try {
        const response = await fetch('/api/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(participantData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('Error submitting survey:', result.error);
        } else {
            console.log('Survey submitted successfully');
        }
    } catch (error) {
        console.error('Error sending data to backend:', error);
    }
}

// Prevent accidental page navigation
window.addEventListener('beforeunload', (e) => {
    if (surveySection.style.display === 'block' && timeRemaining > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});
