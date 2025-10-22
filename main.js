const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const questStepsEl = document.getElementById('quest-steps');
const inventoryEl = document.getElementById('inventory-list');
const currentRiteEl = document.getElementById('current-rite');
const dayCountEl = document.getElementById('day-count');
const clockEl = document.getElementById('clock');
const meditationStatusEl = document.getElementById('meditation-status');
const meditationProgressEl = document.getElementById('meditation-progress');
const meditationBarEl = document.getElementById('meditation-bar');
const mapModal = document.getElementById('map-modal');
const mapCanvas = document.getElementById('world-map');
const mapCtx = mapCanvas.getContext('2d');
const closeMapBtn = document.getElementById('close-map');

const keys = new Set();

const GAME_DIMENSIONS = {
  width: 960,
  height: 640,
  worldWidth: 5600,
  worldHeight: 5600,
};

const PLAYER_CONFIG = {
  speed: 250,
  sprintSpeed: 330,
  width: 64,
  height: 64,
};

const SHRINES = [
  { id: 'spring', name: 'Spring Shrine', x: 900, y: 4800, radius: 220, color: '#89f7a5' },
  { id: 'bloom', name: 'Bloom Shrine', x: 1500, y: 3600, radius: 200, color: '#b2ff66' },
  { id: 'summer', name: 'Summer Shrine', x: 2600, y: 4800, radius: 220, color: '#ffe066' },
  { id: 'storm', name: 'Storm Shrine', x: 3600, y: 4000, radius: 210, color: '#80ffea' },
  { id: 'ember', name: 'Ember Shrine', x: 4600, y: 4700, radius: 200, color: '#ff9f43' },
  { id: 'harvest', name: 'Harvest Shrine', x: 4700, y: 3100, radius: 200, color: '#feca57' },
  { id: 'autumn', name: 'Autumn Shrine', x: 3600, y: 2100, radius: 210, color: '#ff9f89' },
  { id: 'twilight', name: 'Twilight Shrine', x: 4500, y: 1200, radius: 210, color: '#a18dff' },
  { id: 'frost', name: 'Frost Shrine', x: 3100, y: 900, radius: 220, color: '#8bd0ff' },
  { id: 'aurora', name: 'Aurora Shrine', x: 1800, y: 1000, radius: 230, color: '#9be7ff' },
  { id: 'depths', name: 'Depths Shrine', x: 900, y: 1600, radius: 210, color: '#4bd3c1' },
  { id: 'midnight', name: 'Midnight Shrine', x: 1200, y: 2800, radius: 230, color: '#caa7ff' },
];

const ITEM_TYPES = {
  dewblossom: { name: 'Dewblossom Petal', asset: 'assets/dewblossom.svg' },
  sunpearl: { name: 'Sun Pearl', asset: 'assets/sunpearl.svg' },
  emberpine: { name: 'Emberpine Cone', asset: 'assets/emberpine.svg' },
  stormleaf: { name: 'Stormleaf', asset: 'assets/stormleaf.svg' },
  duskcap: { name: 'Duskcap', asset: 'assets/duskcap.svg' },
  frostfern: { name: 'Frostfern', asset: 'assets/frostfern.svg' },
  aurora_shard: { name: 'Aurora Shard', asset: 'assets/aurora_shard.svg' },
  echo_seed: { name: 'Echo Seed', asset: 'assets/echo_seed.svg' },
  spiritfire: { name: 'Spiritfire Ember', asset: 'assets/spiritfire.svg' },
  solstice_sigil: { name: 'Solstice Sigil', asset: 'assets/solstice_sigil.svg' },
  rootwhisper: { name: 'Rootwhisper Bark', asset: 'assets/rootwhisper.svg' },
  veilwater: { name: 'Veilwater Vial', asset: 'assets/veilwater.svg' },
};

