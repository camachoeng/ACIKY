// --- Quiz Game Logic ---

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for quiz elements...');
    
    // Only initialize quiz if we're on a page that has the quiz elements
    const quizElement = document.getElementById('quiz');
    if (!quizElement) {
        console.log('Quiz element not found');
        return;
    }
    
    console.log('Quiz element found, initializing...');
    console.log('Questions available:', typeof questions !== 'undefined' ? questions.length : 'undefined');

    // --- Sectioning logic ---
    // Example: 5 sections, 10 questions each (adjust as needed)
    const SECTIONS = [
      { name: 'General', start: 0, end: 9 },
      { name: 'Mantras', start: 10, end: 19 },
      { name: 'Práctica', start: 20, end: 29 },
      { name: 'Chakras', start: 30, end: 39 },
      { name: 'Otros', start: 40, end: 49 }
    ];

    function getRandomQuestionsBySection(section, count = 10) {
      const arr = questions.slice(section.start, section.end + 1);
      const shuffled = arr.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // Select 10 random questions from each section
    function generateQuizQuestions() {
      let arr = [];
      SECTIONS.forEach(section => {
        arr = arr.concat(getRandomQuestionsBySection(section, 2)); // 2 per section for demo, change to 10 for full quiz
      });
      return arr;
    }

    let quizQuestions = generateQuizQuestions();

    // Get quiz elements
    const quizSection = document.getElementById('quiz');
    const nextBtn = document.getElementById('next-btn');
    const resultDiv = document.getElementById('result');
    const restartBtn = document.getElementById('restart-btn');
  const progressDiv = document.getElementById('progress');
  const journeyList = document.getElementById('journey-list');

  // Only initialize if quiz elements exist
  if (!quizSection || !nextBtn || !resultDiv || !restartBtn || !progressDiv || !journeyList) {
    return; // Exit if not on a page with quiz
  }

  let current = 0;
  let score = 0;
  let selected = null;
  let answered = false;
  let journey = Array(quizQuestions.length).fill(null); // null: not answered, true: correct, false: wrong

const renderJourney = () => {
  journeyList.innerHTML = '';
  quizQuestions.forEach((q, idx) => {
    let li = document.createElement('li');
    li.textContent = `Question ${idx + 1}`;
    if (journey[idx] === true) {
      li.classList.add('correct');
      li.textContent += ' ✔';
    } else if (journey[idx] === false) {
      li.classList.add('wrong');
      li.textContent += ' ✖';
    }
    journeyList.appendChild(li);
  });
};

const renderQuestion = () => {
  const q = quizQuestions[current];
  quizSection.innerHTML = `
    <div class="question">${q.question}</div>
    <div class="options">
      ${q.options.map((opt, i) => `<button class="option-btn" data-index="${i}">${opt}</button>`).join('')}
    </div>
  `;
  nextBtn.style.display = 'none';
  resultDiv.style.display = 'none';
  restartBtn.style.display = 'none';
  selected = null;
  answered = false;
  progressDiv.textContent = `Question ${current + 1} of ${quizQuestions.length}`;
  renderJourney();
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (answered) return;
      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'wrong', 'correct'));
      btn.classList.add('selected');
      selected = Number(btn.dataset.index);
      answered = true;
      // Check answer
      if (selected === q.answer) {
        journey[current] = true;
      } else {
        btn.classList.add('wrong');
        journey[current] = false;
      }
      renderJourney();
      nextBtn.style.display = 'block';
    });
  });
};

function showCongratsEffect() {
  resultDiv.innerHTML = `<div class="congrats-effect">🎉 ¡Felicidades! Obtuviste ${score} / ${quizQuestions.length}!</div>`;
  // Simple confetti effect
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = (Math.random() * 2) + 's';
    resultDiv.appendChild(confetti);
  }
}

const showResult = () => {
  quizSection.innerHTML = '';
  nextBtn.style.display = 'none';
  resultDiv.style.display = 'block';
  restartBtn.style.display = 'block';
  progressDiv.textContent = '';
  renderJourney();
  if (score >= 8) {
    showCongratsEffect();
  } else {
    resultDiv.innerHTML = `<div class="motivation">Obtuviste ${score} de ${quizQuestions.length} puntos. ¡Sigue estudiando y vuelve a intentarlo!</div>`;
  }
};


nextBtn.addEventListener('click', () => {
  if (selected === quizQuestions[current].answer) score++;
  current++;
  if (current < quizQuestions.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

restartBtn.addEventListener('click', () => {
  quizQuestions = generateQuizQuestions();
  current = 0;
  score = 0;
  selected = null;
  answered = false;
  journey = Array(quizQuestions.length).fill(null);
  renderQuestion();
});

renderQuestion();

}); // End DOMContentLoaded
