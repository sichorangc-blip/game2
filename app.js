const gradeConfigs = [
  {
    id: 'g1',
    title: 'Grade 1: 기본 소리 준비',
    focus: 'ㄴ/ㅁ',
    tip: '코 울림을 느끼며 천천히 발음해요.',
    words: ['나무', '누나', '모자', '마늘', '미소', '나비', '메모', '모래', '나팔', '미나리'],
  },
  {
    id: 'g2',
    title: 'Grade 2: ㄹ-ㄴ 구분',
    focus: 'ㄹ↔ㄴ',
    tip: 'ㄹ은 혀를 튕기고, ㄴ은 혀를 붙인 채 코 울림을 유지해요.',
    words: ['라면', '나비', '로봇', '노트', '리본', '나래', '노랑', '러닝', '나라', '리듬'],
  },
  {
    id: 'g3',
    title: 'Grade 3: ㅅ 마찰음',
    focus: 'ㅅ',
    tip: '이 사이로 바람을 얇고 길게 보내요.',
    words: ['사탕', '소풍', '시소', '수박', '새싹', '소리', '시계', '선물', '사자', '솜사탕'],
  },
  {
    id: 'g4',
    title: 'Grade 4: ㅂ-ㅍ 폭발음',
    focus: 'ㅂ↔ㅍ',
    tip: 'ㅂ은 부드럽게, ㅍ은 강하게 터뜨려요.',
    words: ['바다', '파도', '바나나', '포도', '빵', '풍선', '바람', '파랑', '보물', '피아노'],
  },
  {
    id: 'g5',
    title: 'Grade 5: ㅈ-ㅊ 변별',
    focus: 'ㅈ↔ㅊ',
    tip: 'ㅊ에서 숨을 더 세게 내보내요.',
    words: ['자전거', '차표', '주스', '초코', '주머니', '치즈', '장난감', '책상', '자리', '창문'],
  },
  {
    id: 'g6',
    title: 'Grade 6: ㄱ-ㅋ 변별',
    focus: 'ㄱ↔ㅋ',
    tip: 'ㅋ 소리에서 손바닥으로 바람을 느껴요.',
    words: ['가위', '카드', '고기', '코끼리', '구름', '쿠키', '기차', '키위', '공원', '캠프'],
  },
  {
    id: 'g7',
    title: 'Grade 7: 받침 기초',
    focus: '받침 기초',
    tip: '받침은 짧게 닫고 다음 음절로 넘겨요.',
    words: ['밥', '꽃', '집', '책', '낮', '밭', '숲', '옷', '빛', '문'],
  },
  {
    id: 'g8',
    title: 'Grade 8: 이중받침 마스터',
    focus: 'ㄵ/ㄺ/ㄼ',
    tip: '복합받침은 길게 끌지 말고 대표 소리를 분명하게.',
    words: ['앉다', '읽다', '밟다', '넓다', '삶', '값', '젊다', '맑다', '닭', '읊다'],
  },
  {
    id: 'g9',
    title: 'Grade 9: 리듬 문장',
    focus: '리듬 말하기',
    tip: '문장을 3~4박자로 끊어 읽어요.',
    words: ['놀이터', '소풍길', '무지개', '별자리', '아침해', '달빛', '친구들', '노래', '산책', '미션'],
  },
  {
    id: 'g10',
    title: 'Grade 10: 스토리 챌린지',
    focus: '종합',
    tip: '정확도를 유지한 채 속도를 조금씩 올려요.',
    words: ['로봇', '사자', '탐험', '보물', '우주선', '성', '숲', '기차', '지도', '별'],
  },
];

const sentenceTemplates = [
  '{a}와 {b}를 또박또박 말해요.',
  '{a}를 보고 {b}를 따라 읽어요.',
  '{a} {b} 게임을 시작해요.',
  '오늘의 단어는 {a}, 그리고 {b}예요.',
  '{a} 소리를 내고 {b}로 이어가요.',
  '{a}를 천천히, {b}를 정확히 말해요.',
];

function buildCurriculum() {
  let id = 1;
  return gradeConfigs.map((grade) => {
    const lessons = [];
    for (let i = 0; i < 24; i += 1) {
      const a = grade.words[i % grade.words.length];
      const b = grade.words[(i + 3) % grade.words.length];
      const template = sentenceTemplates[i % sentenceTemplates.length];
      lessons.push({
        id,
        sentence: template.replace('{a}', a).replace('{b}', b),
        focus: grade.focus,
        tip: grade.tip,
      });
      id += 1;
    }
    return {
      id: grade.id,
      title: `${grade.title} (24문제)`,
      lessons,
    };
  });
}

const curriculum = buildCurriculum(); // 10 grades x 24 = 240 lessons

