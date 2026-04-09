const curriculum = [
  {
    id: 'basic',
    title: '기초 자음',
    lessons: [
      { id: 1, sentence: '라라라, 노래를 불러요.', focus: 'ㄹ', tip: '혀끝을 윗잇몸에 살짝 닿았다가 빠르게 떼요.' },
      { id: 2, sentence: '나나나, 나는 나비를 봐요.', focus: 'ㄴ', tip: '혀끝을 윗잇몸에 붙이고 코로 울림을 느껴요.' },
      { id: 3, sentence: '사사사, 사자를 따라 해요.', focus: 'ㅅ', tip: '이 사이로 바람을 가늘게 보내요.' },
      { id: 4, sentence: '파파파, 파도를 봐요.', focus: 'ㅍ', tip: '입술을 붙였다가 강하게 터뜨려요.' },
    ],
  },
  {
    id: 'words',
    title: '단어 연결',
    lessons: [
      { id: 5, sentence: '오늘은 날씨가 맑아요.', focus: 'ㄹ', tip: '단어를 끊어서 또박또박.' },
      { id: 6, sentence: '학교에서 친구와 놀았어요.', focus: 'ㄴ', tip: '빨리 말하지 않고 박자 맞추기.' },
    ],
  },
  {
    id: 'final',
    title: '이중받침',
    lessons: [
      { id: 7, sentence: '앉고 읽고 넓게 웃어요.', focus: 'ㄵ/ㄺ/ㄼ', tip: '받침은 짧게, 다음 음절은 분명하게.' },
      { id: 8, sentence: '삶과 값도 또박또박 읽어요.', focus: 'ㄻ/ㅄ', tip: '입모양을 크게 하고 천천히.' },
    ],
  },
];

const articulationGuide = {
  ㄹ: {
    mouth: '👄 입을 살짝 벌리고 혀끝을 윗잇몸(앞니 뒤) 근처에 가볍게 닿게 해요.',
    steps: ['혀끝을 윗잇몸에 살짝 대기', '짧게 떼면서 "라"', '길게 끌지 않기'],
  },
  ㄴ: {
    mouth: '👄 입은 자연스럽게, 혀끝은 윗잇몸에 닿고 코 울림을 느껴요.',
    steps: ['혀끝 고정', '코로 울림 내기', '"나-나" 리듬으로 반복'],
  },
  ㅅ: {
    mouth: '👄 입꼬리를 살짝 당기고, 이 사이로 공기를 가늘게 내보내요.',
    steps: ['앞니를 가깝게', '바람을 얇게', '"사"를 짧고 선명하게'],
  },
  ㅍ: {
    mouth: '👄 입술을 붙였다가 "푸" 하고 터뜨리듯 열어요.',
    steps: ['입술 꼭 닫기', '숨 모으기', '한 번에 터뜨리기'],
  },
  'ㄵ/ㄺ/ㄼ': {
    mouth: '👄 받침은 짧게 닫고, 다음 소리로 매끄럽게 이어요.',
    steps: ['받침을 길게 끌지 않기', '다음 음절로 바로 연결', '천천히 정확하게'],
  },
  'ㄻ/ㅄ': {
    mouth: '👄 턱을 고정하고 입모양 변화를 크게 보여줘요.',
    steps: ['첫 받침 소리 인지', '두 번째 자음은 약하게', '문장 속에서 2~3회 반복'],
  },
  default: {
    mouth: '👄 입모양을 크게 보여주며 천천히 발음하면 아이가 따라 하기 쉬워요.',
    steps: ['소리 쪼개서 듣기', '천천히 따라 말하기', '정확해지면 속도 올리기'],
  },
};

const stageTabs = document.querySelector('#stageTabs');
const stageTemplate = document.querySelector('#stageTemplate');
const lessonList = document.querySelector('#lessonList');
const lessonTemplate = document.querySelector('#lessonTemplate');
const targetSentence = document.querySelector('#targetSentence');
const listenBtn = document.querySelector('#listenBtn');
const recordBtn = document.querySelector('#recordBtn');
const playbackBtn = document.querySelector('#playbackBtn');
const dailyMissionBtn = document.querySelector('#dailyMissionBtn');
const statusText = document.querySelector('#statusText');
const timerText = document.querySelector('#timerText');
const recognizedText = document.querySelector('#recognizedText');
const scoreMeter = document.querySelector('#scoreMeter');
const scoreText = document.querySelector('#scoreText');
const feedbackBox = document.querySelector('#feedbackBox');
const historyList = document.querySelector('#historyList');
const speedRange = document.querySelector('#speedRange');
const speedText = document.querySelector('#speedText');
const mouthGuide = document.querySelector('#mouthGuide');
const howToList = document.querySelector('#howToList');
const mouthStage = document.querySelector('#mouthStage');
const xpText = document.querySelector('#xpText');
const streakText = document.querySelector('#streakText');

