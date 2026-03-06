const DEFAULT_CONFIG = {
  title: "샤이닝 프린세스: 버티컬 로그 러너",
  heroName: "샤이닝 프린세스",
  story: "좌우 이동과 점프로 생존하고, 자동으로 발동되는 검/마법/필살기로 적을 물리치세요!",
  pixelSize: 8,
  dragons: [
    { name: "루비몽", color: "#ef476f", calmNeed: 2 },
    { name: "썬몽", color: "#ffd166", calmNeed: 2 },
    { name: "리프몽", color: "#06d6a0", calmNeed: 3 }
  ],
  backgroundImage: "",
  heroImage: "",
  enemyImage: "",
  bossImage: ""
};

const STORAGE_KEY = "shining_princess_config_v2";
const SCORE_KEY = "shining_princess_scores_v1";
const FINAL_STAGE = 10;
const STAGE_TARGET = 20;

const state = {
  config: loadConfig(),
  started: false,
  paused: false,
  stage: 1,
  kills: 0,
  stageKills: 0,
  score: 0,
  progress: 0,
  energy: 8,
  hero: { x: 170, y: 520, vy: 0, onGround: true },
  enemies: [],
  projectiles: [],
  skills: [],
  items: [],
  boss: null,
  spawnTimer: 30,
  spawned: 0,
  worldOffset: 0,
  animationId: null,
  lastTs: 0,
  keys: {},
  upgrades: { sword: 1, magic: 1, ultimate: 1, speed: 1 },
  cooldowns: { sword: 0, magic: 0, ultimate: 0 }
};

const el = {
  canvas: document.getElementById("game"),
  stageLabel: document.getElementById("stageLabel"),
  progressLabel: document.getElementById("progressLabel"),
  energyLabel: document.getElementById("energyLabel"),
  scoreLabel: document.getElementById("scoreLabel"),
  killLabel: document.getElementById("killLabel"),
  scoreList: document.getElementById("scoreList"),
  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  message: document.getElementById("message"),
  battleUI: document.getElementById("battleUI"),
  battleTitle: document.getElementById("battleTitle"),
  battleHint: document.getElementById("battleHint"),
  leftBtn: document.getElementById("leftBtn"),
  rightBtn: document.getElementById("rightBtn"),
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
  heroUpload: document.getElementById("heroUpload"),
  enemyUpload: document.getElementById("enemyUpload"),
  bossUpload: document.getElementById("bossUpload"),
  pixelSize: document.getElementById("pixelSize"),
  pixelPreview: document.getElementById("pixelPreview"),
  guidePlayBtn: document.getElementById("guidePlayBtn")
};

const ctx = el.canvas.getContext("2d");
const pctx = el.pixelPreview.getContext("2d");

setupAdminUI();
wireEvents();
refreshUI();
renderScores();
setBattleText();
renderFrame();
say("단축키: ← → ↑ (공격은 자동 발동)");

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
  el.guidePlayBtn.addEventListener("click", () => {
    pullConfigFromAdmin();
    saveConfig();
    resetGame();
    state.started = true;
    loop();
  });

  el.leftBtn.addEventListener("pointerdown", () => (state.keys.ArrowLeft = true));
  el.rightBtn.addEventListener("pointerdown", () => (state.keys.ArrowRight = true));
  el.leftBtn.addEventListener("pointerup", () => (state.keys.ArrowLeft = false));
  el.rightBtn.addEventListener("pointerup", () => (state.keys.ArrowRight = false));
  el.jumpBtn.addEventListener("click", jump);

  window.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowUp") jump();
    state.keys[e.key] = true;
  });
  window.addEventListener("keyup", (e) => {
    state.keys[e.key] = false;
  });

  el.addDragonBtn.addEventListener("click", () => {
    state.config.dragons.push({ name: "새 적", color: "#ffffff", calmNeed: 2 });
    renderDragonForm();
  });
  el.saveConfigBtn.addEventListener("click", () => {
    pullConfigFromAdmin();
    saveConfig();
    say("설정을 저장했습니다.");
  });
  el.exportConfigBtn.addEventListener("click", exportConfig);
  el.importConfigInput.addEventListener("change", importConfig);
  el.bgUpload.addEventListener("change", (e) => handleImageUpload(e, "backgroundImage"));
  el.heroUpload.addEventListener("change", (e) => handleImageUpload(e, "heroImage"));
  el.enemyUpload.addEventListener("change", (e) => handleImageUpload(e, "enemyImage"));
  el.bossUpload.addEventListener("change", (e) => handleImageUpload(e, "bossImage"));
  el.pixelSize.addEventListener("input", renderPixelPreview);
}

