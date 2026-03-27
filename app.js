const lessons = [
  { id: 1, sentence: "안녕하세요, 저는 민지예요.", tip: "안-녕-하-세-요, 리듬을 느껴요." },
  { id: 2, sentence: "바나나를 좋아해요.", tip: "바/나/나를 또박또박." },
  { id: 3, sentence: "오늘은 날씨가 맑아요.", tip: "ㄹ, ㅆ, ㄱ 발음을 분명하게!" },
  { id: 4, sentence: "학교에서 친구와 놀았어요.", tip: "길게 말하지 말고 단어를 나눠서." },
  { id: 5, sentence: "저는 공룡 책을 읽고 싶어요.", tip: "ㅇ, ㄹ, ㄱ 연결을 부드럽게." },
];

const lessonList = document.querySelector("#lessonList");
const lessonTemplate = document.querySelector("#lessonTemplate");
const targetSentence = document.querySelector("#targetSentence");
const listenBtn = document.querySelector("#listenBtn");
const recordBtn = document.querySelector("#recordBtn");
const dailyMissionBtn = document.querySelector("#dailyMissionBtn");
const statusText = document.querySelector("#statusText");
const timerText = document.querySelector("#timerText");
const recognizedText = document.querySelector("#recognizedText");
const scoreMeter = document.querySelector("#scoreMeter");
const scoreText = document.querySelector("#scoreText");
const feedbackBox = document.querySelector("#feedbackBox");
const historyList = document.querySelector("#historyList");

let currentLesson = null;
let timer = null;
let timerRemaining = 0;
let mediaRecorder = null;
let audioChunks = [];

const recognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    : null;

if (recognition) {
  recognition.lang = "ko-KR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    recognizedText.textContent = transcript;
    if (currentLesson) {
      const score = calculatePronunciationScore(currentLesson.sentence, transcript);
      renderScore(score);
      renderFeedback(score, currentLesson.tip, transcript, currentLesson.sentence);
      appendHistory(currentLesson.sentence, transcript, score);
    }
  };

  recognition.onerror = () => {
    statusText.textContent = "음성 인식 실패";
    feedbackBox.className = "feedback warn";
    feedbackBox.textContent =
      "브라우저 음성 인식에 실패했어요. 조용한 곳에서 다시 시도해 주세요.";
  };
}

dailyMissionBtn.addEventListener("click", () => {
  const lesson = lessons[Math.floor(Math.random() * lessons.length)];
  selectLesson(lesson.id);
  feedbackBox.className = "feedback";
  feedbackBox.textContent = "오늘의 미션! 문장을 3번 연속으로 말해 보세요.";
});

listenBtn.addEventListener("click", () => {
  if (!currentLesson) return;
  speakSentence(currentLesson.sentence);
});

recordBtn.addEventListener("click", async () => {
  if (!currentLesson) return;

  if (recordBtn.dataset.mode !== "recording") {
    await startRecording();
  } else {
    stopRecording();
  }
});

function renderLessons() {
  lessonList.innerHTML = "";

  lessons.forEach((lesson) => {
    const lessonBtn = lessonTemplate.content.firstElementChild.cloneNode(true);
    lessonBtn.textContent = lesson.sentence;
    lessonBtn.addEventListener("click", () => selectLesson(lesson.id));
    lessonBtn.dataset.lessonId = lesson.id;
    lessonList.appendChild(lessonBtn);
  });
}

function selectLesson(lessonId) {
  currentLesson = lessons.find((lesson) => lesson.id === lessonId);
  targetSentence.textContent = currentLesson.sentence;
  listenBtn.disabled = false;
  recordBtn.disabled = false;
  recognizedText.textContent = "-";
  renderScore(0);
  statusText.textContent = "문장 준비 완료";

  [...lessonList.querySelectorAll(".lesson-btn")].forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.lessonId) === lessonId);
  });
}

function speakSentence(sentence) {
  if (!window.speechSynthesis) {
    feedbackBox.className = "feedback warn";
    feedbackBox.textContent = "이 브라우저는 음성 재생을 지원하지 않아요.";
    return;
  }

  const utterance = new SpeechSynthesisUtterance(sentence);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    feedbackBox.className = "feedback warn";
    feedbackBox.textContent = "마이크 권한이 필요하거나 기기에서 지원되지 않아요.";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    recordBtn.dataset.mode = "recording";
    recordBtn.textContent = "녹음 종료 ⏹";
    statusText.textContent = "녹음 중";

    if (recognition) recognition.start();

    startTimer(8);
  } catch {
    feedbackBox.className = "feedback warn";
    feedbackBox.textContent = "마이크 접근이 거부되었어요. 브라우저 권한을 확인해 주세요.";
  }
}

function stopRecording() {
  clearInterval(timer);
  timerText.textContent = "0초";

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  if (recognition) {
    try {
      recognition.stop();
    } catch {
      // ignore duplicate stop
    }
  }

  recordBtn.dataset.mode = "idle";
  recordBtn.textContent = "녹음 시작 🎤";
  statusText.textContent = "분석 완료";
}

function startTimer(seconds) {
  timerRemaining = seconds;
  timerText.textContent = `${timerRemaining}초`;
  clearInterval(timer);

  timer = setInterval(() => {
    timerRemaining -= 1;
    timerText.textContent = `${Math.max(timerRemaining, 0)}초`;

    if (timerRemaining <= 0) {
      stopRecording();
    }
  }, 1000);
}

function calculatePronunciationScore(expected, actual) {
  const cleanExpected = expected.replace(/[\s,.!?]/g, "");
  const cleanActual = actual.replace(/[\s,.!?]/g, "");

  if (!cleanActual) return 0;

  const distance = levenshtein(cleanExpected, cleanActual);
  const maxLen = Math.max(cleanExpected.length, cleanActual.length);
  const similarity = Math.max(0, 1 - distance / maxLen);

  return Math.round(similarity * 100);
}

function renderScore(score) {
  scoreMeter.value = score;
  scoreText.textContent = `${score}점`;
}

function renderFeedback(score, tip, actual, expected) {
  if (score >= 85) {
    feedbackBox.className = "feedback good";
    feedbackBox.textContent = `정말 잘했어요! ⭐ 점수 ${score}점. 다음엔 더 또박또박 말해볼까요?`;
    return;
  }

  if (score >= 60) {
    feedbackBox.className = "feedback";
    feedbackBox.textContent = `좋아요! ${score}점이에요. 팁: ${tip}`;
    return;
  }

  feedbackBox.className = "feedback warn";
  feedbackBox.textContent = `괜찮아요, 다시 해봐요! (${score}점)\n목표: "${expected}"\n인식: "${actual}"\n팁: ${tip}`;
}

function appendHistory(sentence, transcript, score) {
  const item = document.createElement("li");
  const stamp = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  item.textContent = `${stamp} | ${sentence} | 인식: ${transcript} | 점수: ${score}점`;
  historyList.prepend(item);

  while (historyList.children.length > 8) {
    historyList.removeChild(historyList.lastElementChild);
  }
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

renderLessons();