let currentStageId = curriculum[0].id;
let currentLesson = null;
let timer = null;
let timerRemaining = 0;
let mediaRecorder = null;
let recordedBlobUrl = null;
let xp = 0;
let streak = 0;

const recognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    : null;

if (recognition) {
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    recognizedText.textContent = transcript;
    evaluateResult(transcript);
  };

  recognition.onerror = () => {
    statusText.textContent = '음성 인식 미지원/실패';
    feedbackBox.className = 'feedback warn';
    feedbackBox.textContent = '현재 브라우저에서 인식이 불안정해요. 내 목소리 듣기로 먼저 연습해요.';
  };
}

speedRange.addEventListener('input', () => {
  speedText.textContent = `${Number(speedRange.value).toFixed(2)}x`;
});

dailyMissionBtn.addEventListener('click', () => {
  const all = curriculum.flatMap((stage) => stage.lessons);
  const lesson = all[Math.floor(Math.random() * all.length)];
  currentStageId = curriculum.find((stage) => stage.lessons.some((item) => item.id === lesson.id)).id;
  renderStages();
  renderLessons();
  selectLesson(lesson.id);
  feedbackBox.className = 'feedback';
  feedbackBox.textContent = '오늘의 미션: 70점 이상 2번 연속 달성하면 무지개 뱃지 획득! 🌈';
});

listenBtn.addEventListener('click', () => {
  if (!currentLesson) return;
  speakSentence(currentLesson.sentence);
});

recordBtn.addEventListener('click', async () => {
  if (!currentLesson) return;
  if (recordBtn.dataset.mode !== 'recording') await startRecording();
  else stopRecording();
});

playbackBtn.addEventListener('click', () => {
  if (!recordedBlobUrl) return;
  new Audio(recordedBlobUrl).play();
});

function renderStages() {
  stageTabs.innerHTML = '';
  curriculum.forEach((stage) => {
    const btn = stageTemplate.content.firstElementChild.cloneNode(true);
    btn.textContent = stage.title;
    btn.classList.toggle('active', stage.id === currentStageId);
    btn.addEventListener('click', () => {
      currentStageId = stage.id;
      renderStages();
      renderLessons();
    });
    stageTabs.appendChild(btn);
  });
}

function renderLessons() {
  lessonList.innerHTML = '';
  const stage = curriculum.find((item) => item.id === currentStageId);
  stage.lessons.forEach((lesson) => {
    const btn = lessonTemplate.content.firstElementChild.cloneNode(true);
    btn.textContent = `[${lesson.focus}] ${lesson.sentence}`;
    btn.dataset.lessonId = lesson.id;
    btn.classList.toggle('active', currentLesson?.id === lesson.id);
    btn.addEventListener('click', () => selectLesson(lesson.id));
    lessonList.appendChild(btn);
  });
}

function selectLesson(lessonId) {
  currentLesson = curriculum.flatMap((stage) => stage.lessons).find((lesson) => lesson.id === lessonId);
  targetSentence.textContent = currentLesson.sentence;
  listenBtn.disabled = false;
  recordBtn.disabled = false;
  playbackBtn.disabled = true;
  recognizedText.textContent = '-';
  statusText.textContent = '문장 준비 완료';
  renderScore(0);
  renderGuide(currentLesson.focus);
  renderLessons();
}

function renderGuide(focus) {
  const guide = articulationGuide[focus] || articulationGuide.default;
  mouthGuide.textContent = guide.mouth;
  mouthStage.dataset.shape = articulationGuide[focus] ? focus : 'default';
  howToList.innerHTML = '';
  guide.steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    howToList.appendChild(li);
  });
}

function pickFriendlyVoice() {
  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('ko'));
  const preferred = voices.find((voice) => /female|여성|yuna|sora|nara/i.test(voice.name));
  return preferred || voices[0] || null;
}