function loop(ts = 0) {
  if (!state.started || state.paused) return;
  const delta = state.lastTs ? Math.min((ts - state.lastTs) / 16.67, 2) : 1;
  state.lastTs = ts;
  update(delta);
  renderFrame();
  state.animationId = requestAnimationFrame(loop);
}

function update(delta) {
  const speed = 2 + (state.upgrades.speed - 1) * 0.25;
  state.worldOffset += speed * delta;

  moveHero(delta, speed);
  spawnEnemies(delta);
  updateEnemies(delta, speed);
  autoUseSkills(delta);
  updateProjectiles(delta);
  updateItems(delta, speed);
  updateBoss(delta, speed);
  checkStageFlow();

  const base = ((state.stage - 1) / FINAL_STAGE) * 100;
  state.progress = Math.min(100, base + (state.spawned / STAGE_TARGET) * (100 / FINAL_STAGE));

  if (state.energy <= 0) gameOver("에너지가 모두 소진되었습니다.");
  refreshUI();
}

function moveHero(delta, speed) {
  if (state.keys.ArrowLeft) state.hero.x -= 4.2 * delta;
  if (state.keys.ArrowRight) state.hero.x += 4.2 * delta;
  state.hero.x = Math.max(16, Math.min(312, state.hero.x));

  state.hero.vy += 0.48 * delta;
  state.hero.y += state.hero.vy * delta;
  if (state.hero.y >= 520) {
    state.hero.y = 520;
    state.hero.vy = 0;
    state.hero.onGround = true;
  } else {
    state.hero.onGround = false;
  }
}

function jump() {
  if (!state.started || !state.hero.onGround) return;
  state.hero.vy = -8;
}

function spawnEnemies(delta) {
  if (state.boss || state.spawned >= STAGE_TARGET) return;
  state.spawnTimer -= delta;
  if (state.spawnTimer > 0) return;
  const d = state.config.dragons[state.spawned % state.config.dragons.length] || DEFAULT_CONFIG.dragons[0];
  const laneX = [40, 110, 180, 250, 320][Math.floor(Math.random() * 5)] - 16;
  state.enemies.push({ x: laneX, y: -50, w: 32, h: 32, hp: d.calmNeed + state.stage * 0.15, color: d.color, name: d.name });
  state.spawned += 1;
  state.spawnTimer = Math.max(10, 28 - state.stage);
}

function updateEnemies(delta, speed) {
  state.enemies = state.enemies.filter((e) => {
    e.y += (1.5 + speed * 0.5 + state.stage * 0.08) * delta;
    if (intersects(e, heroBox())) {
      state.energy -= 1;
      return false;
    }
    if (e.y > 680) {
      state.energy -= 1;
      return false;
    }
    return true;
  });
}

function autoUseSkills(delta) {
  state.cooldowns.sword -= delta;
  state.cooldowns.magic -= delta;
  state.cooldowns.ultimate -= delta;

  if (state.cooldowns.sword <= 0) {
    state.cooldowns.sword = Math.max(7, 22 - state.upgrades.sword * 2);
    state.skills.push({ type: "sword", ttl: 8, r: 56 + state.upgrades.sword * 4 });
    hitEnemiesAroundHero(1 + state.upgrades.sword * 0.45, 58 + state.upgrades.sword * 5);
  }
  if (state.cooldowns.magic <= 0) {
    state.cooldowns.magic = Math.max(5, 18 - state.upgrades.magic * 1.8);
    state.projectiles.push({ x: state.hero.x + 16, y: state.hero.y + 10, vy: -6.2, power: 1 + state.upgrades.magic * 0.55, w: 8, h: 12 });
  }
  if (state.cooldowns.ultimate <= 0) {
    state.cooldowns.ultimate = Math.max(90, 240 - state.upgrades.ultimate * 20);
    state.skills.push({ type: "ultimate", ttl: 22, r: 120 + state.upgrades.ultimate * 10 });
    hitEnemiesAroundHero(3 + state.upgrades.ultimate, 122 + state.upgrades.ultimate * 12);
  }

  state.skills = state.skills.filter((s) => (s.ttl -= delta) > 0);
}

