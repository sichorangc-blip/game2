const DEFAULT_CONFIG = {
  title: "샤이닝 프린세스: 레인보우 러너",
  heroName: "샤이닝 프린세스",
  story:
    "점프, 검의 빛, 별마법 3가지 조작으로 스테이지를 클리어하세요! 10개 스테이지를 넘어 최종 보스를 정화하면 승리!",
  pixelSize: 8,
  dragons: [
    { name: "루비 미니", color: "#ef476f", calmNeed: 2 },
    { name: "썬샤인 미니", color: "#ffd166", calmNeed: 2 },
    { name: "리프 미니", color: "#06d6a0", calmNeed: 3 },
    { name: "오션 미니", color: "#118ab2", calmNeed: 3 },
    { name: "바이올렛 미니", color: "#9b5de5", calmNeed: 4 }
  ],
  backgroundImage: ""
};

const STAGE_TARGET = 20;
const FINAL_STAGE = 10;
const STORAGE_KEY = "shining_princess_config_v1";

const STAGE_THEMES = [
  { name: "벚꽃 초원", sky1: "#232046", sky2: "#3d2f63", ground: "#6e5d88", deco: "#f4a3c3" },
  { name: "별빛 언덕", sky1: "#1b234f", sky2: "#2f3f7f", ground: "#5d70a6", deco: "#d6e7ff" },
  { name: "민트 숲", sky1: "#14333f", sky2: "#1f5561", ground: "#3f7d78", deco: "#8de0cc" },
  { name: "노을 사막", sky1: "#4a2b2b", sky2: "#93504f", ground: "#b7775b", deco: "#ffd39a" },
  { name: "오로라 빙원", sky1: "#173350", sky2: "#2a5c77", ground: "#6eb5d6", deco: "#d7fbff" },
  { name: "보랏빛 계곡", sky1: "#2c1f4f", sky2: "#5a3f87", ground: "#8a65ba", deco: "#cab8ff" },
  { name: "하트 정원", sky1: "#5a1f45", sky2: "#8f376a", ground: "#bc6291", deco: "#ffd0e7" },
  { name: "무지개 다리", sky1: "#183544", sky2: "#2f5f7d", ground: "#62a1c9", deco: "#fce38a" },
  { name: "크리스탈 동굴", sky1: "#14243a", sky2: "#25466a", ground: "#4f7ab2", deco: "#9ed2ff" },
  { name: "왕국 성벽", sky1: "#262244", sky2: "#4b4472", ground: "#746f9d", deco: "#f7e9a6" }
];

const state = {
  config: loadConfig(),
  started: false,
  paused: false,
  stage: 1,
  enemiesDefeated: 0,
  totalDefeated: 0,
  progress: 0,
  energy: 8,
  animationId: null,
  lastTs: 0,
  worldOffset: 0,
  hero: { x: 120, y: 248, vy: 0, onGround: true, swordUntil: 0 },
  enemies: [],
  projectiles: [],
  itemDrops: [],
  spawnTimer: 40,
  spawnedInStage: 0,
  boss: null,
  buffs: { speedUntil: 0, powerUntil: 0 },
  keys: {}
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
  swordBtn: document.getElementById("swordBtn"),
  magicBtn: document.getElementById("magicBtn"),
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
setBattleText();
renderFrame();
say("조작키 3개: Z(검빛), X(마법), ↑(점프) · 모바일은 버튼 3개");

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
    state.config.dragons.push({ name: "새 적", color: "#ffffff", calmNeed: 2 });
    renderDragonForm();
  });

  el.saveConfigBtn.addEventListener("click", () => {
    pullConfigFromAdmin();
    saveConfig();
    setBattleText();
    say("설정을 저장했어요.");
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
    loop();
  });

  el.swordBtn.addEventListener("click", swordAttack);
  el.magicBtn.addEventListener("click", castMagic);
  el.jumpBtn.addEventListener("click", jump);

  window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "z", "x", "Z", "X"].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === "ArrowUp") jump();
    if (event.key.toLowerCase() === "z") swordAttack();
    if (event.key.toLowerCase() === "x") castMagic();
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

  update(delta, ts);
  renderFrame();
  state.animationId = requestAnimationFrame(loop);
}

