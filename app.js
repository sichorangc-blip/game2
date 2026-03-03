const DEFAULT_CONFIG = {
  title: "샤이닝 프린세스: 레인보우 드래곤 어드벤처",
  heroName: "샤이닝 프린세스",
  story:
    "하늘의 색을 잃어버린 용들을 샤이닝 프린세스의 마음빛으로 다시 반짝이게 해 주세요!",
  pixelSize: 8,
  dragons: [
    { name: "루비", color: "#ef476f", calmNeed: 3 },
    { name: "썬샤인", color: "#ffd166", calmNeed: 3 },
    { name: "리프", color: "#06d6a0", calmNeed: 4 },
    { name: "오션", color: "#118ab2", calmNeed: 4 },
    { name: "바이올렛", color: "#9b5de5", calmNeed: 5 }
  ],
  backgroundImage: ""
};

const STORAGE_KEY = "shining_princess_config_v1";

const state = {
  config: loadConfig(),
  started: false,
  paused: false,
  progress: 0,
  energy: 5,
  stage: 1,
  friendCount: 0,
  activeDragonIndex: 0,
  inBattle: false,
  calmCount: 0,
  animationId: null,
  encounterCooldown: 0
};

const el = {
  canvas: document.getElementById("game"),
  stageLabel: document.getElementById("stageLabel"),
  progressLabel: document.getElementById("progressLabel"),
  energyLabel: document.getElementById("energyLabel"),
  friendLabel: document.getElementById("friendLabel"),
  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  message: document.getElementById("message"),
  battleUI: document.getElementById("battleUI"),
  battleTitle: document.getElementById("battleTitle"),
  battleHint: document.getElementById("battleHint"),
  colorButtons: document.getElementById("colorButtons"),
  cfgTitle: document.getElementById("cfgTitle"),
  cfgHeroName: document.getElementById("cfgHeroName"),
  cfgStory: document.getElementById("cfgStory"),
  dragonList: document.getElementById("dragonList"),
  addDragonBtn: document.getElementById("addDragonBtn"),
  saveConfigBtn: document.getElementById("saveConfigBtn"),
  exportConfigBtn: document.getElementById("exportConfigBtn"),
  importConfigInput: document.getElementById("importConfigInput"),
  bgUpload: document.getElementById("bgUpload"),
  pixelSize: document.getElementById("pixelSize"),
  pixelPreview: document.getElementById("pixelPreview"),
  guidePlayBtn: document.getElementById("guidePlayBtn")
};

const ctx = el.canvas.getContext("2d");
const pctx = el.pixelPreview.getContext("2d");

setupAdminUI();
wireEvents();
refreshUI();
renderFrame();
say("처음이시라면: 오른쪽에서 설정 저장 → 왼쪽 게임 시작 버튼을 눌러주세요.");

function wireEvents() {
  el.startBtn.addEventListener("click", () => {
    if (!state.started) {
      state.started = true;
      say(`${state.config.story}`);
      loop();
      return;
    }
    state.paused = false;
    loop();
  });

  el.pauseBtn.addEventListener("click", () => {
    state.paused = !state.paused;
    if (!state.paused) loop();
    else cancelAnimationFrame(state.animationId);
  });

  el.resetBtn.addEventListener("click", resetGame);

  el.addDragonBtn.addEventListener("click", () => {
    state.config.dragons.push({ name: "새 용", color: "#ffffff", calmNeed: 3 });
    renderDragonForm();
  });

  el.saveConfigBtn.addEventListener("click", () => {
    pullConfigFromAdmin();
    saveConfig();
    refreshUI();
    say("설정을 저장했어요! 바로 게임에 반영됩니다.");
  });

  el.exportConfigBtn.addEventListener("click", exportConfig);
  el.importConfigInput.addEventListener("change", importConfig);
  el.bgUpload.addEventListener("change", handleBackgroundUpload);
  el.pixelSize.addEventListener("input", renderPixelPreview);

  el.guidePlayBtn.addEventListener("click", () => {
    pullConfigFromAdmin();
    saveConfig();
    resetGame();
    state.started = true;
    say("좋아요! 자동으로 설정 저장 후 게임을 시작했어요. 드래곤을 만나면 같은 색 하트를 눌러주세요.");
    loop();
  });
}

function loop() {
  if (!state.started || state.paused) return;

  update();
  renderFrame();
  state.animationId = requestAnimationFrame(loop);
}

function update() {
  if (state.inBattle) return;

  state.progress += 0.12;
  state.encounterCooldown -= 0.12;

  if (state.progress >= 100) {
    say("🎉 모든 용과 친구가 되었어요! 무지개 왕국을 구했어요!");
    state.started = false;
    return;
  }

  if (state.encounterCooldown <= 0 && state.activeDragonIndex < state.config.dragons.length) {
    state.inBattle = true;
    state.calmCount = 0;
    state.encounterCooldown = 20;
    openBattle();
  }

  state.stage = Math.min(state.config.dragons.length, Math.floor(state.progress / 20) + 1);
  refreshUI();
}