function updateProjectiles(delta) {
  state.projectiles = state.projectiles.filter((p) => {
    p.y += p.vy * delta;
    for (const e of state.enemies) {
      if (intersects(p, e)) {
        e.hp -= p.power;
        if (e.hp <= 0) killEnemy(e);
        return false;
      }
    }
    if (state.boss && intersects(p, state.boss)) {
      state.boss.hp -= p.power;
      if (state.boss.hp <= 0) clearGame();
      return false;
    }
    return p.y > -20;
  });

  state.enemies = state.enemies.filter((e) => e.hp > 0);
}

function updateItems(delta, speed) {
  state.items = state.items.filter((item) => {
    item.y += (1.8 + speed * 0.4) * delta;
    if (intersects(item, heroBox())) {
      applyUpgrade(item.kind);
      return false;
    }
    return item.y < 680;
  });
}

function updateBoss(delta, speed) {
  if (!state.boss) return;
  state.boss.y += state.boss.dir * (0.9 + speed * 0.15) * delta;
  if (state.boss.y < 70 || state.boss.y > 260) state.boss.dir *= -1;
  if (intersects(state.boss, heroBox())) state.energy -= 1;
}

function checkStageFlow() {
  if (!state.boss && state.spawned >= STAGE_TARGET && state.enemies.length === 0) {
    if (state.stage < FINAL_STAGE) {
      state.stage += 1;
      state.stageKills = 0;
      state.spawned = 0;
      state.spawnTimer = 20;
      say(`🌟 ${state.stage}스테이지 시작!`);
    } else {
      state.boss = { x: 130, y: 120, w: 96, h: 96, hp: 140, maxHp: 140, dir: 1 };
      say("👑 최종 보스 등장!");
    }
    setBattleText();
  }
}

function killEnemy(enemy) {
  state.kills += 1;
  state.stageKills += 1;
  state.score += 100 + state.stage * 10;
  if (Math.random() < 0.25) {
    const kinds = ["sword", "magic", "ultimate", "speed"];
    state.items.push({ x: enemy.x + 8, y: enemy.y, w: 14, h: 14, kind: kinds[Math.floor(Math.random() * kinds.length)] });
  }
}

function applyUpgrade(kind) {
  if (kind === "speed") state.upgrades.speed = Math.min(8, state.upgrades.speed + 1);
  if (kind === "sword") state.upgrades.sword = Math.min(8, state.upgrades.sword + 1);
  if (kind === "magic") state.upgrades.magic = Math.min(8, state.upgrades.magic + 1);
  if (kind === "ultimate") state.upgrades.ultimate = Math.min(8, state.upgrades.ultimate + 1);
  state.score += 50;
  say(`강화 획득: ${kind.toUpperCase()} Lv UP`);
}

function hitEnemiesAroundHero(damage, radius) {
  const hx = state.hero.x + 16;
  const hy = state.hero.y + 20;
  for (const e of state.enemies) {
    const dx = e.x + 16 - hx;
    const dy = e.y + 16 - hy;
    if (Math.hypot(dx, dy) <= radius) {
      e.hp -= damage;
      if (e.hp <= 0) killEnemy(e);
    }
  }
  state.enemies = state.enemies.filter((e) => e.hp > 0);
  if (state.boss) {
    const dx = state.boss.x + 40 - hx;
    const dy = state.boss.y + 40 - hy;
    if (Math.hypot(dx, dy) <= radius + 20) {
      state.boss.hp -= damage * 0.75;
      if (state.boss.hp <= 0) clearGame();
    }
  }
}

function clearGame() {
  state.progress = 100;
  state.score += 5000;
  saveScore("CLEAR");
  state.started = false;
  say("🏆 클리어! 점수가 랭킹에 등록되었습니다.");
  renderScores();
}

function gameOver(msg) {
  saveScore("GAME OVER");
  state.started = false;
  say(`${msg} 점수가 랭킹에 등록되었습니다.`);
  renderScores();
}