const QUESTS = [
  {
    id: 'rite-1',
    title: 'Rite I · Spring Awakening',
    summary: 'Gather dewblossoms from the southern glades to stir the grove from slumber.',
    gather: { dewblossom: 18 },
    shrineId: 'spring',
    ritualSeconds: 300,
    spawn: { x: 900, y: 4800, radius: 700 },
    narrative: [
      'The grove is quiet after the long winter. The Spring Shrine calls for dewblossoms gleaming with the first light.',
      'Harvest 18 Dewblossom Petals from the misty glades south of the camp.',
      'Return to the Spring Shrine and hold Space to meditate for five minutes to awaken the waters.',
    ],
  },
  {
    id: 'rite-2',
    title: 'Rite II · Blooming Paths',
    summary: 'Offer sunpearls to guide new growth through the forest trails.',
    gather: { sunpearl: 22 },
    shrineId: 'bloom',
    ritualSeconds: 300,
    spawn: { x: 1500, y: 3600, radius: 800 },
    narrative: [
      'With the waters awakened, radiant sunpearls bud along the shaded paths.',
      'Collect 22 Sun Pearls while exploring the southern ridges.',
      'Meditate within the Bloom Shrine for five minutes to weave guiding lights along the trails.',
    ],
  },
  {
    id: 'rite-3',
    title: 'Rite III · Crown of Summer',
    summary: 'Gather emberpine cones to fortify the forest canopy for the season of heat.',
    gather: { emberpine: 24 },
    shrineId: 'summer',
    ritualSeconds: 300,
    spawn: { x: 2600, y: 4800, radius: 850 },
    narrative: [
      'Summer storms are on the horizon. Emberpine cones shield the canopy from scorching winds.',
      'Collect 24 Emberpine Cones across the southern expanse.',
      'Meditate within the Summer Shrine for five minutes to braid the crowns of the great trees.',
    ],
  },
  {
    id: 'rite-4',
    title: 'Rite IV · Thunderwatch',
    summary: 'Gather stormleaves to calm the brewing tempests.',
    gather: { stormleaf: 20 },
    shrineId: 'storm',
    ritualSeconds: 300,
    spawn: { x: 3600, y: 4000, radius: 780 },
    narrative: [
      'Lightning prowls the northern skies. Stormleaves can channel the fury safely to the earth.',
      'Collect 20 Stormleaf fronds among the wind-torn clearings.',
      'Meditate for five minutes within the Storm Shrine to bind the thunder to the grove.',
    ],
  },
  {
    id: 'rite-5',
    title: 'Rite V · Ember Vigil',
    summary: 'Collect spiritfire embers to keep the hearths alight through late summer nights.',
    gather: { spiritfire: 26 },
    shrineId: 'ember',
    ritualSeconds: 300,
    spawn: { x: 4600, y: 4700, radius: 700 },
    narrative: [
      'Night winds threaten to snuff the hearths. Spiritfire embers preserve the warmth.',
      'Collect 26 Spiritfire Embers around the Ember Shrine.',
      'Hold Space inside the Ember Shrine for five minutes to weave the embers into a lasting vigil.',
    ],
  },
  {
    id: 'rite-6',
    title: 'Rite VI · Harvest Concord',
    summary: 'Gather rootwhisper bark to bless the harvest.',
    gather: { rootwhisper: 20 },
    shrineId: 'harvest',
    ritualSeconds: 300,
    spawn: { x: 4700, y: 3100, radius: 750 },
    narrative: [
      'The groves bend heavy with promise. Rootwhisper bark seals gratitude into the soil.',
      'Collect 20 Rootwhisper Bark strips among the harvest terraces.',
      'Meditate for five minutes at the Harvest Shrine to share the bounty.',
    ],
  },
  {
    id: 'rite-7',
    title: 'Rite VII · Autumn Tapestry',
    summary: 'Collect duskcap mushrooms to paint the twilight tapestry.',
    gather: { duskcap: 28 },
    shrineId: 'autumn',
    ritualSeconds: 300,
    spawn: { x: 3600, y: 2100, radius: 820 },
    narrative: [
      'The air cools and twilight lingers. Duskcaps dye the sky in amber trails.',
      'Gather 28 Duskcaps across the autumn glades.',
      'Meditate within the Autumn Shrine for five minutes to weave the dusk tapestry.',
    ],
  },
  {
    id: 'rite-8',
    title: 'Rite VIII · Veil of Twilight',
    summary: 'Collect veilwater vials to soften the encroaching dark.',
    gather: { veilwater: 24 },
    shrineId: 'twilight',
    ritualSeconds: 300,
    spawn: { x: 4500, y: 1200, radius: 680 },
    narrative: [
      'Night settles deeper with each passing hour. Veilwater holds back the shadows.',
      'Collect 24 Veilwater Vials from luminous pools.',
      'Meditate inside the Twilight Shrine for five minutes to cast the protective veil.',
    ],
  },
  {
    id: 'rite-9',
    title: 'Rite IX · Frostbound Breath',
    summary: 'Gather frostferns to shield the grove from freezing winds.',
    gather: { frostfern: 26 },
    shrineId: 'frost',
    ritualSeconds: 300,
    spawn: { x: 3100, y: 900, radius: 820 },
    narrative: [
      'Frost creeps along the water. Frostferns insulate the roots against the chill.',
      'Collect 26 Frostfern fronds in the northern snows.',
      'Meditate for five minutes at the Frost Shrine to warm the frozen breath.',
    ],
  },
  {
    id: 'rite-10',
    title: 'Rite X · Auroral Chorus',
    summary: 'Collect aurora shards to harmonize the winter lights.',
    gather: { aurora_shard: 24 },
    shrineId: 'aurora',
    ritualSeconds: 300,
    spawn: { x: 1800, y: 1000, radius: 780 },
    narrative: [
      'The aurora hums in dissonance. Gathering shards will restore the melody.',
      'Collect 24 Aurora Shards along the crystalline rivers.',
      'Meditate in the Aurora Shrine for five minutes to calm the lights.',
    ],
  },
  {
    id: 'rite-11',
    title: 'Rite XI · Echoes Below',
    summary: 'Collect echo seeds to steady the caverns beneath the grove.',
    gather: { echo_seed: 22 },
    shrineId: 'depths',
    ritualSeconds: 300,
    spawn: { x: 900, y: 1600, radius: 760 },
    narrative: [
      'The earth murmurs with shifting caverns. Echo seeds resonate stability.',
      'Collect 22 Echo Seeds in the cavernous hollows.',
      'Meditate within the Depths Shrine for five minutes to still the echoes.',
    ],
  },
  {
    id: 'rite-12',
    title: 'Rite XII · Midnight Accord',
    summary: 'Collect solstice sigils to seal a year of balance.',
    gather: { solstice_sigil: 30 },
    shrineId: 'midnight',
    ritualSeconds: 300,
    spawn: { x: 1200, y: 2800, radius: 840 },
    narrative: [
      'All seasons converge in the Midnight Grove. The final rite binds every promise kept.',
      'Collect 30 Solstice Sigils among the quiet stands.',
      'Meditate at the Midnight Shrine for five minutes to close the cycle and welcome dawn.',
    ],
  },
];

