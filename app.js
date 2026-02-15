const STORAGE_KEY = "bankExamQuestions";

const questionForm = document.getElementById("questionForm");
const clearQuestionsBtn = document.getElementById("clearQuestions");
const jsonUpload = document.getElementById("jsonUpload");
const jsonPaste = document.getElementById("jsonPaste");
const importJsonBtn = document.getElementById("importJson");
const exportJsonBtn = document.getElementById("exportJson");
const importMode = document.getElementById("importMode");

const totalCount = document.getElementById("totalCount");
const currentNo = document.getElementById("currentNo");
const timer = document.getElementById("timer");

const startTestBtn = document.getElementById("startTest");
const nextBtn = document.getElementById("nextBtn");
const finishBtn = document.getElementById("finishBtn");
const questionCard = document.getElementById("questionCard");
const questionLabel = document.getElementById("questionLabel");
const optionsWrap = document.getElementById("optionsWrap");
const resultBox = document.getElementById("resultBox");
const emptyState = document.getElementById("emptyState");

let questions = loadQuestions();
let activeIndex = 0;
let userAnswers = [];
let startTime = null;
let timerInterval = null;

refreshCounts();

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = document.getElementById("questionText").value.trim();
  const options = ["optA", "optB", "optC", "optD"].map((id) =>
    document.getElementById(id).value.trim()
  );

  const answerValue = document.getElementById("correctAnswer").value;
  const answerIndex = Number(answerValue);

  if (
    !question ||
    options.some((option) => !option) ||
    answerValue === "" ||
    Number.isNaN(answerIndex)
  ) {
    alert("Please fill all question details.");
    return;
  }

  questions.push({ question, options, answerIndex });
  persistQuestions();
  questionForm.reset();
  refreshCounts();
});

clearQuestionsBtn.addEventListener("click", () => {
  if (!confirm("Remove all saved questions?")) return;
  questions = [];
  persistQuestions();
  resetTestUi();
  refreshCounts();
});

jsonUpload.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  importQuestionJson(text, importMode.value);
  jsonUpload.value = "";
});

importJsonBtn.addEventListener("click", () => {
  importQuestionJson(jsonPaste.value, importMode.value);
});

exportJsonBtn.addEventListener("click", () => {
  const data = {
    exportedAt: new Date().toISOString(),
    version: 1,
    questions,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bank-exam-questions.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

startTestBtn.addEventListener("click", () => {
  if (questions.length === 0) {
    alert("Add questions first.");
    return;
  }

  activeIndex = 0;
  userAnswers = Array(questions.length).fill(null);
  startTime = Date.now();
  runTimer();
  resultBox.classList.add("hidden");
  questionCard.classList.remove("hidden");
  emptyState.classList.add("hidden");
  renderQuestion();
});

nextBtn.addEventListener("click", () => {
  if (activeIndex < questions.length - 1) {
    activeIndex += 1;
    renderQuestion();
  } else {
    finishTest();
  }
});

finishBtn.addEventListener("click", finishTest);

function renderQuestion() {
  const current = questions[activeIndex];
  currentNo.textContent = `${activeIndex + 1}/${questions.length}`;
  questionLabel.textContent = `Q${activeIndex + 1}. ${current.question}`;

  optionsWrap.innerHTML = "";
  current.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    if (userAnswers[activeIndex] === index) btn.classList.add("selected");

    btn.addEventListener("click", () => {
      userAnswers[activeIndex] = index;
      renderQuestion();
    });

    optionsWrap.appendChild(btn);
  });
}

function finishTest() {
  if (!startTime) return;

  clearInterval(timerInterval);
  const correct = questions.filter((q, i) => q.answerIndex === userAnswers[i]).length;
  const wrong = userAnswers.filter((answer, i) => answer !== null && answer !== questions[i].answerIndex).length;
  const skipped = userAnswers.filter((answer) => answer === null).length;
  const score = ((correct / questions.length) * 100).toFixed(1);

  resultBox.innerHTML = `
    <h3>Test Result</h3>
    <p><strong>Score:</strong> ${score}%</p>
    <p><strong>Correct:</strong> ${correct} | <strong>Wrong:</strong> ${wrong} | <strong>Skipped:</strong> ${skipped}</p>
    <p><strong>Total Time:</strong> ${timer.textContent}</p>
  `;

  resultBox.classList.remove("hidden");
  questionCard.classList.add("hidden");
  startTime = null;
}

function refreshCounts() {
  totalCount.textContent = String(questions.length);
  if (questions.length === 0) {
    emptyState.classList.remove("hidden");
    questionCard.classList.add("hidden");
  }
}

function runTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
    const ss = String(elapsedSec % 60).padStart(2, "0");
    timer.textContent = `${mm}:${ss}`;
  }, 1000);
}

function importQuestionJson(text, mode = "append") {
  try {
    const parsed = JSON.parse(text);
    const payload = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(payload)) throw new Error("JSON must be an array or { questions: [] }.");

    const sanitized = payload.map((item) => {
      if (
        typeof item.question !== "string" ||
        !Array.isArray(item.options) ||
        item.options.length !== 4 ||
        typeof item.answerIndex !== "number" ||
        item.answerIndex < 0 ||
        item.answerIndex > 3
      ) {
        throw new Error("Invalid question object.");
      }

      return {
        question: item.question.trim(),
        options: item.options.map((option) => String(option).trim()),
        answerIndex: item.answerIndex,
      };
    });

    questions = mode === "replace" ? sanitized : [...questions, ...sanitized];
    persistQuestions();
    resetTestUi();
    refreshCounts();
    jsonPaste.value = "";
    alert(`${mode === "replace" ? "Loaded" : "Imported"} ${sanitized.length} questions.`);
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }
}

function persistQuestions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

function loadQuestions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function resetTestUi() {
  clearInterval(timerInterval);
  startTime = null;
  activeIndex = 0;
  userAnswers = [];
  timer.textContent = "00:00";
  currentNo.textContent = "0";
  resultBox.classList.add("hidden");
}