function speakSentence(sentence) {
  if (!window.speechSynthesis) {
    feedbackBox.className = 'feedback warn';
    feedbackBox.textContent = '이 브라우저는 TTS를 지원하지 않아요.';
    return;
  }
  const utter = new SpeechSynthesisUtterance(sentence);
  utter.lang = 'ko-KR';
  utter.rate = Number(speedRange.value);
  const voice = pickFriendlyVoice();
  if (voice) utter.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    feedbackBox.className = 'feedback warn';
    feedbackBox.textContent = '마이크 권한을 허용해 주세요. (Chrome/Edge 권장)';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
      recordedBlobUrl = URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' }));
      playbackBtn.disabled = false;
      statusText.textContent = '녹음 저장 완료';

      if (!recognition || recognizedText.textContent === '-') {
        feedbackBox.className = 'feedback';
        feedbackBox.textContent = '음성 인식이 안 돼도 괜찮아요. "내 목소리 듣기"로 코치 목소리와 비교해 보세요.';
      }
    };

    mediaRecorder.start();
    recordBtn.dataset.mode = 'recording';
    recordBtn.textContent = '녹음 종료 ⏹';
    statusText.textContent = '녹음 중...';

    if (recognition) {
      try {
        recognition.start();
      } catch {
        // ignore duplicate starts
      }
    }

    startTimer(8);
  } catch {
    feedbackBox.className = 'feedback warn';
    feedbackBox.textContent = '마이크 권한이 거부되었어요. 브라우저 권한 설정에서 허용해 주세요.';
  }
}

function stopRecording() {
  clearInterval(timer);
  timerText.textContent = '0초';

  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (recognition) {
    try {
      recognition.stop();
    } catch {
      // ignore duplicate stops
    }
  }

  recordBtn.dataset.mode = 'idle';
  recordBtn.textContent = '녹음 시작 🎤';
}

function startTimer(seconds) {
  timerRemaining = seconds;
  timerText.textContent = `${timerRemaining}초`;
  clearInterval(timer);

  timer = setInterval(() => {
    timerRemaining -= 1;
    timerText.textContent = `${Math.max(timerRemaining, 0)}초`;
    if (timerRemaining <= 0) stopRecording();
  }, 1000);
}

function evaluateResult(transcript) {
  if (!currentLesson) return;
  const score = calculatePronunciationScore(currentLesson.sentence, transcript);
  renderScore(score);
  renderFeedback(score, currentLesson.tip, transcript, currentLesson.sentence);
  appendHistory(currentLesson.sentence, transcript, score);

  if (score >= 70) {
    streak += 1;
    xp += 10 + Math.round(score / 10);
  } else {
    streak = 0;
    xp += 3;
  }

  xpText.textContent = String(xp);
  streakText.textContent = String(streak);
}

function calculatePronunciationScore(expected, actual) {
  const cleanExpected = expected.replace(/[\s,.!?]/g, '');
  const cleanActual = actual.replace(/[\s,.!?]/g, '');
  if (!cleanActual) return 0;

  const distance = levenshtein(cleanExpected, cleanActual);
  const maxLen = Math.max(cleanExpected.length, cleanActual.length);
  return Math.round(Math.max(0, 1 - distance / maxLen) * 100);
}

function renderScore(score) {
  scoreMeter.value = score;
  scoreText.textContent = `${score}점`;
}

function renderFeedback(score, tip, actual, expected) {
  if (score >= 85) {
    feedbackBox.className = 'feedback good';
    feedbackBox.textContent = `완전 최고! ⭐ ${score}점\n다음 미션으로 넘어가요!`;
    return;
  }
  if (score >= 60) {
    feedbackBox.className = 'feedback';
    feedbackBox.textContent = `좋아요! ${score}점\n팁: ${tip}`;
    return;
  }

  feedbackBox.className = 'feedback warn';
  feedbackBox.textContent = `다시 도전해요! (${score}점)\n목표: "${expected}"\n인식: "${actual}"\n팁: ${tip}`;
}

function appendHistory(sentence, transcript, score) {
  const item = document.createElement('li');
  const stamp = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  item.textContent = `${stamp} | ${sentence} | 인식: ${transcript} | 점수: ${score}`;
  historyList.prepend(item);
  while (historyList.children.length > 8) historyList.removeChild(historyList.lastElementChild);
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

renderStages();
renderLessons();
renderGuide('default');