function update(delta, ts) {
  const now = ts || performance.now();
  const speedBoost = now < state.buffs.speedUntil ? 1.45 : 1;
  const runSpeed = 1.8 * speedBoost;
  state.worldOffset += runSpeed * delta;

  applyGravity(delta);
  spawnEnemies(delta);
  moveEnemies(delta, runSpeed);
  moveProjectiles(delta);
  moveItems(delta, runSpeed);
  checkHeroCollisions();

  if (!state.boss && state.spawnedInStage >= STAGE_TARGET && state.enemies.length === 0) {
    if (state.stage < FINAL_STAGE) {
      nextStage();
    } else {
      spawnBoss();
    }
  }

  if (state.boss) {
    updateBoss(delta);
  }

  const baseProgress = ((state.stage - 1) / FINAL_STAGE) * 100;
  const stagePart = (Math.min(state.spawnedInStage, STAGE_TARGET) / STAGE_TARGET) * (100 / FINAL_STAGE);
  state.progress = Math.min(100, baseProgress + stagePart);

  refreshUI();
}

function applyGravity(delta) {
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

function spawnEnemies(delta) {
  if (state.boss || state.spawnedInStage >= STAGE_TARGET) return;
  state.spawnTimer -= delta;
  if (state.spawnTimer > 0) return;

  const archetype = state.config.dragons[state.spawnedInStage % state.config.dragons.length] || DEFAULT_CONFIG.dragons[0];
  state.enemies.push({
    name: archetype.name,
    color: archetype.color,
    hp: Math.max(1, archetype.calmNeed),
    x: 700,
    y: 248,
    speed: 1 + Math.random() * 0.8 + state.stage * 0.03,
    bob: Math.random() * 6
  });
  state.spawnedInStage += 1;
  state.spawnTimer = Math.max(16, 40 - state.stage * 2);
}

function moveEnemies(delta, runSpeed) {
  state.enemies = state.enemies.filter((enemy) => {
    enemy.x -= (enemy.speed + runSpeed * 0.25) * delta;
    enemy.y = 248 + Math.sin((state.worldOffset + enemy.bob) * 0.08) * 2;

    if (enemy.x < -60) {
      hurtHero(1, "적을 놓쳐서");
      return false;
    }

    if (isSwordActive() && intersects(enemy, swordHitbox())) {
      enemy.hp -= swordDamage();
      if (enemy.hp <= 0) {
        defeatEnemy(enemy);
        return false;
      }
    }

    const heroBox = { x: state.hero.x, y: state.hero.y, w: 32, h: 42 };
    if (intersects(enemy, { ...heroBox, w: 34, h: 38 })) {
      hurtHero(1, "적과 충돌해서");
      enemy.x += 35;
    }

    return true;
  });
}

function moveProjectiles(delta) {
  state.projectiles = state.projectiles.filter((shot) => {
    shot.x += shot.vx * delta;
    if (shot.x > 700) return false;

    for (const enemy of state.enemies) {
      if (shot.x > enemy.x && shot.x < enemy.x + 36 && shot.y > enemy.y && shot.y < enemy.y + 36) {
        enemy.hp -= shot.power;
        if (enemy.hp <= 0) {
          defeatEnemy(enemy);
          state.enemies = state.enemies.filter((e) => e !== enemy);
        }
        return false;
      }
    }

    if (state.boss && shot.x > state.boss.x && shot.x < state.boss.x + 90 && shot.y > state.boss.y && shot.y < state.boss.y + 70) {
      state.boss.hp -= shot.power;
      if (state.boss.hp <= 0) {
        clearGame();
      }
      return false;
    }

    return true;
  });
}

function moveItems(delta, runSpeed) {
  state.itemDrops = state.itemDrops.filter((item) => {
    item.x -= (1.5 + runSpeed * 0.2) * delta;
    const heroBox = { x: state.hero.x, y: state.hero.y, w: 32, h: 40 };
    if (intersects(item, heroBox)) {
      if (item.type === "speed") {
        state.buffs.speedUntil = performance.now() + 8000;
        say("⚡ 속도 강화 8초!");
      } else {
        state.buffs.powerUntil = performance.now() + 8000;
        say("✨ 공격 강화 8초!");
      }
      return false;
    }
    return item.x > -20;
  });
}

function checkHeroCollisions() {
  if (state.energy <= 0) {
    state.started = false;
    say("에너지가 모두 소진됐어요. 다시 도전해 보세요!");
  }
}

function jump() {
  if (!state.started || !state.hero.onGround) return;
  state.hero.vy = -7.6;
  state.hero.onGround = false;
}

function swordAttack() {
  if (!state.started) return;
  state.hero.swordUntil = performance.now() + 180;
}

function castMagic() {
  if (!state.started) return;
  state.projectiles.push({
    x: state.hero.x + 24,
    y: state.hero.y + 16,
    vx: 7.4,
    power: magicDamage()
  });
}

function swordDamage() {
  return performance.now() < state.buffs.powerUntil ? 2 : 1;
}

function magicDamage() {
  return performance.now() < state.buffs.powerUntil ? 3 : 2;
}

function isSwordActive() {
  return performance.now() < state.hero.swordUntil;
}

function swordHitbox() {
  return { x: state.hero.x + 28, y: state.hero.y + 4, w: 26, h: 32 };
}

function defeatEnemy(enemy) {
  state.enemiesDefeated += 1;
  state.totalDefeated += 1;
  if (Math.random() < 0.22) {
    state.itemDrops.push({
      x: enemy.x,
      y: enemy.y + 10,
      w: 14,
      h: 14,
      type: Math.random() < 0.5 ? "speed" : "power"
    });
  }
}

function nextStage() {
  state.stage += 1;
  state.spawnedInStage = 0;
  state.enemiesDefeated = 0;
  state.spawnTimer = 25;
  say(`🌟 ${state.stage} 스테이지 시작! 이번에도 적 20명 정화!`);
  setBattleText();
}

function spawnBoss() {
  state.boss = { x: 690, y: 200, hp: 80, maxHp: 80, dir: -1 };
  say("👑 최종 보스 등장! 검빛+마법으로 정화하세요!");
  setBattleText();
}

function updateBoss(delta) {
  state.boss.x += state.boss.dir * 0.8 * delta;
  if (state.boss.x < 420 || state.boss.x > 700) state.boss.dir *= -1;

  if (isSwordActive() && intersects({ x: state.boss.x, y: state.boss.y, w: 90, h: 70 }, swordHitbox())) {
    state.boss.hp -= swordDamage();
    if (state.boss.hp <= 0) clearGame();
  }

  if (intersects({ x: state.boss.x, y: state.boss.y, w: 88, h: 68 }, { x: state.hero.x, y: state.hero.y, w: 32, h: 40 })) {
    hurtHero(1, "보스와 부딪혀서");
  }
}

function clearGame() {
  state.progress = 100;
  state.started = false;
  say("🏆 클리어! 10스테이지 + 보스전 완료!");
}

function hurtHero(amount, reason) {
  state.energy -= amount;
  say(`앗! ${reason} 에너지 -${amount}`);
}

function intersects(a, b) {
  return a.x < b.x + (b.w || 36) && a.x + (a.w || 36) > b.x && a.y < b.y + (b.h || 36) && a.y + (a.h || 36) > b.y;
}

function renderFrame() {
  const { width, height } = el.canvas;
  ctx.clearRect(0, 0, width, height);

  drawBackground(width, height);
  drawGround(width, height);
  drawHero();

  state.enemies.forEach(drawEnemy);
  state.projectiles.forEach(drawMagicShot);
  state.itemDrops.forEach(drawItem);

  if (state.boss) drawBoss();
  drawProgressBar(width);
  drawBuffs();
}

function drawBackground(width, height) {
  const theme = STAGE_THEMES[(state.stage - 1) % STAGE_THEMES.length];
  if (!state.config.backgroundImage) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, theme.sky1);
    grad.addColorStop(1, theme.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 24; i += 1) {
      const x = ((i * 47 - state.worldOffset * 0.6) % (width + 60)) - 20;
      const y = 28 + ((i * 31) % 180);
      ctx.fillStyle = theme.deco;
      ctx.fillRect(x, y, 4, 4);
    }
  } else {
    drawPixelBackground(ctx, width, height, state.config.backgroundImage);
  }
}

