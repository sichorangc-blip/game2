const gradeConfigs = [
  { id: 'g1', title: 'Grade 1: 기본 소리 준비', focus: 'ㄴ/ㅁ', tip: '코 울림을 느끼며 천천히 발음해요.', words: ['나무', '누나', '모자', '마늘', '미소'] },
  { id: 'g2', title: 'Grade 2: ㄹ-ㄴ 구분', focus: 'ㄹ↔ㄴ', tip: 'ㄹ은 튕기고 ㄴ은 붙여요.', words: ['라면', '나비', '로봇', '노트', '리본'] },
  { id: 'g3', title: 'Grade 3: ㅅ 마찰음', focus: 'ㅅ', tip: '바람을 얇게 내요.', words: ['사탕', '소풍', '시소', '수박', '새싹'] },
  { id: 'g4', title: 'Grade 4: ㅂ-ㅍ 구분', focus: 'ㅂ↔ㅍ', tip: 'ㅂ은 부드럽고 ㅍ은 강하게.', words: ['바다', '파도', '바나나', '포도', '풍선'] },
  { id: 'g5', title: 'Grade 5: ㅈ-ㅊ 구분', focus: 'ㅈ↔ㅊ', tip: 'ㅊ이 공기량이 더 커요.', words: ['주스', '치즈', '자리', '창문', '장난감'] },
  { id: 'g6', title: 'Grade 6: ㄱ-ㅋ 구분', focus: 'ㄱ↔ㅋ', tip: 'ㅋ에서 손바닥으로 바람을 느껴요.', words: ['가위', '카드', '고기', '코끼리', '쿠키'] },
  { id: 'g7', title: 'Grade 7: 받침 기초', focus: '받침 기초', tip: '받침은 짧게 닫아요.', words: ['밥', '꽃', '집', '책', '낮'] },
  { id: 'g8', title: 'Grade 8: 이중받침', focus: 'ㄵ/ㄺ/ㄼ', tip: '복합받침은 길게 끌지 않아요.', words: ['앉다', '읽다', '밟다', '넓다', '삶'] },
  { id: 'g9', title: 'Grade 9: 리듬 문장', focus: '리듬 말하기', tip: '3~4박자로 끊어 말해요.', words: ['놀이터', '무지개', '별자리', '친구들', '노래'] },
  { id: 'g10', title: 'Grade 10: 종합', focus: '종합', tip: '정확도를 유지하며 속도를 올려요.', words: ['로봇', '탐험', '보물', '우주선', '기차'] },
];

const sentenceTemplates = [
  (a, b) => `${a}${objectParticle(a)} ${b}${objectParticle(b)} 또박또박 말해요.`,
  (a, b) => `${a}${topicParticle(a)} 보고 ${b}${objectParticle(b)} 따라 읽어요.`,
  (a, b) => `오늘은 ${a}${objectParticle(a)} 먼저, ${b}${objectParticle(b)} 다음으로 연습해요.`,
  (a, b) => `${a}${withParticle(a)} ${b}${withParticle(b)} 비교해요.`,
];

function hasBatchim(word) {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
}
function objectParticle(word) { return hasBatchim(word) ? '을' : '를'; }
function topicParticle(word) { return hasBatchim(word) ? '은' : '는'; }
function withParticle(word) { return hasBatchim(word) ? '과' : '와'; }

function buildCurriculum() {
  let lessonId = 1;
  return gradeConfigs.map((grade) => {
    const lessons = [];
    for (let i = 0; i < 24; i += 1) {
      const a = grade.words[i % grade.words.length];
      const b = grade.words[(i + 2) % grade.words.length];
      lessons.push({
        id: lessonId,
        sentence: sentenceTemplates[i % sentenceTemplates.length](a, b),
        focus: grade.focus,
        tip: grade.tip,
      });
      lessonId += 1;
    }
    return { id: grade.id, title: `${grade.title} (24문제)`, lessons };
  });
}

const articulationGuide = {
  'ㄹ↔ㄴ': { mouth: 'ㄹ은 튕기고 ㄴ은 코 울림.', steps: ['라/나 반복', '혀 위치 비교', '천천히'] },
  ㅅ: { mouth: '이 사이를 좁혀 바람을 얇게.', steps: ['앞니 가깝게', '바람 얇게', '사-서-소'] },
  'ㅂ↔ㅍ': { mouth: 'ㅍ에서 입술 폭발을 크게.', steps: ['입술 닫기', 'ㅂ/ㅍ 교차', '문장 적용'] },
  'ㄵ/ㄺ/ㄼ': { mouth: '복합받침은 짧게.', steps: ['음절 나누기', '경계 인지', '문장 적용'] },
  default: { mouth: '천천히, 크게, 또박또박!', steps: ['입모양 크게', '소리 나누기', '반복'] },
};

