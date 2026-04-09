const curriculum = [
  {
    id: 'basic',
    title: '기초 자음 워밍업 (10문제)',
    lessons: [
      { id: 1, sentence: '라라라, 노래를 불러요.', focus: 'ㄹ', tip: '혀끝을 윗잇몸에 살짝 닿았다가 빠르게 떼요.' },
      { id: 2, sentence: '나나나, 나는 나비를 봐요.', focus: 'ㄴ', tip: '혀끝을 윗잇몸에 붙이고 코로 울림을 느껴요.' },
      { id: 3, sentence: '사사사, 사자를 따라 해요.', focus: 'ㅅ', tip: '이 사이로 바람을 가늘게 보내요.' },
      { id: 4, sentence: '파파파, 파도를 봐요.', focus: 'ㅍ', tip: '입술을 붙였다가 강하게 터뜨려요.' },
      { id: 5, sentence: '다람쥐가 도토리를 먹어요.', focus: 'ㄹ', tip: '라-람-쥐처럼 박자를 나누어 연습해요.' },
      { id: 6, sentence: '소소한 소풍이 신나요.', focus: 'ㅅ', tip: '혀는 낮게, 이 사이 바람은 얇게 보내요.' },
      { id: 7, sentence: '바나나를 나눠 먹어요.', focus: 'ㄴ', tip: '혀끝 고정 + 코 울림으로 안정감 있게.' },
      { id: 8, sentence: '포포, 풍선을 펑 터뜨려요.', focus: 'ㅍ', tip: '입술을 붙였다가 크게 터뜨려요.' },
      { id: 9, sentence: '리리리, 리본을 묶어요.', focus: 'ㄹ', tip: '혀끝이 너무 오래 붙지 않게 짧게 튕겨요.' },
      { id: 10, sentence: '샤샤샤, 시소를 타요.', focus: 'ㅅ', tip: '입꼬리를 살짝 당기고 바람 길을 좁혀요.' },
    ],
  },
  {
    id: 'minimal',
    title: '헷갈리는 소리 게임 (10문제)',
    lessons: [
      { id: 11, sentence: '라면 말고 나면이라고 말해요.', focus: 'ㄹ↔ㄴ', tip: '라/나를 번갈아 천천히 말해요.' },
      { id: 12, sentence: '사자와 파자를 구분해요.', focus: 'ㅅ↔ㅍ', tip: 'ㅅ은 바람 가늘게, ㅍ은 입술 폭발.' },
      { id: 13, sentence: '자리와 차리를 또렷하게 구분해요.', focus: 'ㅈ↔ㅊ', tip: 'ㅊ은 더 강한 숨, ㅈ은 부드러운 시작.' },
      { id: 14, sentence: '가위와 카드를 또박또박 읽어요.', focus: 'ㄱ↔ㅋ', tip: 'ㅋ은 숨을 강하게 내보내요.' },
      { id: 15, sentence: '달과 탈을 정확히 말해요.', focus: 'ㄷ↔ㅌ', tip: 'ㅌ에서 혀를 더 세게 튕겨요.' },
      { id: 16, sentence: '볼과 폴을 번갈아 말해요.', focus: 'ㅂ↔ㅍ', tip: 'ㅂ은 약하게, ㅍ은 강하게 터뜨려요.' },
      { id: 17, sentence: '술과 줄을 구분해서 읽어요.', focus: 'ㅅ↔ㅈ', tip: 'ㅅ은 마찰, ㅈ은 짧은 파찰.' },
      { id: 18, sentence: '라라 나나 게임을 해요.', focus: 'ㄹ↔ㄴ', tip: '혀 위치를 느끼며 번갈아 말해요.' },
      { id: 19, sentence: '고기와 코기를 비교해요.', focus: 'ㄱ↔ㅋ', tip: 'ㅋ은 공기량이 더 많아요.' },
      { id: 20, sentence: '다리와 타리를 나눠 말해요.', focus: 'ㄷ↔ㅌ', tip: 'ㅌ에서 혀를 더 강하게 떼요.' },
    ],
  },
  {
    id: 'words',
    title: '단어·문장 연결 (10문제)',
    lessons: [
      { id: 21, sentence: '오늘은 날씨가 맑아요.', focus: '리듬 말하기', tip: '단어를 끊어서 또박또박.' },
      { id: 22, sentence: '학교에서 친구와 놀았어요.', focus: '리듬 말하기', tip: '빨리 말하지 않고 박자 맞추기.' },
      { id: 23, sentence: '우리는 놀이터에서 달리기를 해요.', focus: 'ㄹ', tip: 'ㄹ이 들어간 단어를 크게 강조해요.' },
      { id: 24, sentence: '선생님이 새싹 소식을 알려줘요.', focus: 'ㅅ', tip: 'ㅅ이 있는 낱말마다 바람 소리 의식하기.' },
      { id: 25, sentence: '바쁜 아빠가 파란 풍선을 샀어요.', focus: 'ㅂ/ㅍ', tip: '유성/무성 느낌을 비교하며 읽어요.' },
      { id: 26, sentence: '나무 아래 노란 나비가 날아요.', focus: 'ㄴ', tip: '코 울림을 유지하며 문장 길게 읽기.' },
      { id: 27, sentence: '쌀쌀한 아침에도 씩씩하게 산책해요.', focus: '된소리·마찰음', tip: '쌍자음은 더 단단하게 시작해요.' },
      { id: 28, sentence: '차가운 주스를 천천히 마셔요.', focus: 'ㅈ/ㅊ', tip: 'ㅊ에서 바람을 더 세게 보내요.' },
      { id: 29, sentence: '로봇이 노래를 부르며 달려가요.', focus: 'ㄹ↔ㄴ', tip: 'ㄹ/ㄴ이 바뀌지 않게 속도를 낮춰요.' },
      { id: 30, sentence: '새싹 숲속에서 사슴이 쉬어요.', focus: 'ㅅ', tip: 'ㅅ이 나올 때마다 바람을 얇게.' },
    ],
  },
  {
    id: 'rhythm',
    title: '리듬·호흡 챌린지 (10문제)',
    lessons: [
      { id: 31, sentence: '한 박자 쉬고 또박또박 말해요.', focus: '호흡 조절', tip: '쉼표마다 짧게 숨을 쉬어요.' },
      { id: 32, sentence: '천천히 시작해서 정확히 끝내요.', focus: '속도 조절', tip: '빠르기보다 정확성을 먼저.' },
      { id: 33, sentence: '라라 나나 사사 파파 리듬!', focus: '혼합 반복', tip: '4음절씩 끊어 리듬 타기.' },
      { id: 34, sentence: '나는 오늘도 자신 있게 말해요.', focus: '문장 길이 늘리기', tip: '문장 끝까지 소리 크기 유지.' },
      { id: 35, sentence: '차분히 숨 쉬고 또렷하게 읽어요.', focus: '호흡 조절', tip: '어깨 힘 빼고 배로 숨쉬기.' },
      { id: 36, sentence: '짧은 문장 세 개를 이어 말해요.', focus: '연결 발화', tip: '문장 사이 멈춤을 일정하게.' },
      { id: 37, sentence: '하나 둘 셋 넷 박자에 맞춰요.', focus: '리듬 박자', tip: '손뼉 치며 발음하면 좋아요.' },
      { id: 38, sentence: '또박또박 천천히 정확하게!', focus: '명료도', tip: '입모양을 크게 보여주며 말하기.' },
      { id: 39, sentence: '놀이터에서 노래하며 놀아요.', focus: 'ㄴ/ㄹ 연결', tip: '노-래-놀-아-요로 끊어 말해요.' },
      { id: 40, sentence: '소풍 가는 길에 신나게 웃어요.', focus: 'ㅅ 연속', tip: 'ㅅ 소리마다 치아 간격을 좁게.' },
    ],
  },
  {
    id: 'final',
    title: '받침·이중받침 마스터 (10문제)',
    lessons: [
      { id: 41, sentence: '앉고 읽고 넓게 웃어요.', focus: 'ㄵ/ㄺ/ㄼ', tip: '받침은 짧게, 다음 음절은 분명하게.' },
      { id: 42, sentence: '삶과 값도 또박또박 읽어요.', focus: 'ㄻ/ㅄ', tip: '입모양을 크게 하고 천천히.' },
      { id: 43, sentence: '꽃밭 옆에서 젊은 형이 책을 읽어요.', focus: '받침(ㅊ/ㄺ/ㄻ)', tip: '받침 발음 후 다음 소리로 바로 이어요.' },
      { id: 44, sentence: '닭과 곶감 값을 같이 적어요.', focus: '받침(ㄺ/ㅄ)', tip: '받침을 길게 끌지 말고 짧게 처리해요.' },
      { id: 45, sentence: '넓은 숲길을 같이 걸어요.', focus: '받침(ㄼ/ㅄ)', tip: '복합받침에서 대표음만 또렷하게.' },
      { id: 46, sentence: '읽는 법을 알고 밝게 웃어요.', focus: '받침(ㄺ/ㄺ)', tip: '읽-는처럼 음절 경계를 의식해요.' },
      { id: 47, sentence: '앉는 자세를 바르게 배워요.', focus: '받침(ㄵ)', tip: '앉-는 연결에서 혀 위치를 유지해요.' },
      { id: 48, sentence: '값있는 책을 들고 집에 가요.', focus: '받침(ㅄ)', tip: '값-있는 연결을 천천히 나눠 읽어요.' },
      { id: 49, sentence: '밟고 닭장을 지나 집에 와요.', focus: '받침(ㄼ/ㄺ)', tip: '받침은 짧고 모음은 분명하게.' },
      { id: 50, sentence: '젊고 맑은 얼굴로 웃어요.', focus: '받침(ㄻ/ㄺ)', tip: '복합받침 뒤 모음 전환을 또렷하게.' },
    ],
  },
  {
    id: 'story',
    title: '짧은 이야기 모험 (10문제)',
    lessons: [
      { id: 51, sentence: '로봇 라니가 나무 숲에서 노래해요.', focus: 'ㄹ↔ㄴ', tip: '라/나 전환을 의식해요.' },
      { id: 52, sentence: '사자 소니가 파란 풍선을 찾았어요.', focus: 'ㅅ↔ㅍ', tip: '마찰음과 파열음 차이를 살려요.' },
      { id: 53, sentence: '차차와 자자가 장난감을 정리해요.', focus: 'ㅈ↔ㅊ', tip: 'ㅊ은 숨을 더 세게.' },
      { id: 54, sentence: '공원에서 공을 차고 크게 웃어요.', focus: 'ㄱ↔ㅋ', tip: 'ㅋ에서 숨을 손으로 느껴요.' },
      { id: 55, sentence: '토끼가 다리를 건너 놀러 갔어요.', focus: 'ㄷ↔ㅌ', tip: 'ㄷ/ㅌ 쌍을 천천히 구분해요.' },
      { id: 56, sentence: '바다 위 파도가 반짝이며 춤춰요.', focus: 'ㅂ↔ㅍ', tip: '입술 강도 차이를 크게.' },
      { id: 57, sentence: '놀이터에서 친구들과 신나게 달려요.', focus: 'ㄹ', tip: '문장 중간 ㄹ을 튕기듯.' },
      { id: 58, sentence: '선물 상자 속 사탕이 쏟아졌어요.', focus: 'ㅅ', tip: 'ㅅ을 선명하게 길게 끌지 않기.' },
      { id: 59, sentence: '앉아서 짧은 동화를 천천히 읽어요.', focus: '받침 연결', tip: '앉-아서처럼 경계 의식.' },
      { id: 60, sentence: '오늘도 또박키즈 별을 모았어요.', focus: '종합', tip: '정확도 유지 후 속도 올리기.' },
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
  'ㄹ↔ㄴ': {
    mouth: '👄 ㄹ은 혀를 튕기고, ㄴ은 혀를 붙인 채 코 울림을 유지해요.',
    steps: ['라/나를 번갈아 말하기', '혀끝 위치 차이 느끼기', '속도보다 정확도 우선'],
  },
  'ㅅ↔ㅍ': {
    mouth: '👄 ㅅ은 이 사이 마찰, ㅍ은 입술 폭발을 크게 구분해요.',
    steps: ['ㅅ: 바람을 가늘게', 'ㅍ: 입술을 붙였다 터뜨리기', '쌍으로 반복 연습'],
  },
  'ㅈ↔ㅊ': {
    mouth: '👄 둘 다 앞쪽 소리지만 ㅊ이 더 강한 숨을 사용해요.',
    steps: ['ㅈ은 부드럽게 시작', 'ㅊ은 공기량 크게', '최소대립쌍으로 반복'],
  },
  'ㄱ↔ㅋ': {
    mouth: '👄 입안 뒤쪽에서 막았다가 열되, ㅋ에서 숨을 더 강하게 보내요.',
    steps: ['ㄱ/ㅋ 쌍 반복', '손바닥으로 바람 느끼기', '단어 속에서 적용'],
  },
  'ㄷ↔ㅌ': {
    mouth: '👄 혀끝 위치는 비슷하지만 ㅌ이 더 센 기식 소리예요.',
    steps: ['ㄷ은 짧고 부드럽게', 'ㅌ은 강한 바람', '짧은 낱말부터 시작'],
  },
  'ㅂ↔ㅍ': {
    mouth: '👄 입술 소리 쌍, ㅍ에서 입술 폭발을 크게 만들어줘요.',
    steps: ['입술 닫기', 'ㅂ/ㅍ 교차 반복', '문장 속에서 차이 유지'],
  },
  'ㅅ↔ㅈ': {
    mouth: '👄 ㅅ은 마찰음, ㅈ은 막았다가 여는 파찰음이에요.',
    steps: ['ㅅ과 ㅈ 길이 차이 느끼기', '술/줄 같은 쌍 연습', '속도 서서히 올리기'],
  },
  default: {
    mouth: '👄 입모양을 크게 보여주며 천천히 발음하면 아이가 따라 하기 쉬워요.',
    steps: ['소리 쪼개서 듣기', '천천히 따라 말하기', '정확해지면 속도 올리기'],
  },
};

const researchInsights = [
  {
    title: '팬데믹 세대 발달 변동성 증가',
    detail:
      '코로나19 시기 영유아/유아 집단은 발달 지표의 변동성과 지연 위험이 커졌다는 연구들이 보고됩니다. 그래서 짧고 자주 반복하는 구조로 커리큘럼을 확장했어요.',
    action: '6개 파트 × 10문제(총 60문제) + 최소대립쌍 반복 + 미션형 학습',
  },
  {
    title: '늦게 안정되는 소리 집중',
    detail:
      '일반 발달 자료에서 마찰음·유음(예: s/l/r 계열)이 비교적 늦게 안정되는 편으로 보고됩니다. 한국어 대응 난이도인 ㅅ·ㄹ 중심 문제를 늘렸어요.',
    action: 'ㅅ·ㄹ 워밍업, 문장 연결, 변별 게임을 단계별로 배치',
  },
  {
    title: '혼동쌍(최소대립쌍) 훈련 필요',
    detail:
      '발음 혼동은 단일 소리 반복보다 최소대립쌍(예: 라/나, 사/파)에서 개선 효과가 큽니다.',
    action: 'ㄹ↔ㄴ, ㅅ↔ㅍ, ㅈ↔ㅊ, ㄱ↔ㅋ, ㄷ↔ㅌ, ㅂ↔ㅍ 게임 신설',
  },
];

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
  const animatedShapes = new Set(['ㄹ', 'ㄴ', 'ㅅ', 'ㅍ', 'ㄵ/ㄺ/ㄼ', 'ㄻ/ㅄ']);
  mouthStage.dataset.shape = animatedShapes.has(focus) ? focus : 'default';
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
  researchInsights.forEach((insight) => {
    const li = document.createElement('li');
    li.className = 'analysis-item';
    li.innerHTML = `<strong>${insight.title}</strong><p>${insight.detail}</p><p class="analysis-action">앱 반영: ${insight.action}</p>`;
    analysisList.appendChild(li);
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
renderAnalysis();