function drawGround(width, height) {
  const theme = STAGE_THEMES[(state.stage - 1) % STAGE_THEMES.length];
  const groundY = height - 70;
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, groundY, width, height - groundY);

  for (let i = -2; i < 16; i += 1) {
    const x = ((i * 48 - state.worldOffset * 2.5) % (width + 60)) - 20;
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.17)" : "rgba(0,0,0,0.12)";
    ctx.fillRect(x, groundY + 10, 28, 8);
  }
}

function drawHero() {
  const x = state.hero.x;
  const y = state.hero.y;
  const pixels = [
    [0, 0, "#ffe0bd"], [1, 0, "#ffe0bd"], [0, 1, "#ff5fa2"], [1, 1, "#ff5fa2"],
    [2, 1, "#f8c8dc"], [1, 2, "#ffffff"], [0, 2, "#9d4edd"], [2, 2, "#9d4edd"],
    [1, 3, "#ffe66d"]
  ];

  pixels.forEach(([px, py, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * 10, y + py * 10, 10, 10);
  });

  if (isSwordActive()) {
    ctx.fillStyle = "#f7f7ff";
    ctx.fillRect(x + 30, y + 12, 22, 6);
    ctx.fillStyle = "#9be7ff";
    ctx.fillRect(x + 52, y + 12, 8, 6);
  }
}