const articulationGuide = {
  'ㄴ/ㅁ': {
    mouth: '👄 코 울림을 느끼며 입술/혀를 안정적으로 유지해요.',
    steps: ['나-마 교차 연습', '코 울림 체크', '속도보다 정확도'],
  },
  'ㄹ↔ㄴ': {
    mouth: '👄 ㄹ은 혀를 튕기고, ㄴ은 혀를 붙여 코로 울려요.',
    steps: ['라/나 최소대립쌍', '혀 위치 차이 느끼기', '천천히 반복'],
  },
  ㅅ: {
    mouth: '👄 이 사이를 좁히고 바람을 얇게 보내요.',
    steps: ['앞니 가깝게', '바람 얇게', '사-서-소 반복'],
  },
  'ㅂ↔ㅍ': {
    mouth: '👄 ㅂ은 부드럽게, ㅍ은 입술 폭발을 크게.',
    steps: ['입술 닫기', 'ㅂ/ㅍ 교차', '문장 적용'],
  },
  'ㅈ↔ㅊ': {
    mouth: '👄 ㅊ이 ㅈ보다 공기량이 더 커요.',
    steps: ['자/차 비교', '손바닥 공기 체크', '단어 반복'],
  },
  'ㄱ↔ㅋ': {
    mouth: '👄 혀 뒤쪽 막음 후, ㅋ에서 강한 숨을 내요.',
    steps: ['가/카 비교', '공기량 체크', '속도 점진 증가'],
  },
  '받침 기초': {
    mouth: '👄 받침을 짧게 닫고 다음 음절로 자연스럽게 이동해요.',
    steps: ['받침 길게 끌지 않기', '음절 경계 인지', '짧은 단어 반복'],
  },
  'ㄵ/ㄺ/ㄼ': {
    mouth: '👄 이중받침은 대표음 위주로 또렷하게 내요.',
    steps: ['앉-다/읽-다 나눠 말하기', '경계 살리기', '문장 확장'],
  },
  '리듬 말하기': {
    mouth: '👄 입모양을 크게 하며 박자에 맞춰 말해요.',
    steps: ['3~4박자 끊기', '강세 위치 고정', '호흡 일정하게'],
  },
  종합: {
    mouth: '👄 정확도를 유지한 채 속도를 조금씩 올려요.',
    steps: ['느리게 정확히', '중간 속도', '실전 속도'],
  },
  default: {
    mouth: '👄 천천히, 크게, 또박또박이 기본이에요.',
    steps: ['입모양 크게', '소리 나누기', '반복 연습'],
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
const analysisList = document.querySelector('#analysisList');
const gradeText = document.querySelector('#gradeText');
const stickerText = document.querySelector('#stickerText');

let currentGradeIndex = 0;
let currentLesson = null;
let timer = null;
let timerRemaining = 0;
let mediaRecorder = null;
let recordedBlobUrl = null;
let xp = 0;
let streak = 0;
let stickerCount = 0;

const progression = curriculum.map(() => ({ unlockedLesson: 0, completed: false }));
let unlockedGradeIndex = 0;

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
}

speedRange.addEventListener('input', () => {
  speedText.textContent = `${Number(speedRange.value).toFixed(2)}x`;
});

dailyMissionBtn.addEventListener('click', () => {
  const p = progression[currentGradeIndex];
  selectLesson(curriculum[currentGradeIndex].lessons[p.unlockedLesson].id);
  feedbackBox.className = 'feedback';
  feedbackBox.textContent = `현재 Grade 도전! ${currentGradeIndex + 1}단계의 ${p.unlockedLesson + 1}번 문제를 클리어하세요.`;
});

listenBtn.addEventListener('click', () => currentLesson && speakSentence(currentLesson.sentence));
recordBtn.addEventListener('click', async () => {
  if (!currentLesson) return;
  if (recordBtn.dataset.mode !== 'recording') await startRecording();
  else stopRecording();
});
playbackBtn.addEventListener('click', () => recordedBlobUrl && new Audio(recordedBlobUrl).play());

function renderStages() {
  stageTabs.innerHTML = '';
  curriculum.forEach((stage, index) => {
    const btn = stageTemplate.content.firstElementChild.cloneNode(true);
    const locked = index > unlockedGradeIndex;
    btn.textContent = locked ? `${stage.title} 🔒` : stage.title;
    btn.disabled = locked;
    btn.classList.toggle('active', index === currentGradeIndex);
    btn.addEventListener('click', () => {
      if (locked) return;
      currentGradeIndex = index;
      renderStages();
      renderLessons();
      renderHeaderStats();
    });
    stageTabs.appendChild(btn);
  });
}

function renderLessons() {
  lessonList.innerHTML = '';
  const stage = curriculum[currentGradeIndex];
  const unlockedLesson = progression[currentGradeIndex].unlockedLesson;

  stage.lessons.forEach((lesson, idx) => {
    const btn = lessonTemplate.content.firstElementChild.cloneNode(true);
    const locked = idx > unlockedLesson;
    btn.textContent = locked ? `🔒 ${idx + 1}. 잠금` : `${idx + 1}. [${lesson.focus}] ${lesson.sentence}`;
    btn.disabled = locked;
    btn.classList.toggle('active', currentLesson?.id === lesson.id);
    btn.addEventListener('click', () => !locked && selectLesson(lesson.id));
    lessonList.appendChild(btn);
  });
}

function renderHeaderStats() {
  if (gradeText) {
    const p = progression[currentGradeIndex];
    gradeText.textContent = `Grade ${currentGradeIndex + 1} | 해금 ${p.unlockedLesson + 1}/${curriculum[currentGradeIndex].lessons.length}`;
  }
  if (stickerText) stickerText.textContent = String(stickerCount);
}

function selectLesson(lessonId) {
  currentLesson = curriculum.flatMap((s) => s.lessons).find((lesson) => lesson.id === lessonId);
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
  const animatedShapes = new Set(['ㄹ↔ㄴ', 'ㅅ', 'ㅂ↔ㅍ', 'ㄵ/ㄺ/ㄼ']);
  mouthStage.dataset.shape = animatedShapes.has(focus) ? (focus === 'ㄹ↔ㄴ' ? 'ㄹ' : focus === 'ㅂ↔ㅍ' ? 'ㅍ' : focus) : 'default';
  howToList.innerHTML = '';
  guide.steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    howToList.appendChild(li);
  });
}

