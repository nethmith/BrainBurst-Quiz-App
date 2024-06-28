const progressBar = document.querySelector(".progress-bar");
const progressText = document.querySelector(".progress-text");
const startBtn = document.querySelector(".start");
const numQuestions = document.querySelector("#num-questions");
const category = document.querySelector("#category");
const difficulty = document.querySelector("#difficulty");
const timePerQuestion = document.querySelector("#time");
const quiz = document.querySelector(".quiz");
const startScreen = document.querySelector(".start-screen");
const questionText = document.querySelector(".question");
const answersWrapper = document.querySelector(".answer-wrapper");
const questionNumber = document.querySelector(".number");
const submitBtn = document.querySelector(".submit");
const nextBtn = document.querySelector(".next");
const endScreen = document.querySelector(".end-screen");
const finalScore = document.querySelector(".final-score");
const totalScore = document.querySelector(".total-score");
const restartBtn = document.querySelector(".restart");

let questions = [];
let time = 30;
let score = 0;
let currentQuestion;
let timer;

const updateProgress = (value) => {
  const percentage = (value / time) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = value;
};

const startQuiz = async () => {
  const num = numQuestions.value;
  const cat = category.value;
  const diff = difficulty.value;
  
  startLoadingAnimation();
  
  try {
    const response = await fetch(`https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`);
    const data = await response.json();
    questions = data.results;
    
    setTimeout(() => {
      startScreen.classList.add("hide");
      quiz.classList.remove("hide");
      currentQuestion = 0;
      showQuestion(questions[currentQuestion]);
    }, 1000);
  } catch (error) {
    console.error("Error fetching questions:", error);
    alert("Failed to load questions. Please try again.");
  }
};

const showQuestion = (question) => {
  questionText.innerHTML = question.question;
  const answers = [...question.incorrect_answers, question.correct_answer];
  answers.sort(() => Math.random() - 0.5);
  
  answersWrapper.innerHTML = answers.map(answer => `
    <div class="answer">
      <span class="text">${answer}</span>
      <span class="checkbox">
        <i class="fas fa-check"></i>
      </span>
    </div>
  `).join("");
  
  questionNumber.innerHTML = `Question <span class="current">${currentQuestion + 1}</span>
    <span class="total">/${questions.length}</span>`;
  
  addAnswerListeners();
  
  time = parseInt(timePerQuestion.value);
  startTimer(time);
};

const addAnswerListeners = () => {
  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach(answer => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answersDiv.forEach(a => a.classList.remove("selected"));
        answer.classList.add("selected");
        submitBtn.disabled = false;
      }
    });
  });
};

const startTimer = (time) => {
  clearInterval(timer);
  timer = setInterval(() => {
    if (time === 3) playAudio("countdown.mp3");
    if (time >= 0) {
      updateProgress(time);
      time--;
    } else {
      checkAnswer();
    }
  }, 1000);
};

const startLoadingAnimation = () => {
  startBtn.textContent = "Loading";
  const loadingInterval = setInterval(() => {
    startBtn.textContent = startBtn.textContent.length === 10 ? "Loading" : startBtn.textContent + ".";
  }, 500);
};

const checkAnswer = () => {
  clearInterval(timer);
  const selectedAnswer = document.querySelector(".answer.selected");
  const answers = document.querySelectorAll(".answer");
  
  answers.forEach(answer => {
    const answerText = answer.querySelector(".text").textContent;
    if (answerText === questions[currentQuestion].correct_answer) {
      answer.classList.add("correct");
    }
  });
  
  if (selectedAnswer) {
    const answer = selectedAnswer.querySelector(".text").textContent;
    if (answer === questions[currentQuestion].correct_answer) {
      score++;
    } else {
      selectedAnswer.classList.add("wrong");
    }
  }
  
  answers.forEach(answer => answer.classList.add("checked"));
  submitBtn.style.display = "none";
  nextBtn.style.display = "block";
};

const nextQuestion = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion(questions[currentQuestion]);
    submitBtn.style.display = "block";
    nextBtn.style.display = "none";
  } else {
    showScore();
  }
};

const showScore = () => {
  endScreen.classList.remove("hide");
  quiz.classList.add("hide");
  finalScore.textContent = score;
  totalScore.textContent = `/ ${questions.length}`;
};

const playAudio = (src) => {
  new Audio(src).play();
};

startBtn.addEventListener("click", startQuiz);
submitBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", () => window.location.reload());

// Remove the defineProperty function as it's not related to core quiz functionality