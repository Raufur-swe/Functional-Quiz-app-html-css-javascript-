// 🎯 Category Mapping (HTML এ যে টেক্সট আছে → OpenTDB category ID)
const categoryMap = {
  "Programming": 18,    // Science: Computers
  "Geography": 22,      // Geography
  "Mathematics": 19,    // Science: Mathematics
  "Entertainment": 11   // Entertainment: Film
};

// DOM elements
const configContainer = document.querySelector(".container");
const quizContainer = document.querySelector(".quiz-container");
const resultContainer = document.querySelector(".result-container");
const startBtn = document.querySelector(".start-quiz-btn");
const restartBtn = document.querySelector(".restart-btn");
const questionElement = document.querySelector(".quiz-question");
const optionsList = document.querySelector(".answer-question");
const nextBtn = document.querySelector(".next-question-btn");
const questionStatus = document.querySelector(".question-status");
const timerElement = document.querySelector(".timer-duration");
const resultScore = document.querySelector(".result-score");
const resultPercent = document.querySelector(".result-percent");
const resultMessage = document.querySelector(".result-message");

let questions = [];          
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

// Config options
let selectedCategory = "Programming"; 
let selectedAmount = 10; 

// 📌 Category option click
document.querySelectorAll(".category-option").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-option").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory = btn.textContent.trim();
  });
});

// 📌 Question amount option click
document.querySelectorAll(".question-option").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".question-option").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedAmount = parseInt(btn.textContent.trim());
  });
});

// 📌 HTML entities ডিকোড করার ফাংশন (OpenTDB data fix)
function decodeHTML(html) {
  let txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// 🎯 কুইজ শুরু
startBtn.addEventListener("click", async () => {
  configContainer.style.display = "none";
  quizContainer.style.display = "block";

  await loadQuestionsFromAPI(selectedAmount, categoryMap[selectedCategory]);
  
  currentQuestionIndex = 0;
  score = 0;
  loadQuestion();
  startTimer();
});

// 📌 API থেকে প্রশ্ন লোড করার ফাংশন
async function loadQuestionsFromAPI(amount, category) {
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.response_code !== 0) {
      throw new Error("No questions received from OpenTDB");
    }

    // API response কে আমাদের ফরম্যাটে রূপান্তর
    questions = data.results.map(q => {
      let options = [...q.incorrect_answers];
      const correctAnswer = q.correct_answer;
      const randomIndex = Math.floor(Math.random() * (options.length + 1));
      options.splice(randomIndex, 0, correctAnswer);

      return {
        question: decodeHTML(q.question),
        options: options.map(opt => decodeHTML(opt)),
        correct: randomIndex
      };
    });
  } catch (error) {
    alert("Failed to load questions from OpenTDB!");
    console.error(error);
  }
}

// প্রশ্ন লোড
function loadQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;
  currentQuestion.options.forEach((opt, index) => {
    const li = document.createElement("li");
    li.classList.add("answer-option");
    li.textContent = opt;
    li.addEventListener("click", () => selectAnswer(index, li));
    optionsList.appendChild(li);
  });
  questionStatus.innerHTML = `<b>${currentQuestionIndex + 1}</b> of <b>${questions.length}</b> questions`;
}

// আগের অপশন ক্লিয়ার
function resetState() {
  clearInterval(timer);
  timeLeft = 15;
  timerElement.textContent = `${timeLeft}s`;
  optionsList.innerHTML = "";
}

// উত্তর সিলেক্ট
function selectAnswer(index, element) {
  const correctIndex = questions[currentQuestionIndex].correct;
  const options = optionsList.querySelectorAll("li");
  options.forEach(opt => (opt.style.pointerEvents = "none"));

  if (index === correctIndex) {
    element.classList.add("correct");
    score++;
  } else {
    element.classList.add("wrong");
    options[correctIndex].classList.add("correct");
  }
}

// পরের প্রশ্ন
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
    startTimer();
  } else {
    showResult();
  }
});

// টাইমার
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextBtn.click();
    }
  }, 1000);
}

// রেজাল্ট দেখানো
function showResult() {
  quizContainer.style.display = "none";
  resultContainer.style.display = "block";

  resultScore.innerHTML = `You got <b>${score}</b> out of <b>${questions.length}</b>`;
  let percent = Math.round((score / questions.length) * 100);
  resultPercent.innerHTML = `Score: <b>${percent}%</b>`;
  resultMessage.textContent =
    percent >= 70 ? "Well Done! 👍" : percent >= 40 ? "Keep Practicing!" : "Better Luck Next Time!";
}

// রিস্টার্ট
restartBtn.addEventListener("click", () => {
  resultContainer.style.display = "none";
  configContainer.style.display = "block";
});