function renderAnalysis() {
  if (!analysisList) return;
  analysisList.innerHTML = '';
  const items = [
    '총 240문제(10 grades × 24) 순차 학습 구조',
    '점수 80점 이상 시 다음 문제 해금',
    'Grade 완료 시 스티커 지급 + 다음 Grade 해금',
  ];
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'analysis-item';
    li.textContent = item;
    analysisList.appendChild(li);
  });
}

function pickFriendlyVoice() {
  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('ko'));
  const preferred = voices.find((voice) => /female|여성|yuna|sora|nara/i.test(voice.name));
  return preferred || voices[0] || null;
}

function speakSentence(sentence) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(sentence);
  utter.lang = 'ko-KR';
  utter.rate = Number(speedRange.value);
  const voice = pickFriendlyVoice();
  if (voice) utter.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia) return;
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
    };
    mediaRecorder.start();
    recordBtn.dataset.mode = 'recording';
    recordBtn.textContent = '녹음 종료 ⏹';
    statusText.textContent = '녹음 중...';
    if (recognition) {
      try { recognition.start(); } catch {}
    }
    startTimer(8);
  } catch {
    feedbackBox.className = 'feedback warn';
    feedbackBox.textContent = '마이크 권한이 필요해요.';
  }
}

function stopRecording() {
  clearInterval(timer);
  timerText.textContent = '0초';
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (recognition) {
    try { recognition.stop(); } catch {}
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

  if (score >= 80) {
    streak += 1;
    xp += 15;
    unlockProgress();
  } else {
    streak = 0;
    xp += 4;
  }
  xpText.textContent = String(xp);
  streakText.textContent = String(streak);
  renderHeaderStats();
}

function unlockProgress() {
  const stage = curriculum[currentGradeIndex];
  const p = progression[currentGradeIndex];
  const lessonIdx = stage.lessons.findIndex((l) => l.id === currentLesson.id);

  if (lessonIdx === p.unlockedLesson && p.unlockedLesson < stage.lessons.length - 1) {
    p.unlockedLesson += 1;
    feedbackBox.className = 'feedback good';
    feedbackBox.textContent = `클리어! 다음 문제가 열렸어요 (${p.unlockedLesson + 1}/${stage.lessons.length})`;
  }

  if (p.unlockedLesson === stage.lessons.length - 1 && lessonIdx === stage.lessons.length - 1 && !p.completed) {
    p.completed = true;
    stickerCount += 1;
    if (currentGradeIndex < curriculum.length - 1) {
      unlockedGradeIndex = Math.max(unlockedGradeIndex, currentGradeIndex + 1);
      feedbackBox.className = 'feedback good';
      feedbackBox.textContent = `Grade ${currentGradeIndex + 1} 완료! 스티커 +1 🎉 Grade ${currentGradeIndex + 2} 해금!`;
    }
  }

  renderStages();
  renderLessons();
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
  if (score >= 90) {
    feedbackBox.className = 'feedback good';
    feedbackBox.textContent = `완벽해요! ${score}점\n다음 단계로 도전!`;
    return;
  }
  if (score >= 80) {
    feedbackBox.className = 'feedback good';
    feedbackBox.textContent = `합격! ${score}점\n팁: ${tip}`;
    return;
  }
  if (score >= 60) {
    feedbackBox.className = 'feedback';
    feedbackBox.textContent = `조금만 더! ${score}점\n팁: ${tip}`;
    return;
  }
  feedbackBox.className = 'feedback warn';
  feedbackBox.textContent = `다시 도전 (${score}점)\n목표: "${expected}"\n인식: "${actual}"`;
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
renderAnalysis();
renderHeaderStats();
selectLesson(curriculum[0].lessons[0].id);