const curriculum = buildCurriculum();
const progression = curriculum.map(() => ({ unlockedLesson: 0, completed: false }));
let unlockedGradeIndex = 0;
let currentGradeIndex = 0;
let currentLesson = null;
let xp = 0;
let streak = 0;
let stickerCount = 0;
let timer = null;
let mediaRecorder = null;
let recordedBlobUrl = null;

const stageTabs = document.querySelector('#stageTabs');
const lessonList = document.querySelector('#lessonList');
const stageTemplate = document.querySelector('#stageTemplate');
const lessonTemplate = document.querySelector('#lessonTemplate');
const targetSentence = document.querySelector('#targetSentence');
const listenBtn = document.querySelector('#listenBtn');
const recordBtn = document.querySelector('#recordBtn');
const playbackBtn = document.querySelector('#playbackBtn');
const dailyMissionBtn = document.querySelector('#dailyMissionBtn');
const speedRange = document.querySelector('#speedRange');
const speedText = document.querySelector('#speedText');
const statusText = document.querySelector('#statusText');
const timerText = document.querySelector('#timerText');
const recognizedText = document.querySelector('#recognizedText');
const scoreMeter = document.querySelector('#scoreMeter');
const scoreText = document.querySelector('#scoreText');
const feedbackBox = document.querySelector('#feedbackBox');
const gradeText = document.querySelector('#gradeText');
const xpText = document.querySelector('#xpText');
const streakText = document.querySelector('#streakText');
const stickerText = document.querySelector('#stickerText');
const mouthGuide = document.querySelector('#mouthGuide');
const howToList = document.querySelector('#howToList');
const mouthStage = document.querySelector('#mouthStage');
const historyList = document.querySelector('#historyList');
const analysisList = document.querySelector('#analysisList');
const childNameText = document.querySelector('#childNameText');
const profileModal = document.querySelector('#profileModal');
const profileForm = document.querySelector('#profileForm');
const childNameInput = document.querySelector('#childNameInput');
const childAgeInput = document.querySelector('#childAgeInput');

const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
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
    statusText.textContent = '음성 인식 실패';
  };
}

function switchView(name) {
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.dataset.view === name));
}

document.querySelectorAll('[data-target]').forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.target));
});

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
      renderStats();
    });
    stageTabs.appendChild(btn);
  });
}

function renderLessons() {
  lessonList.innerHTML = '';
  const unlockedLesson = progression[currentGradeIndex].unlockedLesson;
  curriculum[currentGradeIndex].lessons.forEach((lesson, idx) => {
    const btn = lessonTemplate.content.firstElementChild.cloneNode(true);
    const locked = idx > unlockedLesson;
    btn.textContent = locked ? `🔒 ${idx + 1}번` : `${idx + 1}. ${lesson.sentence}`;
    btn.disabled = locked;
    btn.classList.toggle('active', currentLesson?.id === lesson.id);
    btn.addEventListener('click', () => !locked && selectLesson(lesson.id));
    lessonList.appendChild(btn);
  });
}

function renderStats() {
  const p = progression[currentGradeIndex];
  gradeText.textContent = `Grade ${currentGradeIndex + 1} | ${p.unlockedLesson + 1}/${curriculum[currentGradeIndex].lessons.length}`;
  xpText.textContent = String(xp);
  streakText.textContent = String(streak);
  stickerText.textContent = String(stickerCount);
  analysisList.innerHTML = '';
  ['총 240문제', '80점 이상 시 다음 문제 해금', 'Grade 완료 시 스티커 +1'].forEach((m) => {
    const li = document.createElement('li');
    li.textContent = m;
    analysisList.appendChild(li);
  });
}

function selectLesson(id) {
  currentLesson = curriculum.flatMap((g) => g.lessons).find((l) => l.id === id);
  targetSentence.textContent = currentLesson.sentence;
  listenBtn.disabled = false;
  recordBtn.disabled = false;
  playbackBtn.disabled = true;
  recognizedText.textContent = '-';
  statusText.textContent = '문장 준비 완료';
  renderGuide(currentLesson.focus);
  renderLessons();
}

function renderGuide(focus) {
  const guide = articulationGuide[focus] || articulationGuide.default;
  mouthGuide.textContent = guide.mouth;
  mouthStage.dataset.shape = focus === 'ㄹ↔ㄴ' ? 'ㄹ' : focus === 'ㅂ↔ㅍ' ? 'ㅍ' : focus === 'ㅅ' ? 'ㅅ' : 'default';
  howToList.innerHTML = '';
  guide.steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    howToList.appendChild(li);
  });
}

function playEffect(ok) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = ok ? 880 : 220;
  gain.gain.value = 0.07;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + (ok ? 0.12 : 0.2));
}

