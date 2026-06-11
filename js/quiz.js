/* ── State ──────────────────────────────────────── */
const state = {
  playerName: '',
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  selectedOption: null,
  answered: false
};

const POINTS_CORRECT = 10;

/* ── Helpers ────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.quiz-screen').forEach(el => {
    el.hidden = true;
  });
  document.getElementById(id).hidden = false;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(eintraege) {
  return eintraege.map(eintrag => {
    const correctOption = {
      filmtitel: eintrag.filmtitel,
      jahre: eintrag.jahre,
      isCorrect: true
    };
    const wrongOptions = (eintrag.falscheAntworten || []).map(f => ({
      filmtitel: f.filmtitel,
      jahre: f.jahre,
      isCorrect: false
    }));
    const options = shuffle([correctOption, ...wrongOptions]);
    return { eintrag, options };
  });
}

/* ── Welcome ────────────────────────────────────── */
function setupWelcome() {
  const form = document.getElementById('welcomeForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nameInput = document.getElementById('playerName');
    state.playerName = nameInput.value.trim() || 'Gast';
    startQuiz();
  });
}

/* ── Quiz start ─────────────────────────────────── */
function startQuiz() {
  state.questions = shuffle(buildQuestions(getAllEintraege()));
  state.score = 0;
  state.correctCount = 0;
  state.currentIndex = 0;
  showScreen('question');
  renderQuestion();
}

/* ── Render question ────────────────────────────── */
function renderQuestion() {
  state.answered = false;
  state.selectedOption = null;

  const total = state.questions.length;
  const idx = state.currentIndex;
  const { eintrag, options } = state.questions[idx];

  // Progress / score
  document.getElementById('qProgress').textContent = `Frage ${idx + 1} / ${total}`;
  document.getElementById('qScore').textContent = `${state.score} Punkte`;

  // Progress bar (progress so far = how many answered before this question)
  const pct = (idx / total) * 100;
  document.getElementById('progressBar').style.width = `${pct}%`;

  // Quote als Marquee-Schild
  const zitatBoard = document.getElementById('qZitatBoard');
  zitatBoard.innerHTML = '';
  const { sign } = buildMarqueeSign(eintrag.zitat, 16);
  zitatBoard.appendChild(sign);

  // Options
  const grid = document.getElementById('qOptions');
  grid.innerHTML = '';
  options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="option-title">${opt.filmtitel}</span><span class="option-year">${opt.jahre}</span>`;
    btn.addEventListener('click', () => selectOption(i));
    grid.appendChild(btn);
  });

  // Next button
  const btnNext = document.getElementById('btnNext');
  btnNext.hidden = true;
  btnNext.textContent = 'Nächste Frage →';

  // Feedback
  const feedback = document.getElementById('qFeedback');
  feedback.hidden = true;
  feedback.className = 'quiz-feedback';
  feedback.textContent = '';
}

/* ── Select option ──────────────────────────────── */
function selectOption(index) {
  if (state.answered) return;
  state.selectedOption = index;
  confirmAnswer();
}

/* ── Confirm answer ─────────────────────────────── */
function confirmAnswer() {
  if (state.selectedOption === null || state.answered) return;

  state.answered = true;

  const { options } = state.questions[state.currentIndex];
  const chosen = options[state.selectedOption];
  const isCorrect = chosen.isCorrect;

  if (isCorrect) {
    state.score += POINTS_CORRECT;
    state.correctCount += 1;
  }

  // Colour all buttons
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (options[i].isCorrect) {
      btn.classList.add('is-correct');
    } else if (i === state.selectedOption && !options[i].isCorrect) {
      btn.classList.add('is-wrong');
    }
  });

  // Feedback
  const { eintrag } = state.questions[state.currentIndex];
  const feedback = document.getElementById('qFeedback');
  feedback.hidden = false;
  const correctOpt = options.find(o => o.isCorrect);
  const posterHTML = eintrag.teaserBild
    ? `<img src="${eintrag.teaserBild}" alt="Filmplakat: ${correctOpt.filmtitel}" class="feedback-poster">`
    : '';
  const szeneHTML = eintrag.szeneBeschreibung
    ? `<p class="feedback-szene">${eintrag.szeneBeschreibung}</p>`
    : '';
  const werHTML = eintrag.werSagt
    ? `<p class="feedback-wer"><span class="feedback-wer-label">Wer sagt's?</span> ${eintrag.werSagt}</p>`
    : '';
  const detailsHTML = `<div class="feedback-details">${szeneHTML}${werHTML}</div>`;

  if (isCorrect) {
    feedback.classList.add('is-correct');
    feedback.innerHTML = `<div class="feedback-main"><div class="feedback-text"><strong>Richtig!</strong> +${POINTS_CORRECT} Punkte</div>${posterHTML}</div>${detailsHTML}`;
  } else {
    feedback.classList.add('is-wrong');
    feedback.innerHTML = `<div class="feedback-main"><div class="feedback-text"><strong>Leider falsch.</strong> Die richtige Antwort war:<br><em>${correctOpt.filmtitel} (${correctOpt.jahre})</em></div>${posterHTML}</div>${detailsHTML}`;
  }

  // Update score display
  document.getElementById('qScore').textContent = `${state.score} Punkte`;

  // Show next button
  const btnNext = document.getElementById('btnNext');
  btnNext.hidden = false;

  // Last question?
  if (state.currentIndex >= state.questions.length - 1) {
    btnNext.textContent = 'Ergebnis anzeigen';
  }
}