const ASSET_PATHS = {
  grass: 'assets/grass.svg',
  player: 'assets/player.svg',
  rock: 'assets/rock.svg',
  crystal: 'assets/crystal.svg',
  ...Object.fromEntries(Object.entries(ITEM_TYPES).map(([key, value]) => [key, value.asset])),
};

class Collectible {
  constructor(type, x, y, radius) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.angle = Math.random() * Math.PI * 2;
    this.collected = false;
  }

  update(dt) {
    this.angle += dt;
  }
}

class Obstacle {
  constructor(x, y, width, height, rotation = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
  }

  get rect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = PLAYER_CONFIG.width;
    this.height = PLAYER_CONFIG.height;
    this.speed = PLAYER_CONFIG.speed;
    this.facing = 0;
  }

  get rect() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }
}

class QuestManager {
  constructor(game) {
    this.game = game;
    this.currentIndex = -1;
    this.activeQuest = null;
    this.completed = new Set();
    this.meditationTimer = 0;
  }

  start() {
    this.advanceQuest();
  }

  reset() {
    this.currentIndex = -1;
    this.activeQuest = null;
    this.completed.clear();
    this.meditationTimer = 0;
    this.game.inventory.clear();
    this.game.updateInventoryUI();
    questStepsEl.innerHTML = '';
    currentRiteEl.textContent = '—';
    this.start();
  }

  advanceQuest() {
    this.currentIndex += 1;
    this.meditationTimer = 0;

    if (this.currentIndex >= QUESTS.length) {
      this.activeQuest = null;
      questStepsEl.innerHTML = '';
      this.game.inventory.clear();
      this.game.updateInventoryUI();
      this.game.enqueueStatus('All twelve rites are complete. Dawn breaks over a renewed grove.');
      currentRiteEl.textContent = 'Cycle Complete';
      return;
    }

    this.activeQuest = QUESTS[this.currentIndex];
    currentRiteEl.textContent = this.activeQuest.title;
    this.game.inventory.clear();
    this.game.updateInventoryUI();
    this.game.spawnCollectiblesForQuest(this.activeQuest);
    this.renderQuestLog();
    this.game.enqueueStatus(this.activeQuest.narrative[0]);
    setTimeout(() => this.game.enqueueStatus(this.activeQuest.narrative[1]), 5000);
  }

