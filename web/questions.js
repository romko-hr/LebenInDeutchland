const fallbackQuestionTranslation =
  'Український переклад для цього питання ще додається. Зараз доступний німецький оригінал.';
const fallbackOptionTranslation = 'Український переклад цього варіанту ще додається.';

const quizQuestionBank = Array.isArray(window.quizQuestionBank) ? window.quizQuestionBank : [];
const quizQuestionOverrides = Array.isArray(window.quizQuestions) ? window.quizQuestions : [];

const quizTotal = document.querySelector('#quiz-total');
const questionProgress = document.querySelector('#question-progress');
const questionStage = document.querySelector('#question-stage');
const questionJumpList = document.querySelector('#question-jump-list');
const prevQuestionButton = document.querySelector('#prev-question');
const nextQuestionButton = document.querySelector('#next-question');

const questionState = new Map();
const overrideMap = new Map(quizQuestionOverrides.map((question) => [question.id, question]));

let quizQuestions = [];
let voiceCache = [];
let currentIndex = 0;

function loadVoices() {
  if (!('speechSynthesis' in window)) {
    voiceCache = [];
    return;
  }

  voiceCache = window.speechSynthesis.getVoices();
}

function getGermanVoice() {
  return (
    voiceCache.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('de')) ||
    null
  );
}

function speakGerman(text) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  loadVoices();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.92;

  const voice = getGermanVoice();
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function stateFor(questionId) {
  if (!questionState.has(questionId)) {
    questionState.set(questionId, {
      selectedIndex: null,
      showTranslation: false
    });
  }

  return questionState.get(questionId);
}

function questionIndexFromHash() {
  const hash = window.location.hash.replace('#', '');
  const match = /^question-(\d+)$/.exec(hash);

  if (!match) {
    return 0;
  }

  const questionId = Number(match[1]);
  const foundIndex = quizQuestions.findIndex((question) => question.id === questionId);
  return foundIndex >= 0 ? foundIndex : 0;
}