function speakSentence(sentence) {
  if (!window.speechSynthesis) {
    statusText.textContent = 'TTS 미지원 기기';
    return;
  }
  const utter = new SpeechSynthesisUtterance(sentence);
  utter.lang = 'ko-KR';
  utter.rate = Number(speedRange.value);
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    statusText.textContent = '마이크 미지원 기기';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
      recordedBlobUrl = URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' }));
      playbackBtn.disabled = false;
      statusText.textContent = '녹음 완료';
    };
    mediaRecorder.start();
    statusText.textContent = '녹음 중...';
    recordBtn.textContent = '녹음 종료 ⏹';
    recordBtn.dataset.mode = 'recording';
    if (recognition) { try { recognition.start(); } catch {} }
    startTimer(8);
  } catch {
    statusText.textContent = '마이크 권한 필요';
  }
}

function stopRecording() {
  clearInterval(timer);
  timerText.textContent = '0초';
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (recognition) { try { recognition.stop(); } catch {} }
  recordBtn.textContent = '녹음 시작 🎤';
  recordBtn.dataset.mode = 'idle';
}

function startTimer(seconds) {
  let remain = seconds;
  timerText.textContent = `${remain}초`;
  clearInterval(timer);
  timer = setInterval(() => {
    remain -= 1;
    timerText.textContent = `${Math.max(remain, 0)}초`;
    if (remain <= 0) stopRecording();
  }, 1000);
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
  }
  return dp[a.length][b.length];
}

function scoreSentence(expected, actual) {
  const e = expected.replace(/[\s,.!?]/g, '');
  const a = actual.replace(/[\s,.!?]/g, '');
  if (!a) return 0;
  return Math.round(Math.max(0, 1 - levenshtein(e, a) / Math.max(e.length, a.length)) * 100);
}

function evaluateResult(transcript) {
  const score = scoreSentence(currentLesson.sentence, transcript);
  scoreMeter.value = score;
  scoreText.textContent = `${score}점`;
  const ok = score >= 80;
  playEffect(ok);

  if (ok) {
    xp += 15;
    streak += 1;
    feedbackBox.className = 'feedback good';
    feedbackBox.textContent = `정답! ${score}점\n${currentLesson.tip}`;
    unlockNext();
  } else {
    xp += 4;
    streak = 0;
    feedbackBox.className = 'feedback warn';
    feedbackBox.textContent = `다시 도전! ${score}점\n팁: ${currentLesson.tip}`;
  }

  const li = document.createElement('li');
  const stamp = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  li.textContent = `${stamp} | ${currentLesson.sentence} | 인식: ${transcript} | ${score}점`;
  historyList.prepend(li);
  while (historyList.children.length > 20) historyList.removeChild(historyList.lastElementChild);
  renderStats();
}

function unlockNext() {
  const stage = curriculum[currentGradeIndex];
  const p = progression[currentGradeIndex];
  const idx = stage.lessons.findIndex((l) => l.id === currentLesson.id);
  if (idx === p.unlockedLesson && p.unlockedLesson < stage.lessons.length - 1) {
    p.unlockedLesson += 1;
  }
  if (idx === stage.lessons.length - 1 && !p.completed) {
    p.completed = true;
    stickerCount += 1;
    if (currentGradeIndex < curriculum.length - 1) unlockedGradeIndex = Math.max(unlockedGradeIndex, currentGradeIndex + 1);
  }
  renderStages();
  renderLessons();
}

listenBtn.addEventListener('click', () => currentLesson && speakSentence(currentLesson.sentence));
recordBtn.addEventListener('click', () => (recordBtn.dataset.mode === 'recording' ? stopRecording() : startRecording()));
playbackBtn.addEventListener('click', () => recordedBlobUrl && new Audio(recordedBlobUrl).play());
dailyMissionBtn.addEventListener('click', () => {
  const p = progression[currentGradeIndex];
  selectLesson(curriculum[currentGradeIndex].lessons[p.unlockedLesson].id);
});
speedRange.addEventListener('input', () => { speedText.textContent = `${Number(speedRange.value).toFixed(2)}x`; });

function initProfile() {
  const saved = JSON.parse(localStorage.getItem('ttobak_profile') || 'null');
  if (saved?.name) {
    childNameText.textContent = `${saved.name} (${saved.age}세)`;
  } else {
    profileModal.classList.add('show');
  }
}

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const profile = { name: childNameInput.value.trim(), age: childAgeInput.value };
  localStorage.setItem('ttobak_profile', JSON.stringify(profile));
  childNameText.textContent = `${profile.name} (${profile.age}세)`;
  profileModal.classList.remove('show');
});

renderStages();
renderLessons();
renderStats();
selectLesson(curriculum[0].lessons[0].id);
renderGuide('default');
initProfile();