  renderQuestLog() {
    questStepsEl.innerHTML = '';
    if (!this.activeQuest) {
      return;
    }

    this.activeQuest.narrative.forEach((line, idx) => {
      const li = document.createElement('li');
      li.textContent = line;
      if (idx === 0) li.classList.add('completed');
      if (idx === 1) li.classList.add('active');
      questStepsEl.appendChild(li);
    });
  }

  getCurrentShrine() {
    if (!this.activeQuest) return null;
    return SHRINES.find((shrine) => shrine.id === this.activeQuest.shrineId);
  }

  checkGatherCompletion() {
    if (!this.activeQuest) return false;
    return Object.entries(this.activeQuest.gather).every(([type, amount]) => (this.game.inventory.get(type) || 0) >= amount);
  }

  update(dt) {
    if (!this.activeQuest) {
      meditationStatusEl.hidden = true;
      return;
    }

    const gatherComplete = this.checkGatherCompletion();
    const shrine = this.getCurrentShrine();

    const questLines = [...questStepsEl.children];
    if (questLines.length >= 2) {
      questLines[1].classList.toggle('completed', gatherComplete);
      questLines[1].classList.toggle('active', !gatherComplete);
    }
    if (questLines.length >= 3) {
      questLines[2].classList.toggle('active', gatherComplete);
    }

    if (!gatherComplete) {
      meditationStatusEl.hidden = true;
      this.meditationTimer = 0;
      return;
    }

    const withinShrine = shrine && this.game.isWithinShrine(this.game.player, shrine);
    const holdingMeditate = keys.has('Space');

    if (withinShrine && holdingMeditate) {
      this.meditationTimer += dt;
      meditationStatusEl.hidden = false;
      const progress = Math.min(1, this.meditationTimer / this.activeQuest.ritualSeconds);
      meditationProgressEl.textContent = `${Math.floor(progress * 100)}%`;
      meditationBarEl.style.width = `${progress * 100}%`;

      if (this.meditationTimer >= this.activeQuest.ritualSeconds) {
        this.completeQuest();
      }
    } else {
      if (!withinShrine && this.meditationTimer > 0) {
        this.game.enqueueStatus('You stepped away from the shrine. Return and continue meditating.');
      }
      meditationStatusEl.hidden = true;
      meditationProgressEl.textContent = '0%';
      meditationBarEl.style.width = '0%';
      this.meditationTimer = 0;
    }
  }

  completeQuest() {
    if (!this.activeQuest) return;
    this.completed.add(this.activeQuest.id);
    this.game.enqueueStatus(`${this.activeQuest.title} is complete. The grove hums with renewed energy.`);
    setTimeout(() => {
      this.game.enqueueStatus('Prepare for the next rite. Check the quest log for your new task.');
    }, 5000);
    meditationStatusEl.hidden = true;
    meditationProgressEl.textContent = '0%';
    meditationBarEl.style.width = '0%';
    this.advanceQuest();
  }
}

class Game {
  constructor() {
    this.player = new Player(900, 4800);
    this.camera = { x: 0, y: 0, width: canvas.width, height: canvas.height };
    this.assets = {};
    this.collectibles = [];
    this.obstacles = [];
    this.inventory = new Map();
    this.questManager = new QuestManager(this);
    this.statusQueue = [];
    this.statusCooldown = 0;
    this.totalSeconds = 0;
    this.dayCounter = 1;
    this.daySeconds = 0;
  }

  async init() {
    this.assets = await loadAssets(ASSET_PATHS);
    this.generateWorld();
    this.questManager.start();
    this.updateInventoryUI();
    this.loop(performance.now());
  }

  reset() {
    this.player = new Player(900, 4800);
    this.collectibles = [];
    this.inventory.clear();
    this.questManager.reset();
    this.statusQueue = [];
    this.statusCooldown = 0;
    this.totalSeconds = 0;
    this.dayCounter = 1;
    this.daySeconds = 0;
    dayCountEl.textContent = '1';
    clockEl.textContent = '00:00';
  }

