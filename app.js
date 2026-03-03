const DEFAULT_CONFIG = {
  title: "샤이닝 프린세스: 레인보우 드래곤 런",
  heroName: "샤이닝 프린세스",
  story:
    "샤이닝 프린세스가 앞으로 달리며 색을 잃은 용들에게 마음빛 하트를 보내요. 모두 친구로 만들면 승리!",
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
  animationId: null,
  keys: {},
  hero: {
    x: 120,
    y: 248,
    vy: 0,
    onGround: true
  },
  projectiles: [],
  dragonEntity: null,
  lastTs: 0,
  worldOffset: 0
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
  actionButtons: document.getElementById("actionButtons"),
  shootBtn: document.getElementById("shootBtn"),
  jumpBtn: document.getElementById("jumpBtn"),
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
setBattleText();
say("게임 시작 후 스페이스(하트 발사)와 ↑(점프)로 앞으로 달려보세요!");

function wireEvents() {
  el.startBtn.addEventListener("click", () => {
    if (!state.started) {
      state.started = true;
      state.lastTs = 0;
      say(state.config.story);
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
    setBattleText();
    say("설정을 저장했어요! 새 스테이지에 바로 반영됩니다.");
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
    say("자동 시작! 앞으로 달리며 하트로 용을 친구로 만들어보세요.");
    loop();
  });

  el.shootBtn.addEventListener("click", shootHeart);
  el.jumpBtn.addEventListener("click", jump);

  window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === " ") shootHeart();
    if (event.key === "ArrowUp") jump();
    state.keys[event.key] = true;
  });

  window.addEventListener("keyup", (event) => {
    state.keys[event.key] = false;
  });
}

function loop(ts = 0) {
  if (!state.started || state.paused) return;

  const delta = state.lastTs ? Math.min((ts - state.lastTs) / 16.67, 1.8) : 1;
  state.lastTs = ts;

  update(delta);
  renderFrame();
  state.animationId = requestAnimationFrame(loop);
}

function update(delta) {
  const runSpeed = 1.8;
  state.worldOffset += runSpeed * delta;
  state.progress = Math.min(100, state.friendCount * (100 / Math.max(1, state.config.dragons.length)));
  state.stage = Math.min(state.config.dragons.length, Math.max(1, state.activeDragonIndex + 1));

  updateHero(delta);
  updateProjectiles(delta);
  updateDragon(delta);

  if (!state.dragonEntity && state.activeDragonIndex < state.config.dragons.length) {
    spawnDragon();
  }

  if (state.friendCount >= state.config.dragons.length && state.config.dragons.length > 0) {
    state.progress = 100;
    say("🎉 모든 용과 친구가 되었어요! 무지개 왕국 대성공!");
    state.started = false;
  }

  refreshUI();
}

function updateHero(delta) {
  const groundY = 248;
  state.hero.vy += 0.42 * delta;
  state.hero.y += state.hero.vy * delta;

  if (state.hero.y >= groundY) {
    state.hero.y = groundY;
    state.hero.vy = 0;
    state.hero.onGround = true;
  } else {
    state.hero.onGround = false;
  }
}

function spawnDragon() {
  const dragon = state.config.dragons[state.activeDragonIndex];
  if (!dragon) return;
  state.dragonEntity = {
    name: dragon.name,
    color: dragon.color,
    calmNeed: dragon.calmNeed,
    calmCount: 0,
    x: el.canvas.width + 20,
    y: 220,
    speed: 0.9
  };
  setBattleText();
  say(`${dragon.name} 등장! 같은 색 하트를 맞춰 친구가 되어보세요.`);
}

function updateDragon(delta) {
  const dragon = state.dragonEntity;
  if (!dragon) return;

  if (dragon.x > 430) {
    dragon.x -= dragon.speed * delta;
  }

  const heroHit =
    dragon.x < state.hero.x + 42 &&
    dragon.x + 62 > state.hero.x &&
    dragon.y < state.hero.y + 36 &&
    dragon.y + 40 > state.hero.y;

  if (heroHit) {
    state.energy -= 1;
    dragon.x += 35;
    say(`앗! ${dragon.name}과 부딪쳤어요. 에너지 -1`);
    if (state.energy <= 0) {
      say("에너지가 부족해요. 처음부터 다시 시작해 주세요!");
      state.started = false;
    }
  }
}