function openBattle() {
  const dragon = state.config.dragons[state.activeDragonIndex];
  el.battleUI.classList.remove("hidden");
  el.battleTitle.textContent = `${dragon.name} 드래곤을 만났어요!`;
  el.battleHint.textContent = `${dragon.name}의 색(${dragon.color})과 같은 하트를 ${dragon.calmNeed}번 선택하세요.`;

  const choices = shuffle([
    dragon.color,
    randomColor(),
    randomColor(),
    randomColor()
  ]);

  el.colorButtons.innerHTML = "";
  choices.forEach((color) => {
    const btn = document.createElement("button");
    btn.style.background = color;
    btn.textContent = "💖";
    btn.addEventListener("click", () => chooseColor(color));
    el.colorButtons.appendChild(btn);
  });
}

function chooseColor(color) {
  const dragon = state.config.dragons[state.activeDragonIndex];
  if (!dragon) return;

  if (color.toLowerCase() === dragon.color.toLowerCase()) {
    state.calmCount += 1;
    say(`좋아요! ${dragon.name}이(가) 진정하고 있어요 (${state.calmCount}/${dragon.calmNeed})`);
  } else {
    state.energy -= 1;
    say(`앗, 색이 달라요. ${state.config.heroName}의 에너지가 1 줄었어요.`);
  }

  if (state.energy <= 0) {
    say("에너지가 부족해 잠시 쉬어야 해요. 다시 시작해 주세요!");
    state.started = false;
  }

  if (state.calmCount >= dragon.calmNeed) {
    state.friendCount += 1;
    state.activeDragonIndex += 1;
    state.inBattle = false;
    el.battleUI.classList.add("hidden");
    say(`🌈 ${dragon.name} 드래곤과 친구가 되었어요!`);
  } else {
    openBattle();
  }

  refreshUI();
}

function renderFrame() {
  const { width, height } = el.canvas;
  ctx.clearRect(0, 0, width, height);

  drawPixelBackground(ctx, width, height, state.config.backgroundImage);

  const groundY = height - 70;
  ctx.fillStyle = "#43526b";
  ctx.fillRect(0, groundY, width, height - groundY);

  drawPrincess(80 + (state.progress % 15), groundY - 42);

  if (state.inBattle) {
    const dragon = state.config.dragons[state.activeDragonIndex];
    if (dragon) drawDragon(width - 170, groundY - 64, dragon.color);
  }

  drawProgressBar(width, 10);
}

function drawPrincess(x, y) {
  const pixels = [
    [0, 0, "#ffe0bd"],
    [1, 0, "#ffe0bd"],
    [0, 1, "#ff5fa2"],
    [1, 1, "#ff5fa2"],
    [2, 1, "#f8c8dc"],
    [1, 2, "#ffffff"],
    [0, 2, "#9d4edd"],
    [2, 2, "#9d4edd"],
    [1, 3, "#ffe66d"]
  ];

  pixels.forEach(([px, py, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * 8, y + py * 8, 8, 8);
  });
}

function drawDragon(x, y, color) {
  const body = [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 0],
    [2, 0],
    [2, 2],
    [4, 1],
    [5, 0],
    [5, 1],
    [5, 2]
  ];

  body.forEach(([px, py]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * 10, y + py * 10, 10, 10);
  });

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 50, y + 10, 4, 4);
}

function drawProgressBar(width, y) {
  ctx.fillStyle = "#222944";
  ctx.fillRect(20, y, width - 40, 16);
  ctx.fillStyle = "#58d68d";
  ctx.fillRect(20, y, ((width - 40) * state.progress) / 100, 16);
}

function drawPixelBackground(context, width, height, dataUrl) {
  if (!dataUrl) {
    context.fillStyle = "#171a2f";
    context.fillRect(0, 0, width, height);
    for (let i = 0; i < 40; i += 1) {
      context.fillStyle = i % 2 ? "#21284a" : "#252d54";
      context.fillRect((i * 37) % width, (i * 21) % (height - 80), 6, 6);
    }
    return;
  }

  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const size = Number(state.config.pixelSize) || 8;
    context.drawImage(img, 0, 0, Math.ceil(width / size), Math.ceil(height / size));
    const frame = context.getImageData(0, 0, Math.ceil(width / size), Math.ceil(height / size));
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = false;
    context.putImageData(frame, 0, 0);
    context.drawImage(context.canvas, 0, 0, Math.ceil(width / size), Math.ceil(height / size), 0, 0, width, height);
  };
}

function setupAdminUI() {
  el.cfgTitle.value = state.config.title;
  el.cfgHeroName.value = state.config.heroName;
  el.cfgStory.value = state.config.story;
  el.pixelSize.value = state.config.pixelSize;
  renderDragonForm();
  renderPixelPreview();
}