  generateWorld() {
    const obstacleCount = 320;
    const minSize = 120;
    const maxSize = 280;
    const margin = 200;
    const safeZones = SHRINES.map((shrine) => ({ x: shrine.x, y: shrine.y, radius: shrine.radius + 200 }));

    this.obstacles = [];
    let attempts = 0;
    while (this.obstacles.length < obstacleCount && attempts < obstacleCount * 20) {
      attempts += 1;
      const width = minSize + Math.random() * (maxSize - minSize);
      const height = minSize + Math.random() * (maxSize - minSize);
      const x = margin + Math.random() * (GAME_DIMENSIONS.worldWidth - width - margin * 2);
      const y = margin + Math.random() * (GAME_DIMENSIONS.worldHeight - height - margin * 2);
      const obstacle = new Obstacle(x, y, width, height, Math.random() * Math.PI);

      const intersectsSafe = safeZones.some((zone) => distance({ x, y }, { x: zone.x, y: zone.y }) < zone.radius + Math.max(width, height));
      if (intersectsSafe) continue;

      const collides = this.obstacles.some((other) => rectsOverlap(obstacle.rect, other.rect));
      if (!collides) {
        this.obstacles.push(obstacle);
      }
    }
  }

  spawnCollectiblesForQuest(quest) {
    this.collectibles = [];
    Object.entries(quest.gather).forEach(([type, amount]) => {
      const spawnCount = amount + 6;
      let created = 0;
      let attempts = 0;
      while (created < spawnCount && attempts < spawnCount * 50) {
        attempts += 1;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * quest.spawn.radius;
        const x = quest.spawn.x + Math.cos(angle) * radius;
        const y = quest.spawn.y + Math.sin(angle) * radius;
        const itemRadius = 36;
        const collectible = new Collectible(type, clamp(x, 80, GAME_DIMENSIONS.worldWidth - 80), clamp(y, 80, GAME_DIMENSIONS.worldHeight - 80), itemRadius);
        if (!this.isBlockedCircle(collectible)) {
          this.collectibles.push(collectible);
          created += 1;
        }
      }
    });
  }

  isBlockedCircle(circle) {
    const rect = { x: circle.x - circle.radius, y: circle.y - circle.radius, width: circle.radius * 2, height: circle.radius * 2 };
    if (
      rect.x < 0 ||
      rect.y < 0 ||
      rect.x + rect.width > GAME_DIMENSIONS.worldWidth ||
      rect.y + rect.height > GAME_DIMENSIONS.worldHeight
    ) {
      return true;
    }
    return this.obstacles.some((obstacle) => rectsOverlap(rect, obstacle.rect));
  }

  enqueueStatus(message) {
    this.statusQueue.push(message);
  }

  updateStatus(dt) {
    if (this.statusCooldown > 0) {
      this.statusCooldown -= dt;
    }
    if (this.statusCooldown <= 0 && this.statusQueue.length > 0) {
      const message = this.statusQueue.shift();
      statusEl.textContent = message;
      this.statusCooldown = 7;
    }
  }

  updateInventoryUI() {
    inventoryEl.innerHTML = '';
    const activeQuest = this.questManager.activeQuest;
    if (!activeQuest) return;

    Object.keys(activeQuest.gather).forEach((type) => {
      const li = document.createElement('li');
      const count = this.inventory.get(type) || 0;
      li.innerHTML = `<span>${ITEM_TYPES[type].name}</span><span>${count} / ${activeQuest.gather[type]}</span>`;
      inventoryEl.appendChild(li);
    });
  }