function syncHash() {
  const question = quizQuestions[currentIndex];
  if (!question) {
    return;
  }

  const nextHash = `#question-${question.id}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(null, '', nextHash);
  }
}

function setCurrentIndex(index) {
  if (!quizQuestions.length) {
    return;
  }

  const nextIndex = Math.max(0, Math.min(index, quizQuestions.length - 1));
  currentIndex = nextIndex;
  syncHash();
  renderQuestionView();
}

function applyAnswer(questionId, selectedIndex) {
  const state = stateFor(questionId);
  state.selectedIndex = selectedIndex;
  renderQuestionView();
}

function resetAnswer(questionId) {
  const state = stateFor(questionId);
  state.selectedIndex = null;
  renderQuestionView();
}

function toggleTranslation(questionId) {
  const state = stateFor(questionId);
  state.showTranslation = !state.showTranslation;
  renderQuestionView();
}

function parseTsv(text) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split('\n');
  const header = lines.shift().split('\t');

  return lines.map((line) => {
    const cells = line.split('\t');
    const row = {};
    header.forEach((key, index) => {
      row[key] = (cells[index] || '').replace(/^"|"$/g, '').replace(/""/g, '"');
    });
    return row;
  });
}

function buildQuestionFromSource(baseQuestion, override) {
  const options = (baseQuestion.options || []).map((option, index) => ({
    de: override?.options?.[index]?.de || option.de,
    uk: override?.options?.[index]?.uk || option.uk || fallbackOptionTranslation
  }));

  const correctIndex = Number.isInteger(override?.correctIndex)
    ? override.correctIndex
    : Number.isInteger(baseQuestion.correctIndex)
      ? baseQuestion.correctIndex
      : null;
  const questionUk = override?.questionUk || baseQuestion.questionUk || fallbackQuestionTranslation;

  const hasTranslations =
    questionUk !== fallbackQuestionTranslation &&
    options.length > 0 &&
    options.every((option) => option.uk && option.uk !== fallbackOptionTranslation);

  return {
    id: baseQuestion.id,
    questionDe: override?.questionDe || baseQuestion.questionDe,
    questionUk,
    options,
    correctIndex,
    hasFullSupport: Number.isInteger(correctIndex) && hasTranslations
  };
}

function buildQuestionFromRow(row) {
  const id = Number(row.question_id);
  const override = overrideMap.get(id);
  const rawOptions = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);

  return buildQuestionFromSource(
    {
      id,
      questionDe: row.question_text,
      questionUk: fallbackQuestionTranslation,
      options: rawOptions.map((optionDe) => ({
        de: optionDe,
        uk: fallbackOptionTranslation
      })),
      correctIndex: null
    },
    override
  );
}

async function loadAllQuestions() {
  if (quizQuestionBank.length) {
    return [...quizQuestionBank]
      .sort((left, right) => left.id - right.id)
      .map((question) => buildQuestionFromSource(question, overrideMap.get(question.id)));
  }

  const response = await fetch('../data/lid_questions_general_bayern.tsv');
  if (!response.ok) {
    throw new Error(`Failed to load question data: ${response.status}`);
  }

  const text = await response.text();
  return parseTsv(text).map(buildQuestionFromRow);
}

function buildQuestionCard(question) {
  const state = stateFor(question.id);
  const optionMarkup = question.options
    .map((option, index) => {
      const isAnswered = state.selectedIndex !== null;
      const isCorrectKnown = Number.isInteger(question.correctIndex);
      const isCorrect = isAnswered && isCorrectKnown && index === question.correctIndex;
      const isWrong =
        isAnswered &&
        isCorrectKnown &&
        state.selectedIndex === index &&
        state.selectedIndex !== question.correctIndex;
      const classNames = ['question-card__option'];

      if (isCorrect) {
        classNames.push('is-correct');
      }

      if (isWrong) {
        classNames.push('is-wrong');
      }

      return `
        <button
          class="${classNames.join(' ')}"
          type="button"
          data-index="${index}"
          ${isAnswered ? 'disabled' : ''}
        >
          <span class="question-card__option-letter">${String.fromCharCode(65 + index)}</span>
          <span>${option.de}</span>
        </button>
      `;
    })
    .join('');

  const translationOptions = question.options
    .map(
      (option, index) =>
        `<li><strong>${String.fromCharCode(65 + index)}.</strong> ${option.uk}</li>`
    )
    .join('');

  let feedbackText = '';
  let feedbackClass = '';

  if (state.selectedIndex !== null) {
    if (Number.isInteger(question.correctIndex)) {
      if (state.selectedIndex === question.correctIndex) {
        feedbackText = 'Правильно. Це вірна відповідь.';
        feedbackClass = 'is-correct';
      } else {
        feedbackText = 'Неправильно. Правильна відповідь підсвічена зеленим.';
        feedbackClass = 'is-wrong';
      }
    } else {
      feedbackText =
        'Для цього питання ключ відповіді ще не доданий. Наразі доступні повне німецьке формулювання і переклад-заготовка.';
    }
  }

  const supportPill = question.hasFullSupport
    ? '<span class="question-card__meta-pill">Є ключ і переклад</span>'
    : '<span class="question-card__meta-pill">Дані ще доповнюються</span>';

  const card = document.createElement('article');
  card.className = 'question-card question-card--single';
  card.innerHTML = `
    <div class="question-card__top">
      <span class="question-card__id">Питання ${question.id}</span>
      <div class="question-card__actions">
        <button class="question-card__btn question-card__btn--ghost" type="button">
          ${state.showTranslation ? 'Сховати українську' : 'Показати українською'}
        </button>
        <button class="question-card__btn question-card__btn--reset" type="button">
          Скинути
        </button>
        <button class="question-card__btn" type="button" data-role="speak">
          Вимова
        </button>
      </div>
    </div>
    <p class="question-card__text">${question.questionDe}</p>
    <div class="question-card__meta-row">
      <span class="question-card__meta-pill">Офіційне BAMF питання</span>
      <span class="question-card__meta-pill">4 варіанти відповіді</span>
      ${supportPill}
    </div>
    <div class="question-card__translation" ${state.showTranslation ? '' : 'hidden'}>
      <p class="question-card__translation-title">Український переклад</p>
      <p class="question-card__translation-text">${question.questionUk}</p>
      <ol class="question-card__translation-list">
        ${translationOptions}
      </ol>
    </div>
    <div class="question-card__options">
      ${optionMarkup}
    </div>
    <p class="question-card__feedback ${feedbackClass}">${feedbackText}</p>
  `;

  card.querySelector('.question-card__btn--ghost').addEventListener('click', () => {
    toggleTranslation(question.id);
  });

  card.querySelector('.question-card__btn--reset').addEventListener('click', () => {
    resetAnswer(question.id);
  });

  card.querySelector('[data-role="speak"]').addEventListener('click', () => {
    speakGerman(question.questionDe);
  });

  card.querySelectorAll('.question-card__option').forEach((button) => {
    button.addEventListener('click', () => {
      applyAnswer(question.id, Number(button.dataset.index));
    });
  });

  return card;
}

function renderJumpButtons() {
  questionJumpList.innerHTML = '';

  quizQuestions.forEach((question, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'question-jump__button';
    button.textContent = String(question.id);

    if (index === currentIndex) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      setCurrentIndex(index);
    });

    questionJumpList.append(button);
  });
}

function renderNavigation() {
  prevQuestionButton.disabled = currentIndex <= 0;
  nextQuestionButton.disabled = currentIndex >= quizQuestions.length - 1;
}

function renderQuestionView() {
  const question = quizQuestions[currentIndex];

  if (!question) {
    questionStage.innerHTML = '<div class="empty-state">Питання поки що не завантажені.</div>';
    questionProgress.textContent = 'Питання недоступні.';
    renderNavigation();
    renderJumpButtons();
    return;
  }

  questionProgress.textContent = `Показано питання ${currentIndex + 1} з ${quizQuestions.length}. Можна переходити кнопками або одразу вибрати номер нижче.`;
  questionStage.innerHTML = '';
  questionStage.append(buildQuestionCard(question));
  renderNavigation();
  renderJumpButtons();
}

async function initQuizPage() {
  quizTotal.textContent = '...';

  prevQuestionButton.addEventListener('click', () => {
    setCurrentIndex(currentIndex - 1);
  });

  nextQuestionButton.addEventListener('click', () => {
    setCurrentIndex(currentIndex + 1);
  });

  window.addEventListener('hashchange', () => {
    const nextIndex = questionIndexFromHash();
    if (nextIndex !== currentIndex) {
      currentIndex = nextIndex;
      renderQuestionView();
    }
  });

  try {
    quizQuestions = await loadAllQuestions();
    quizTotal.textContent = String(quizQuestions.length);
    currentIndex = questionIndexFromHash();
    syncHash();
    renderQuestionView();
  } catch (error) {
    quizTotal.textContent = '0';
    questionStage.innerHTML =
      '<div class="empty-state">Не вдалося завантажити питання. На GitHub Pages це повинно працювати; при локальному відкритті файлу браузер може блокувати читання TSV.</div>';
    questionProgress.textContent = 'Помилка завантаження питань.';
    renderNavigation();
    renderJumpButtons();
    console.error(error);
  }
}

initQuizPage();