function heroBox() {
  return { x: state.hero.x, y: state.hero.y, w: 32, h: 40 };
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function renderFrame() {
  const { width, height } = el.canvas;
  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawLanes(width, height);
  drawHero();
  state.enemies.forEach(drawEnemy);
  state.projectiles.forEach(drawProjectile);
  state.items.forEach(drawItem);
  state.skills.forEach(drawSkill);
  if (state.boss) drawBoss();
  drawProgress(width);
}

function drawBackground(width, height) {
  if (!state.config.backgroundImage) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#1b1c3c");
    grad.addColorStop(1, "#2e4a7b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 24; i += 1) {
      const y = ((i * 40 + state.worldOffset * 3) % (height + 20)) - 10;
      const x = 20 + (i * 23) % (width - 30);
      ctx.fillStyle = i % 2 ? "#d7ecff" : "#ffd9f8";
      ctx.fillRect(x, y, 3, 3);
    }
    return;
  }
  drawPixelBackground(ctx, width, height, state.config.backgroundImage);
}

function drawLanes(width, height) {
  ctx.fillStyle = "rgba(15,18,44,0.35)";
  ctx.fillRect(0, 0, width, height);
  for (let i = 1; i <= 4; i += 1) {
    const x = (width / 5) * i;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let y = (state.worldOffset * 5) % 40; y < height; y += 40) {
      ctx.fillRect(x, y, 2, 20);
    }
  }
}

function drawHero() {
  if (state.config.heroImage) {
    drawImageData(state.config.heroImage, state.hero.x, state.hero.y, 34, 42);
    return;
  }
  ctx.fillStyle = "#ff6bb3";
  ctx.fillRect(state.hero.x, state.hero.y, 30, 36);
  ctx.fillStyle = "#ffe0bd";
  ctx.fillRect(state.hero.x + 8, state.hero.y - 8, 14, 10);
}

function drawEnemy(e) {
  if (state.config.enemyImage) {
    drawImageData(state.config.enemyImage, e.x, e.y, 32, 32);
    return;
  }
  ctx.fillStyle = e.color;
  ctx.fillRect(e.x, e.y, 28, 28);
  ctx.fillStyle = "#fff";
  ctx.fillRect(e.x + 18, e.y + 8, 4, 4);
}

function drawBoss() {
  if (state.config.bossImage) {
    drawImageData(state.config.bossImage, state.boss.x, state.boss.y, state.boss.w, state.boss.h);
  } else {
    ctx.fillStyle = "#ff5da8";
    ctx.fillRect(state.boss.x, state.boss.y, state.boss.w, state.boss.h);
  }
  ctx.fillStyle = "#222944";
  ctx.fillRect(20, 24, 160, 8);
  ctx.fillStyle = "#ff477e";
  ctx.fillRect(20, 24, (160 * state.boss.hp) / state.boss.maxHp, 8);
}

function drawProjectile(p) {
  ctx.fillStyle = "#fff6ff";
  ctx.fillRect(p.x, p.y, p.w, p.h);
}

function drawItem(item) {
  const color = { sword: "#ff914d", magic: "#a66cff", ultimate: "#ffe066", speed: "#7cf29a" }[item.kind];
  ctx.fillStyle = color;
  ctx.fillRect(item.x, item.y, 12, 12);
}

function drawSkill(skill) {
  const cx = state.hero.x + 16;
  const cy = state.hero.y + 20;
  ctx.strokeStyle = skill.type === "ultimate" ? "#ffe066" : "#9ae8ff";
  ctx.lineWidth = skill.type === "ultimate" ? 5 : 3;
  ctx.beginPath();
  ctx.arc(cx, cy, skill.r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawProgress(width) {
  ctx.fillStyle = "#1f274b";
  ctx.fillRect(20, 10, width - 40, 12);
  ctx.fillStyle = "#58d68d";
  ctx.fillRect(20, 10, ((width - 40) * state.progress) / 100, 12);
}

function drawImageData(dataUrl, x, y, w, h) {
  const img = new Image();
  img.src = dataUrl;
  ctx.drawImage(img, x, y, w, h);
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
    el.battleHint.textContent = "좌우 회피 + 자동공격으로 생존하세요.";
    return;
  }
  el.battleTitle.textContent = `${state.stage} 스테이지`;
  el.battleHint.textContent = `적 ${state.stageKills}/${STAGE_TARGET} 처치`;
}

function refreshUI() {
  el.stageLabel.textContent = state.boss ? "BOSS" : String(state.stage);
  el.progressLabel.textContent = `${Math.floor(state.progress)}%`;
  el.energyLabel.textContent = String(Math.max(0, state.energy));
  el.scoreLabel.textContent = String(state.score);
  el.killLabel.textContent = String(state.kills);
  setBattleText();
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
    wrap.innerHTML = `<div class="dragon-row">
      <input data-kind="name" data-idx="${idx}" type="text" value="${escapeHtml(dragon.name)}" />
      <input data-kind="color" data-idx="${idx}" type="color" value="${dragon.color}" />
      <input data-kind="calmNeed" data-idx="${idx}" type="number" min="1" max="6" value="${dragon.calmNeed}" />
      <button data-remove="${idx}" type="button">삭제</button>
    </div>`;
    el.dragonList.appendChild(wrap);
  });
  el.dragonList.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.config.dragons.splice(Number(btn.dataset.remove), 1);
      renderDragonForm();
    });
  });
}

