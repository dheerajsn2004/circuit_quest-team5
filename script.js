const questions = [
    { q: "I balance between extremes, letting you turn fate with a twist, shifting resistance to your will. Who am I?", a: "Potentiometer", room: "AEC Lab" },
    { q: "A whisper of control at my gate unleashes a river beyond. I am the bridge between weak and strong signals. Who am I?", a: "BJT || Transistor", room: "Room 303" },
    { q: "I devour electrons and return them as brilliance, yet a wrong approach leaves me in darkness. What am I?", a: "LED", room: "Room 405" }
];

let attemptCounts = JSON.parse(localStorage.getItem("attemptCounts")) || Array(questions.length).fill(0);
let correctAnswersCount = JSON.parse(localStorage.getItem("correctAnswersCount")) || 0;
let answeredQuestions = JSON.parse(localStorage.getItem("answeredQuestions")) || Array(questions.length).fill(false);
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || Array(questions.length).fill("");
let quizCompleted = JSON.parse(localStorage.getItem("quizCompleted")) || false;
let roomLocationStored = localStorage.getItem("roomLocation") || "";
let quizTimedOut = JSON.parse(localStorage.getItem("quizTimedOut")) || false;

let timeLeft = JSON.parse(localStorage.getItem("timeLeft"));
if (timeLeft === null) timeLeft = 180;

const timerElement = document.getElementById("timer");
const roomLocation = document.getElementById("roomLocation");
let timerInterval;

function startTimer() {
    if (quizCompleted) {
        timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
        return;
    }

    if (quizTimedOut) {
        endQuizDueToTimeout();
        return;
    }

    timerInterval = setInterval(() => {
        if (correctAnswersCount === questions.length) {
            clearInterval(timerInterval);
            timerElement.style.display = "none";
        } else if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endQuizDueToTimeout();
        } else {
            timeLeft--;
            localStorage.setItem("timeLeft", JSON.stringify(timeLeft));
            timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
        }
    }, 1000);

    localStorage.setItem("timerRunning", JSON.stringify(true));
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

function endQuizDueToTimeout() {
    localStorage.setItem("quizTimedOut", JSON.stringify(true));
    timerElement.innerText = "Time's Up!";
    timerElement.style.backgroundColor = "red";
    document.querySelectorAll("input, button").forEach((el) => el.disabled = true);
}

const questionContainer = document.getElementById("questionContainer");
questions.forEach((q, index) => {
    questionContainer.innerHTML += `
        <div class="question">
            <p>${q.q}</p>
            <input type="text" id="answer${index}" value="${userAnswers[index]}" placeholder="Your Answer" ${answeredQuestions[index] ? 'disabled' : ''}>
            <button onclick="checkAnswer(${index})" ${answeredQuestions[index] ? 'disabled' : ''}>Submit</button>
            <p id="feedback${index}" class="feedback" style="color: ${answeredQuestions[index] ? 'green' : 'white'};">
                ${answeredQuestions[index] ? "Correct!" : ""}
            </p>
            <p id="attempts${index}" class="attempt-message">Attempts: ${attemptCounts[index]}</p>
        </div>
    `;
});

function checkAnswer(index) {
    if (quizTimedOut) return;

    let answerInput = document.getElementById(`answer${index}`);
    let feedbackMessage = document.getElementById(`feedback${index}`);
    let attemptMessage = document.getElementById(`attempts${index}`);
    let button = document.querySelector(`.question:nth-child(${index + 1}) button`);

    let userAnswer = answerInput.value.trim().toLowerCase();
    let correctAnswers = questions[index].a.toLowerCase().split(" || ");

    if (!userAnswer) return;

    button.disabled = true;
    button.innerText = "Checking...";
    
    setTimeout(() => {
        attemptCounts[index]++;
        localStorage.setItem("attemptCounts", JSON.stringify(attemptCounts));

        if (correctAnswers.includes(userAnswer)) { 
            feedbackMessage.innerText = "Correct!";
            feedbackMessage.style.color = "green";
            answeredQuestions[index] = true;
            userAnswers[index] = userAnswer;
            answerInput.disabled = true;
            button.disabled = true;
            button.innerText = "Submitted";

            correctAnswersCount++;
            localStorage.setItem("correctAnswersCount", correctAnswersCount);
            localStorage.setItem("answeredQuestions", JSON.stringify(answeredQuestions));
            localStorage.setItem("userAnswers", JSON.stringify(userAnswers));

            if (correctAnswersCount === questions.length) {
                showCompletionMessage();
            }
        } else {
            feedbackMessage.innerText = "Incorrect! Try again.";
            feedbackMessage.style.color = "red";
            button.disabled = false;
            button.innerText = "Submit";
        }

        attemptMessage.innerText = `Attempts: ${attemptCounts[index]}`;
    }, 1500);
}

function showCompletionMessage() {
    clearInterval(timerInterval);
    localStorage.setItem("timerRunning", JSON.stringify(false));

    let roomNumbers = questions.map((q, index) => 
        `<p><b>${q.room}</b> → ${userAnswers[index]}</p>` 
    ).join("");

    roomLocationStored = `<h3>🎉 Congratulations! You have successfully completed the quiz. 🎉</h3>
                          <p><b>Time Left: ${formatTime(timeLeft)}</b></p>
                          ${roomNumbers}`;
    
    localStorage.setItem("roomLocation", roomLocationStored);
    localStorage.setItem("quizCompleted", JSON.stringify(true));

    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";

    timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
    timerElement.style.color = "green";

    setTimeout(() => {
        document.getElementById("roomLocation").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000);
}

if (quizCompleted) {
    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";
    timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
} else if (quizTimedOut) {
    endQuizDueToTimeout();
} else {
    startTimer();
}