/* ── Next question ──────────────────────────────── */
function nextQuestion() {
  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) {
    showFinal();
  } else {
    renderQuestion();
  }
}

/* ── Final screen ───────────────────────────────── */
function showFinal() {
  showScreen('final');

  const total = state.questions.length;
  const maxScore = total * POINTS_CORRECT;
  const pct = maxScore > 0 ? (state.score / maxScore) * 100 : 0;

  document.getElementById('finalName').textContent = state.playerName;
  document.getElementById('finalCorrect').textContent = `${state.correctCount} / ${total}`;
  document.getElementById('finalScore').textContent = `${state.score} / ${maxScore}`;

  // Animate bar
  requestAnimationFrame(() => {
    document.getElementById('finalBar').style.width = `${pct}%`;
  });

  // Rating
  let rating;
  if (pct === 100) {
    rating = 'Perfekt – du kennst jeden Film auswendig!';
  } else if (pct >= 80) {
    rating = 'Hervorragend – du bist ein echter Film-Kenner!';
  } else if (pct >= 60) {
    rating = 'Gut gemacht – solide Filmkenntnis!';
  } else if (pct >= 40) {
    rating = 'Nicht schlecht – aber da geht noch mehr!';
  } else {
    rating = 'Schau dir die Wall of Fame nochmal an…';
  }
  const ratingEl = document.getElementById('finalRating');
  ratingEl.innerHTML = '';
  const { sign } = buildMarqueeSign(rating, 18);
  ratingEl.appendChild(sign);

  // Button listeners (replace to avoid duplicate bindings)
  const btnRetry = document.getElementById('btnRetry');
  const btnSave = document.getElementById('btnSave');
  btnRetry.replaceWith(btnRetry.cloneNode(true));
  btnSave.replaceWith(btnSave.cloneNode(true));

  document.getElementById('btnRetry').addEventListener('click', () => {
    showScreen('welcome');
  });
  document.getElementById('btnSave').addEventListener('click', saveResult);
  document.getElementById('resultEmail').addEventListener('input', () => {
    document.getElementById('resultEmail').classList.remove('is-invalid');
  });
}

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzrQmj2PZP7dHUIeNlJL8lAmJecWB11_DWJ2Bt2LO2D1Q1h2D8VonRHKAuaTpgY0vrUKA/exec';

/* ── Save result to Google Sheet ────────────────── */
async function saveResult() {
  const total = state.questions.length;
  const maxScore = total * POINTS_CORRECT;
  const emailInput = document.getElementById('resultEmail');
  const email = emailInput.value.trim();
  const btn = document.getElementById('btnSave');

  // E-Mail validieren (nur wenn ausgefüllt)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailInput.classList.add('is-invalid');
    emailInput.focus();
    return;
  }
  emailInput.classList.remove('is-invalid');

  btn.disabled = true;
  btn.textContent = 'Wird gespeichert…';

  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.playerName,
        correctAnswers: state.correctCount,
        score: state.score,
        maxScore,
        email
      })
    });
    btn.textContent = '✓ Gespeichert';
  } catch (err) {
    btn.textContent = 'Fehler – bitte nochmal';
    btn.disabled = false;
  }
}

/* ── Global event bindings ──────────────────────── */
function setupEvents() {
  document.getElementById('btnNext').addEventListener('click', nextQuestion);
}

/* ── Init ───────────────────────────────────────── */
async function init() {
  // Header deco bulbs
  const headerDeco = document.getElementById('headerDeco');
  if (headerDeco) {
    headerDeco.innerHTML = '';
    headerDeco.appendChild(buildBulbRow(36));
  }

  await loadData();
  setupWelcome();
  setupEvents();
  showScreen('welcome');
}

document.addEventListener('DOMContentLoaded', init);