function updateProjectiles(delta) {
  state.projectiles = state.projectiles.filter((shot) => {
    shot.x += shot.vx * delta;
    if (shot.x > el.canvas.width + 30) return false;

    const dragon = state.dragonEntity;
    if (!dragon) return true;

    const hit =
      shot.x > dragon.x &&
      shot.x < dragon.x + 62 &&
      shot.y > dragon.y &&
      shot.y < dragon.y + 44;

    if (!hit) return true;

    if (normalizeHex(shot.color) === normalizeHex(dragon.color)) {
      dragon.calmCount += 1;
      say(`좋아요! ${dragon.name}이 진정 중 (${dragon.calmCount}/${dragon.calmNeed})`);
      if (dragon.calmCount >= dragon.calmNeed) {
        state.friendCount += 1;
        state.activeDragonIndex += 1;
        say(`🌈 ${dragon.name}과 친구가 되었어요! 계속 앞으로 달려요!`);
        state.dragonEntity = null;
        setBattleText();
      }
    } else {
      state.energy -= 1;
      say(`색이 달라요! 에너지 -1 (용 색: ${dragon.color})`);
      if (state.energy <= 0) {
        say("에너지가 부족해요. 처음부터 다시 시작해 주세요!");
        state.started = false;
      }
    }

    return false;
  });
}

function jump() {
  if (!state.started || !state.hero.onGround) return;
  state.hero.vy = -7.2;
  state.hero.onGround = false;
}

function shootHeart() {
  if (!state.started) return;
  const dragon = state.dragonEntity;
  const shotColor = dragon ? dragon.color : randomColor();
  state.projectiles.push({
    x: state.hero.x + 28,
    y: state.hero.y + 14,
    vx: 6.5,
    color: shotColor
  });
}

function renderFrame() {
  const { width, height } = el.canvas;
  ctx.clearRect(0, 0, width, height);

  drawPixelBackground(ctx, width, height, state.config.backgroundImage);

  const groundY = height - 70;
  drawScrollingGround(groundY, width, height);

  drawPrincess(state.hero.x, state.hero.y);

  if (state.dragonEntity) {
    drawDragon(state.dragonEntity.x, state.dragonEntity.y, state.dragonEntity.color);
  }

  state.projectiles.forEach((shot) => {
    drawHeartShot(shot.x, shot.y, shot.color);
  });

  drawProgressBar(width, 10);
}

function drawScrollingGround(groundY, width, height) {
  ctx.fillStyle = "#43526b";
  ctx.fillRect(0, groundY, width, height - groundY);

  for (let i = -2; i < 16; i += 1) {
    const x = ((i * 48 - state.worldOffset * 2) % (width + 60)) - 20;
    ctx.fillStyle = i % 2 === 0 ? "#5f7090" : "#6d7ea0";
    ctx.fillRect(x, groundY + 8, 28, 8);
  }
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
    ctx.fillRect(x + px * 10, y + py * 10, 10, 10);
  });
}

function drawDragon(x, y, color) {
  const body = [
    [0, 1], [1, 1], [2, 1], [3, 1],
    [1, 0], [2, 0], [2, 2], [4, 1],
    [5, 0], [5, 1], [5, 2], [6, 1]
  ];

  body.forEach(([px, py]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * 10, y + py * 10, 10, 10);
  });

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 55, y + 10, 4, 4);
}

function drawHeartShot(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 4, 6, 6);
  ctx.fillRect(x + 6, y + 4, 6, 6);
  ctx.fillRect(x + 2, y + 10, 8, 6);
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
      const twinkle = (i * 13 + state.worldOffset * 0.7) % width;
      context.fillRect(twinkle, (i * 21) % (height - 80), 6, 6);
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

function setBattleText() {
  const dragon = state.config.dragons[state.activeDragonIndex];
  el.battleUI.classList.remove("hidden");
  if (!dragon) {
    el.battleTitle.textContent = "모든 스테이지 완료!";
    el.battleHint.textContent = "게임 시작을 눌러 다시 달려보세요.";
    return;
  }

  el.battleTitle.textContent = `${dragon.name} 스테이지`;
  el.battleHint.textContent = `앞으로 달리며 ${dragon.color} 하트를 ${dragon.calmNeed}번 맞추세요. (스페이스: 하트, ↑: 점프)`;
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
      setBattleText();
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
  state.hero = { x: 120, y: 248, vy: 0, onGround: true };
  state.projectiles = [];
  state.dragonEntity = null;
  state.worldOffset = 0;
  cancelAnimationFrame(state.animationId);
  refreshUI();
  setBattleText();
  renderFrame();
  say("처음 상태로 되돌렸어요. 게임 시작을 누르면 다시 달립니다.");
}

function say(text) {
  el.message.textContent = text;
}

function randomColor() {
  const colors = ["#f94144", "#f3722c", "#43aa8b", "#577590", "#90be6d", "#f8961e"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function normalizeHex(color) {
  return String(color).trim().toLowerCase();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