function renderDragonForm() {
  el.dragonList.innerHTML = "";
  state.config.dragons.forEach((dragon, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "dragon-item";
    wrap.innerHTML = `
      <div class="dragon-row">
        <input data-kind="name" data-idx="${idx}" type="text" value="${escapeHtml(dragon.name)}" />
        <input data-kind="color" data-idx="${idx}" type="color" value="${dragon.color}" />
        <input data-kind="calmNeed" data-idx="${idx}" type="number" min="1" max="10" value="${dragon.calmNeed}" />
        <button data-remove="${idx}" type="button">삭제</button>
      </div>`;
    el.dragonList.appendChild(wrap);
  });

  el.dragonList.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.remove);
      state.config.dragons.splice(index, 1);
      renderDragonForm();
    });
  });
}

function pullConfigFromAdmin() {
  state.config.title = el.cfgTitle.value.trim() || DEFAULT_CONFIG.title;
  state.config.heroName = el.cfgHeroName.value.trim() || DEFAULT_CONFIG.heroName;
  state.config.story = el.cfgStory.value.trim() || DEFAULT_CONFIG.story;
  state.config.pixelSize = Number(el.pixelSize.value) || 8;

  const nextDragons = [];
  el.dragonList.querySelectorAll(".dragon-item").forEach((item) => {
    const name = item.querySelector('input[data-kind="name"]').value.trim() || "이름 없는 용";
    const color = item.querySelector('input[data-kind="color"]').value || "#ffffff";
    const calmNeed = Math.max(1, Number(item.querySelector('input[data-kind="calmNeed"]').value) || 3);
    nextDragons.push({ name, color, calmNeed });
  });

  state.config.dragons = nextDragons.length ? nextDragons : DEFAULT_CONFIG.dragons;
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config));
  document.title = state.config.title;
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_CONFIG);
    return { ...structuredClone(DEFAULT_CONFIG), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

function exportConfig() {
  pullConfigFromAdmin();
  const blob = new Blob([JSON.stringify(state.config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shining-princess-config.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importConfig(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      state.config = { ...structuredClone(DEFAULT_CONFIG), ...parsed };
      setupAdminUI();
      saveConfig();
      say("설정 파일을 불러왔어요.");
    } catch {
      say("JSON 파일 형식이 올바르지 않아요.");
    }
  };
  reader.readAsText(file, "utf-8");
}

function handleBackgroundUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.config.backgroundImage = String(reader.result);
    renderPixelPreview();
  };
  reader.readAsDataURL(file);
}

function renderPixelPreview() {
  const { width, height } = el.pixelPreview;
  pctx.clearRect(0, 0, width, height);

  if (!state.config.backgroundImage) {
    pctx.fillStyle = "#1a2040";
    pctx.fillRect(0, 0, width, height);
    pctx.fillStyle = "#9b5de5";
    pctx.fillRect(40, 70, 40, 40);
    pctx.fillStyle = "#ffd166";
    pctx.fillRect(100, 60, 50, 50);
    return;
  }

  const img = new Image();
  img.onload = () => {
    const size = Number(el.pixelSize.value) || 8;
    pctx.imageSmoothingEnabled = false;
    pctx.drawImage(img, 0, 0, Math.ceil(width / size), Math.ceil(height / size));
    const frame = pctx.getImageData(0, 0, Math.ceil(width / size), Math.ceil(height / size));
    pctx.clearRect(0, 0, width, height);
    pctx.putImageData(frame, 0, 0);
    pctx.drawImage(pctx.canvas, 0, 0, Math.ceil(width / size), Math.ceil(height / size), 0, 0, width, height);
  };
  img.src = state.config.backgroundImage;
}

function refreshUI() {
  el.stageLabel.textContent = String(state.stage);
  el.progressLabel.textContent = `${Math.floor(state.progress)}%`;
  el.energyLabel.textContent = String(state.energy);
  el.friendLabel.textContent = String(state.friendCount);
}

function resetGame() {
  state.started = false;
  state.paused = false;
  state.progress = 0;
  state.energy = 5;
  state.stage = 1;
  state.friendCount = 0;
  state.activeDragonIndex = 0;
  state.inBattle = false;
  state.calmCount = 0;
  cancelAnimationFrame(state.animationId);
  el.battleUI.classList.add("hidden");
  refreshUI();
  renderFrame();
say("처음이시라면: 오른쪽에서 설정 저장 → 왼쪽 게임 시작 버튼을 눌러주세요.");
  say("게임을 처음 상태로 되돌렸어요.");
}

function say(text) {
  el.message.textContent = text;
}

function randomColor() {
  const colors = ["#f94144", "#f3722c", "#43aa8b", "#577590", "#90be6d", "#f8961e"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function shuffle(arr) {
  const cloned = [...arr];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