  updateTime(dt) {
    this.totalSeconds += dt;
    this.daySeconds += dt;
    if (this.daySeconds >= 900) {
      this.daySeconds -= 900;
      this.dayCounter += 1;
      dayCountEl.textContent = this.dayCounter.toString();
    }
    const minutes = Math.floor(this.daySeconds / 60);
    const seconds = Math.floor(this.daySeconds % 60);
    clockEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  update(dt) {
    this.handleMovement(dt);
    this.collectibles.forEach((collectible) => collectible.update(dt));
    this.checkCollectibles();
    this.updateTime(dt);
    this.questManager.update(dt);
    this.updateStatus(dt);
    this.updateCamera();
  }

  handleMovement(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;

    if (dx === 0 && dy === 0) return;

    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? PLAYER_CONFIG.sprintSpeed : PLAYER_CONFIG.speed;
    const magnitude = Math.hypot(dx, dy) || 1;
    dx = (dx / magnitude) * speed * dt;
    dy = (dy / magnitude) * speed * dt;
    this.player.facing = Math.atan2(dy, dx);

    this.moveWithCollision(dx, dy);
  }

  moveWithCollision(dx, dy) {
    const rect = this.player.rect;

    const tryMove = (moveX, moveY) => {
      const newRect = { x: rect.x + moveX, y: rect.y + moveY, width: rect.width, height: rect.height };
      if (
        newRect.x < 0 ||
        newRect.y < 0 ||
        newRect.x + newRect.width > GAME_DIMENSIONS.worldWidth ||
        newRect.y + newRect.height > GAME_DIMENSIONS.worldHeight
      ) {
        return false;
      }
      const blocked = this.obstacles.some((obstacle) => rectsOverlap(newRect, obstacle.rect));
      if (!blocked) {
        rect.x = newRect.x;
        rect.y = newRect.y;
        return true;
      }
      return false;
    };

    if (dx !== 0) {
      tryMove(dx, 0);
    }
    if (dy !== 0) {
      tryMove(0, dy);
    }

    this.player.x = rect.x + rect.width / 2;
    this.player.y = rect.y + rect.height / 2;
  }

  checkCollectibles() {
    const rect = this.player.rect;
    this.collectibles.forEach((collectible) => {
      if (collectible.collected) return;
      const dist = distance({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, collectible);
      if (dist < collectible.radius + Math.min(rect.width, rect.height) / 2) {
        collectible.collected = true;
        const count = this.inventory.get(collectible.type) || 0;
        this.inventory.set(collectible.type, count + 1);
        this.updateInventoryUI();
        this.enqueueStatus(`Collected ${ITEM_TYPES[collectible.type].name}.`);
      }
    });
  }

  updateCamera() {
    this.camera.x = clamp(this.player.x - this.camera.width / 2, 0, GAME_DIMENSIONS.worldWidth - this.camera.width);
    this.camera.y = clamp(this.player.y - this.camera.height / 2, 0, GAME_DIMENSIONS.worldHeight - this.camera.height);
  }

  isWithinShrine(player, shrine) {
    const distToShrine = distance({ x: player.x, y: player.y }, shrine);
    return distToShrine <= shrine.radius - 40;
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawBackground();
    this.drawObstacles();
    this.drawShrines();
    this.drawCollectibles();
    this.drawPlayer();
  }

  drawBackground() {
    const tileSize = 128;
    const grass = this.assets.grass;
    const startX = Math.floor(this.camera.x / tileSize) * tileSize;
    const startY = Math.floor(this.camera.y / tileSize) * tileSize;
    for (let x = startX; x < this.camera.x + this.camera.width + tileSize; x += tileSize) {
      for (let y = startY; y < this.camera.y + this.camera.height + tileSize; y += tileSize) {
        ctx.drawImage(
          grass,
          x - this.camera.x,
          y - this.camera.y,
          tileSize,
          tileSize,
        );
      }
    }
  }

  drawObstacles() {
    const rock = this.assets.rock;
    this.obstacles.forEach((obstacle) => {
      const screenX = obstacle.x - this.camera.x;
      const screenY = obstacle.y - this.camera.y;
      if (screenX + obstacle.width < -200 || screenY + obstacle.height < -200 || screenX > canvas.width + 200 || screenY > canvas.height + 200) {
        return;
      }
      ctx.save();
      ctx.translate(screenX + obstacle.width / 2, screenY + obstacle.height / 2);
      ctx.rotate(obstacle.rotation);
      ctx.drawImage(rock, -obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
      ctx.restore();
    });
  }

  drawShrines() {
    SHRINES.forEach((shrine) => {
      const screenX = shrine.x - this.camera.x;
      const screenY = shrine.y - this.camera.y;
      if (screenX + shrine.radius < -200 || screenY + shrine.radius < -200 || screenX - shrine.radius > canvas.width + 200 || screenY - shrine.radius > canvas.height + 200) {
        return;
      }
      const glow = this.questManager.activeQuest && this.questManager.activeQuest.shrineId === shrine.id;
      ctx.save();
      ctx.translate(screenX, screenY);
      if (glow) {
        ctx.shadowColor = shrine.color;
        ctx.shadowBlur = 40;
      }
      ctx.fillStyle = `rgba(10, 30, 18, 0.88)`;
      ctx.beginPath();
      ctx.arc(0, 0, shrine.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = glow ? shrine.color : 'rgba(123, 228, 149, 0.35)';
      ctx.stroke();

      const crystal = this.assets.crystal;
      const size = 120;
      ctx.drawImage(crystal, -size / 2, -size / 2, size, size);
      ctx.restore();
    });
  }

  drawCollectibles() {
    this.collectibles.forEach((collectible) => {
      if (collectible.collected) return;
      const screenX = collectible.x - this.camera.x;
      const screenY = collectible.y - this.camera.y;
      const size = collectible.radius * 2;
      const bob = Math.sin(collectible.angle) * 6;
      const asset = this.assets[collectible.type];
      ctx.save();
      ctx.translate(screenX, screenY + bob);
      ctx.drawImage(asset, -size / 2, -size / 2, size, size);
      ctx.restore();
    });
  }

  drawPlayer() {
    const screenX = this.player.x - this.camera.x;
    const screenY = this.player.y - this.camera.y;
    const size = Math.max(this.player.width, this.player.height);
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.player.facing + Math.PI / 2);
    ctx.drawImage(this.assets.player, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  loop(timestamp) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.draw();
    this.drawMap();
    requestAnimationFrame((t) => this.loop(t));
  }

  drawMap() {
    if (!mapCanvas || mapModal.hasAttribute('hidden')) return;

    const scaleX = mapCanvas.width / GAME_DIMENSIONS.worldWidth;
    const scaleY = mapCanvas.height / GAME_DIMENSIONS.worldHeight;

    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    mapCtx.fillStyle = '#04130a';
    mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

    // Shrines
    SHRINES.forEach((shrine) => {
      const glow = this.questManager.activeQuest && this.questManager.activeQuest.shrineId === shrine.id;
      mapCtx.beginPath();
      mapCtx.fillStyle = glow ? shrine.color : 'rgba(123, 228, 149, 0.4)';
      mapCtx.arc(shrine.x * scaleX, shrine.y * scaleY, Math.max(6, shrine.radius * scaleX * 0.2), 0, Math.PI * 2);
      mapCtx.fill();
    });

    // Obstacles
    mapCtx.fillStyle = 'rgba(34, 58, 40, 0.8)';
    this.obstacles.forEach((obstacle) => {
      mapCtx.fillRect(obstacle.x * scaleX, obstacle.y * scaleY, obstacle.width * scaleX, obstacle.height * scaleY);
    });

    // Collectibles
    mapCtx.fillStyle = '#7be495';
    this.collectibles.forEach((collectible) => {
      if (collectible.collected) return;
      mapCtx.fillRect(
        collectible.x * scaleX - 2,
        collectible.y * scaleY - 2,
        4,
        4,
      );
    });

    // Player
    mapCtx.fillStyle = '#ffffff';
    mapCtx.beginPath();
    mapCtx.arc(this.player.x * scaleX, this.player.y * scaleY, 5, 0, Math.PI * 2);
    mapCtx.fill();

  }
}

function loadAssets(paths) {
  const entries = Object.entries(paths);
  const images = {};
  let loaded = 0;
  return new Promise((resolve, reject) => {
    entries.forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.addEventListener('load', () => {
        images[key] = img;
        loaded += 1;
        if (loaded === entries.length) {
          resolve(images);
        }
      });
      img.addEventListener('error', () => {
        reject(new Error(`Failed to load asset: ${url}`));
      });
    });
  });
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

const game = new Game();

function handleKeyDown(event) {
  if (event.repeat) return;
  keys.add(event.code);

  if (event.code === 'KeyM') {
    event.preventDefault();
    toggleMap();
  }

  if (event.code === 'KeyR') {
    event.preventDefault();
    game.reset();
  }
}

function handleKeyUp(event) {
  keys.delete(event.code);
}

function toggleMap() {
  if (mapModal.hasAttribute('hidden')) {
    mapModal.removeAttribute('hidden');
  } else {
    mapModal.setAttribute('hidden', '');
  }
}

closeMapBtn.addEventListener('click', () => toggleMap());
mapModal.addEventListener('click', (event) => {
  if (event.target === mapModal) {
    toggleMap();
  }
});

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

window.addEventListener('load', () => {
  game.init().catch((error) => {
    statusEl.textContent = error.message;
    console.error(error);
  });
});