function pullConfigFromAdmin() {
  state.config.title = el.cfgTitle.value.trim() || DEFAULT_CONFIG.title;
  state.config.heroName = el.cfgHeroName.value.trim() || DEFAULT_CONFIG.heroName;
  state.config.story = el.cfgStory.value.trim() || DEFAULT_CONFIG.story;
  state.config.pixelSize = Number(el.pixelSize.value) || 8;
  const next = [];
  el.dragonList.querySelectorAll(".dragon-item").forEach((item) => {
    next.push({
      name: item.querySelector('input[data-kind="name"]').value.trim() || "적",
      color: item.querySelector('input[data-kind="color"]').value || "#fff",
      calmNeed: Math.max(1, Number(item.querySelector('input[data-kind="calmNeed"]').value) || 2)
    });
  });
  state.config.dragons = next.length ? next : DEFAULT_CONFIG.dragons;
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
      state.config = { ...structuredClone(DEFAULT_CONFIG), ...JSON.parse(String(reader.result)) };
      setupAdminUI();
      saveConfig();
      say("설정 파일을 불러왔어요.");
    } catch {
      say("JSON 파일 형식 오류입니다.");
    }
  };
  reader.readAsText(file, "utf-8");
}

function handleImageUpload(event, key) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.config[key] = String(reader.result);
    renderPixelPreview();
  };
  reader.readAsDataURL(file);
}

function renderPixelPreview() {
  const { width, height } = el.pixelPreview;
  pctx.clearRect(0, 0, width, height);
  pctx.fillStyle = "#1a2040";
  pctx.fillRect(0, 0, width, height);
  if (state.config.heroImage) {
    const img = new Image();
    img.onload = () => pctx.drawImage(img, 20, 40, 50, 60);
    img.src = state.config.heroImage;
  }
  if (state.config.enemyImage) {
    const img = new Image();
    img.onload = () => pctx.drawImage(img, 120, 60, 44, 44);
    img.src = state.config.enemyImage;
  }
  if (state.config.bossImage) {
    const img = new Image();
    img.onload = () => pctx.drawImage(img, 210, 40, 90, 90);
    img.src = state.config.bossImage;
  }
}

function saveScore(tag) {
  const scores = loadScores();
  scores.push({ score: state.score, stage: state.stage, tag, at: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores.slice(0, 5)));
}

function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(SCORE_KEY) || "[]");
  } catch {
    return [];
  }
}

function renderScores() {
  const scores = loadScores();
  el.scoreList.innerHTML = "";
  if (!scores.length) {
    el.scoreList.innerHTML = "<li>아직 기록이 없습니다.</li>";
    return;
  }
  scores.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.score}점 · ${s.tag} · Stage ${s.stage}`;
    el.scoreList.appendChild(li);
  });
}

function resetGame() {
  state.started = false;
  state.paused = false;
  state.stage = 1;
  state.kills = 0;
  state.stageKills = 0;
  state.score = 0;
  state.progress = 0;
  state.energy = 8;
  state.hero = { x: 170, y: 520, vy: 0, onGround: true };
  state.enemies = [];
  state.projectiles = [];
  state.skills = [];
  state.items = [];
  state.boss = null;
  state.spawnTimer = 30;
  state.spawned = 0;
  state.worldOffset = 0;
  state.lastTs = 0;
  state.upgrades = { sword: 1, magic: 1, ultimate: 1, speed: 1 };
  state.cooldowns = { sword: 0, magic: 0, ultimate: 0 };
  cancelAnimationFrame(state.animationId);
  refreshUI();
  renderFrame();
  say("초기화 완료. 게임 시작 버튼을 눌러주세요.");
}

function say(text) {
  el.message.textContent = text;
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