function drawEnemy(enemy) {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, 24, 24);
  ctx.fillRect(enemy.x + 24, enemy.y + 8, 12, 12);
  ctx.fillStyle = "#fff";
  ctx.fillRect(enemy.x + 28, enemy.y + 12, 3, 3);
}

function drawMagicShot(shot) {
  ctx.fillStyle = "#ffd6ff";
  ctx.fillRect(shot.x, shot.y, 8, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(shot.x + 2, shot.y + 2, 4, 4);
}

function drawItem(item) {
  ctx.fillStyle = item.type === "speed" ? "#7cf29a" : "#ffd166";
  ctx.fillRect(item.x, item.y, 12, 12);
}

function drawBoss() {
  ctx.fillStyle = "#ff7adf";
  ctx.fillRect(state.boss.x, state.boss.y, 80, 60);
  ctx.fillStyle = "#fff";
  ctx.fillRect(state.boss.x + 58, state.boss.y + 20, 6, 6);

  ctx.fillStyle = "#222944";
  ctx.fillRect(430, 24, 180, 10);
  ctx.fillStyle = "#ff4d8d";
  ctx.fillRect(430, 24, (180 * state.boss.hp) / state.boss.maxHp, 10);
}

function drawProgressBar(width) {
  ctx.fillStyle = "#222944";
  ctx.fillRect(20, 10, width - 40, 16);
  ctx.fillStyle = "#58d68d";
  ctx.fillRect(20, 10, ((width - 40) * state.progress) / 100, 16);
}

function drawBuffs() {
  const now = performance.now();
  const buffs = [];
  if (now < state.buffs.speedUntil) buffs.push("⚡속도UP");
  if (now < state.buffs.powerUntil) buffs.push("✨공격UP");
  if (buffs.length) {
    ctx.fillStyle = "rgba(12,12,30,0.7)";
    ctx.fillRect(20, 32, 120, 18);
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText(buffs.join(" "), 24, 45);
  }
}

function drawPixelBackground(context, width, height, dataUrl) {
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
  el.battleUI.classList.remove("hidden");
  if (state.boss) {
    el.battleTitle.textContent = "최종 보스전";
    el.battleHint.textContent = "Z: 검빛 · X: 마법 · ↑: 점프";
    return;
  }

  const theme = STAGE_THEMES[(state.stage - 1) % STAGE_THEMES.length];
  el.battleTitle.textContent = `${state.stage} 스테이지 · ${theme.name}`;
  el.battleHint.textContent = `이번 스테이지 목표: 적 20명 정화 (${Math.min(state.spawnedInStage, STAGE_TARGET)}/${STAGE_TARGET} 출현)`;
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
        <input data-kind="calmNeed" data-idx="${idx}" type="number" min="1" max="6" value="${dragon.calmNeed}" />
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
    const name = item.querySelector('input[data-kind="name"]').value.trim() || "이름 없는 적";
    const color = item.querySelector('input[data-kind="color"]').value || "#ffffff";
    const calmNeed = Math.max(1, Number(item.querySelector('input[data-kind="calmNeed"]').value) || 2);
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
  el.stageLabel.textContent = state.boss ? "Boss" : String(state.stage);
  el.progressLabel.textContent = `${Math.floor(state.progress)}%`;
  el.energyLabel.textContent = String(state.energy);
  el.friendLabel.textContent = `${state.totalDefeated}`;
  setBattleText();
}

function resetGame() {
  state.started = false;
  state.paused = false;
  state.stage = 1;
  state.enemiesDefeated = 0;
  state.totalDefeated = 0;
  state.progress = 0;
  state.energy = 8;
  state.lastTs = 0;
  state.worldOffset = 0;
  state.hero = { x: 120, y: 248, vy: 0, onGround: true, swordUntil: 0 };
  state.enemies = [];
  state.projectiles = [];
  state.itemDrops = [];
  state.spawnTimer = 40;
  state.spawnedInStage = 0;
  state.boss = null;
  state.buffs = { speedUntil: 0, powerUntil: 0 };
  cancelAnimationFrame(state.animationId);
  refreshUI();
  renderFrame();
  say("초기화 완료! 게임 시작을 누르면 1스테이지부터 시작됩니다.");
}

function say(text) {
  el.message.textContent = text;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
