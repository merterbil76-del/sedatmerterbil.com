import { CONFIG } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { Player } from '../objects/Player.js';
import { Enemy } from '../objects/Enemy.js';
import { MysteryBox } from '../objects/MysteryBox.js';
import { QuestionGenerator } from '../utils/QuestionGenerator.js';
import { ScoreManager } from '../utils/ScoreManager.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  // ── init / create ─────────────────────────────────────────────────────────

  init(data) {
    this.levelIndex    = data.level  ?? 0;
    this.score         = data.score  ?? 0;
    this.totalLives    = data.lives  ?? CONFIG.PLAYER_LIVES;

    this._shieldPending = false;
    this._shieldTimer   = null;
    this._shieldEnd     = 0;
    this._questionOpen  = false;
    this._currentBox    = null;
    this._gameOver      = false;
    this._levelComplete = false;
  }

  create() {
    const lvl = LEVELS[this.levelIndex];
    this.levelData = lvl;

    this._setupWorld(lvl);
    this._setupPlayer(lvl);
    this._setupEnemies(lvl);
    this._setupBoxes(lvl);
    this._setupCoins(lvl);
    this._setupGoal(lvl);
    this._setupCamera(lvl);
    this._setupCollisions();
    this._setupInput();
    this._setupHUD();
    this._setupQuestionUI();

    this.qGen = new QuestionGenerator(lvl.mathDifficulty);

    // Box opened → show question
    this.events.on('box_opened', this._onBoxOpened, this);
  }

  // ── world ─────────────────────────────────────────────────────────────────

  _setupWorld(lvl) {
    const W = lvl.width, H = CONFIG.HEIGHT;

    // Resize world
    this.physics.world.setBounds(0, 0, W, H + 200);

    // Background gradient
    const bg = this.add.graphics().setScrollFactor(0);
    bg.fillGradientStyle(lvl.bgTop, lvl.bgTop, lvl.bgBot, lvl.bgBot, 1);
    bg.fillRect(0, 0, CONFIG.WIDTH, H);

    // Parallax clouds
    for (let i = 0; i < Math.ceil(W / 400); i++) {
      const cx = 80 + i * 400 + Phaser.Math.Between(-60, 60);
      const cy = Phaser.Math.Between(20, 80);
      const g = this.add.graphics().setScrollFactor(0.25);
      this._drawCloud(g, cx, cy, 0.8 + Math.random() * 0.5);
    }

    // Static groups
    this.groundGroup    = this.physics.add.staticGroup();
    this.platformGroup  = this.physics.add.staticGroup();

    // Ground
    this._addTiles(this.groundGroup, 0, CONFIG.GROUND_TOP, W, 'ground', 48);

    // Floating platforms
    for (const [px, pyTop, pw] of lvl.platforms) {
      this._addTiles(this.platformGroup, px, pyTop, pw, 'platform', 32, 24);
    }
  }

  _addTiles(group, startX, topY, totalW, key, tileW, tileH = 48) {
    let x = startX;
    while (x < startX + totalW) {
      const tile = group.create(x + tileW / 2, topY + tileH / 2, key);
      tile.setDisplaySize(tileW, tileH)
          .refreshBody();
      x += tileW;
    }
  }

  _drawCloud(g, x, y, s) {
    g.fillStyle(0xFFFFFF, 0.7);
    g.fillCircle(x, y, 18 * s);
    g.fillCircle(x + 22 * s, y + 5, 14 * s);
    g.fillCircle(x - 16 * s, y + 6, 12 * s);
    g.fillRect(x - 16 * s, y + 4, 42 * s, 14 * s);
  }

  // ── player ────────────────────────────────────────────────────────────────

  _setupPlayer(lvl) {
    const sy = CONFIG.GROUND_TOP - 18;
    this.player = new Player(this, lvl.playerStart?.x ?? 80, sy);
    this.player.lives = this.totalLives;
  }

  // ── enemies ───────────────────────────────────────────────────────────────

  _setupEnemies(lvl) {
    this.enemies = lvl.enemies.map(([ex, spd, patrol]) =>
      new Enemy(this, ex, spd, patrol)
    );
  }

  // ── boxes ─────────────────────────────────────────────────────────────────

  _setupBoxes(lvl) {
    this.boxGroup = this.physics.add.staticGroup();
    this.boxes = lvl.boxes.map(([bx, by]) => {
      const box = new MysteryBox(this, bx, by);
      this.boxGroup.add(box);
      return box;
    });
  }

  // ── coins ─────────────────────────────────────────────────────────────────

  _setupCoins(lvl) {
    this.coinGroup = this.physics.add.staticGroup();
    lvl.coins.forEach(([cx, cy]) => {
      const c = this.coinGroup.create(cx, cy, 'coin');
      c.setDepth(7);
    });
  }

  // ── goal ──────────────────────────────────────────────────────────────────

  _setupGoal(lvl) {
    const gx   = lvl.goalX;
    const base = CONFIG.GROUND_TOP;

    // Pole
    this.add.image(gx, base - 80, 'flag_pole').setOrigin(0.5, 1).setDepth(5);
    // Flag
    this.flagImg = this.add.image(gx + 2, base - 150, 'flag_flag').setOrigin(0, 0).setDepth(6);
    this.tweens.add({
      targets: this.flagImg, x: gx - 2, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Invisible goal zone
    this.goalZone = this.add.zone(gx, base - 40, 40, 80).setOrigin(0.5, 1);
    this.physics.add.existing(this.goalZone, true);
  }

  // ── camera ────────────────────────────────────────────────────────────────

  _setupCamera(lvl) {
    this.cameras.main.setBounds(0, 0, lvl.width, CONFIG.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(80, 40);
  }

  // ── collisions ────────────────────────────────────────────────────────────

  _setupCollisions() {
    const { player, groundGroup, platformGroup, enemies, boxGroup, coinGroup, goalZone } = this;

    this.physics.add.collider(player, groundGroup);
    this.physics.add.collider(player, platformGroup);
    this.physics.add.collider(enemies, groundGroup);
    this.physics.add.collider(enemies, platformGroup);

    // Boxes — player hits from below or lands on top
    this.physics.add.collider(player, boxGroup, (p, box) => {
      if (!box.isOpen && !box._triggering) {
        if (p.body.velocity.y < 0 && p.body.blocked.up) {
          box.open(this);          // hit from below
        } else if (p.body.velocity.y > 0 && p.body.blocked.down && p.y < box.y - 10) {
          box.open(this);          // landed on top
        }
      }
    });

    // Coins
    this.physics.add.overlap(player, coinGroup, (p, coin) => {
      coin.destroy();
      this._addScore(CONFIG.SCORE.COIN);
      this._spawnCoinFx(coin.x, coin.y);
    });

    // Goal
    this.physics.add.overlap(player, goalZone, () => {
      if (!this._levelComplete) this._completeLevel();
    });

    // Enemies vs player
    this.physics.add.overlap(player, enemies, (p, enemy) => {
      if (!enemy.alive) return;
      const stomping = p.body.velocity.y > 80 &&
                       p.body.touching.down &&
                       enemy.body.touching.up &&
                       p.y < enemy.y - 8;
      if (stomping) {
        enemy.stomp();
        p.setVelocityY(-320);
        this._addScore(CONFIG.SCORE.ENEMY);
        this._spawnScorePopup(enemy.x, enemy.y, '+' + CONFIG.SCORE.ENEMY);
      } else {
        if (p.takeDamage()) {
          this._updateHUD();
          if (p.lives <= 0) this._gameOverSeq();
        }
      }
    });
  }

  // ── input ─────────────────────────────────────────────────────────────────

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up:    Phaser.Input.Keyboard.KeyCodes.W,
    });
  }

  // ── HUD ───────────────────────────────────────────────────────────────────

  _setupHUD() {
    const sf = 0; // scrollFactor 0 = fixed to camera

    this.hudContainer = this.add.container(0, 0).setDepth(50).setScrollFactor(sf);

    // Background bar
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.45);
    hudBg.fillRect(0, 0, CONFIG.WIDTH, 26);
    this.hudContainer.add(hudBg);

    // Score
    this.scoreText = this.add.text(8, 4, 'SKOR: 0', {
      fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFD700',
    }).setScrollFactor(sf).setDepth(51);

    // Level
    this.levelText = this.add.text(CONFIG.WIDTH / 2, 4, `BÖLÜM ${this.levelData.id}`, {
      fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFFFFF',
    }).setOrigin(0.5, 0).setScrollFactor(sf).setDepth(51);

    // Lives (hearts)
    this.heartSprites = [];
    for (let i = 0; i < CONFIG.PLAYER_LIVES; i++) {
      const h = this.add.image(CONFIG.WIDTH - 28 - i * 22, 13, 'heart')
        .setScrollFactor(sf).setDepth(51).setScale(0.9);
      this.heartSprites.push(h);
    }

    // Shield timer bar (hidden initially)
    this.shieldBarBg = this.add.graphics().setScrollFactor(sf).setDepth(51);
    this.shieldBarFill = this.add.graphics().setScrollFactor(sf).setDepth(52);
    this.shieldLabel = this.add.text(CONFIG.WIDTH / 2, 28, '', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#00FFFF',
    }).setOrigin(0.5, 0).setScrollFactor(sf).setDepth(52).setVisible(false);
  }

  _updateHUD() {
    this.scoreText.setText(`SKOR: ${this.score}`);
    this.heartSprites.forEach((h, i) => {
      h.setVisible(i < this.player.lives);
    });
  }

  _updateShieldBar() {
    const now = this.time.now;
    const remaining = Math.max(0, this._shieldEnd - now);
    const pct = remaining / CONFIG.SHIELD_DURATION;

    this.shieldBarBg.clear();
    this.shieldBarFill.clear();

    if (this.player.shielded && remaining > 0) {
      const bx = 80, by = 28, bw = CONFIG.WIDTH - 160, bh = 6;
      this.shieldBarBg.fillStyle(0x333333, 0.7);
      this.shieldBarBg.fillRoundedRect(bx, by, bw, bh, 3);
      this.shieldBarFill.fillStyle(0x00D2FF, 1);
      this.shieldBarFill.fillRoundedRect(bx, by, bw * pct, bh, 3);
      this.shieldLabel.setText(`🛡 KALKAN: ${Math.ceil(remaining / 1000)}s`).setVisible(true);
    } else {
      this.shieldLabel.setVisible(false);
    }
  }

  // ── question UI ───────────────────────────────────────────────────────────

  _setupQuestionUI() {
    this._overlay = document.getElementById('question-overlay');
    this._qText   = document.getElementById('question-text');
    this._qInput  = document.getElementById('answer-input');
    this._qFb     = document.getElementById('feedback');
    this._submitBtn = document.getElementById('submit-btn');
    this._timerBar  = document.getElementById('timer-bar');

    const doSubmit = () => {
      if (!this._questionOpen) return;
      this._processAnswer();
    };

    this._submitBtn.addEventListener('click', doSubmit);
    this._qInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSubmit();
    });
  }

  _onBoxOpened(box) {
    if (this._questionOpen) return;
    this._currentBox = box;
    const q = this.qGen.generate();
    this._currentAnswer = q.answer;
    this._showQuestion(q.text);
  }

  _showQuestion(text) {
    this._questionOpen = true;
    this.physics.pause();

    this._qText.textContent = text;
    this._qInput.value = '';
    this._qFb.textContent = '';
    this._qFb.className = '';
    this._qFb.classList.add('hidden');
    this._timerBar.style.width = '100%';
    this._timerBar.style.transition = 'none';
    this._overlay.classList.remove('hidden');

    // Animate the timer bar shrinking (30 seconds to answer)
    requestAnimationFrame(() => {
      this._timerBar.style.transition = 'width 30s linear';
      this._timerBar.style.width = '0%';
    });

    setTimeout(() => { this._qInput.focus(); }, 100);
  }

  _processAnswer() {
    const raw     = this._qInput.value.trim();
    const val     = parseInt(raw, 10);
    const correct = !isNaN(val) && val === this._currentAnswer;

    if (correct) {
      this._qFb.textContent = '✓ Doğru! Kalkan kazandın!';
      this._qFb.className = 'correct';
      this._qFb.classList.remove('hidden');
      this._addScore(CONFIG.SCORE.CORRECT);
      this._shieldPending = true;
    } else {
      this._qFb.textContent = `✗ Yanlış! Cevap: ${this._currentAnswer}`;
      this._qFb.className = 'wrong';
      this._qFb.classList.remove('hidden');
    }

    this._qInput.disabled = true;
    this._submitBtn.disabled = true;

    setTimeout(() => this._closeQuestion(), 1800);
  }

  _closeQuestion() {
    this._questionOpen = false;
    this._overlay.classList.add('hidden');
    this._qInput.disabled = false;
    this._submitBtn.disabled = false;
    this._timerBar.style.transition = 'none';
    this._timerBar.style.width = '100%';

    if (this._shieldPending) {
      this._shieldPending = false;
      this._activateShield();
    }

    this.physics.resume();
  }

  _activateShield() {
    this.player.activateShield(this);
    this._shieldEnd = this.time.now + CONFIG.SHIELD_DURATION;

    if (this._shieldTimer) this._shieldTimer.remove();
    this._shieldTimer = this.time.delayedCall(CONFIG.SHIELD_DURATION, () => {
      this.player.deactivateShield();
    });
  }

  // ── scoring ───────────────────────────────────────────────────────────────

  _addScore(pts) {
    this.score += pts;
    this._updateHUD();
  }

  _spawnCoinFx(x, y) {
    const t = this.add.text(x, y, '+' + CONFIG.SCORE.COIN, {
      fontSize: '14px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: t, y: y - 40, alpha: 0, duration: 700,
      onComplete: () => t.destroy(),
    });
  }

  _spawnScorePopup(x, y, label) {
    const t = this.add.text(x, y - 20, label, {
      fontSize: '16px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFFFFF', stroke: '#E74C3C', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: t, y: y - 60, alpha: 0, duration: 800,
      onComplete: () => t.destroy(),
    });
  }

  // ── level flow ────────────────────────────────────────────────────────────

  _completeLevel() {
    if (this._levelComplete || this._gameOver) return;
    this._levelComplete = true;
    this.physics.pause();

    this._addScore(CONFIG.SCORE.LEVEL);
    ScoreManager.setHighScore(this.score);

    const nextLevel = this.levelIndex + 1;
    const hasNext   = nextLevel < LEVELS.length;

    const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
    const panel = this.add.graphics().setScrollFactor(0).setDepth(80);
    panel.fillStyle(0x000000, 0.55);
    panel.fillRoundedRect(W / 2 - 160, H / 2 - 60, 320, 120, 12);

    this.add.text(W / 2, H / 2 - 38, hasNext ? '🎉 Bölüm Tamamlandı!' : '🏆 Oyun Bitti!', {
      fontSize: '18px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFD700',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(81);

    this.add.text(W / 2, H / 2 - 10, `Skor: ${this.score}`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(81);

    this.time.delayedCall(2200, () => {
      this.physics.resume();
      if (hasNext) {
        this.scene.start('GameScene', {
          level: nextLevel,
          score: this.score,
          lives: this.player.lives,
        });
      } else {
        this.scene.start('GameOverScene', {
          score: this.score,
          won: true,
        });
      }
    });
  }

  _gameOverSeq() {
    if (this._gameOver) return;
    this._gameOver = true;
    this.physics.pause();
    ScoreManager.setHighScore(this.score);

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { score: this.score, won: false });
    });
  }

  // ── update ────────────────────────────────────────────────────────────────

  update() {
    if (this._questionOpen || this._levelComplete || this._gameOver) return;

    const { cursors, wasd, player } = this;
    const left  = cursors.left.isDown  || wasd.left.isDown  || window._gameInput?.left;
    const right = cursors.right.isDown || wasd.right.isDown || window._gameInput?.right;
    const jump  = Phaser.Input.Keyboard.JustDown(cursors.up)    ||
                  Phaser.Input.Keyboard.JustDown(cursors.space) ||
                  Phaser.Input.Keyboard.JustDown(wasd.up)       ||
                  (window._gameInput?.jumpPressed === true);

    if (window._gameInput) window._gameInput.jumpPressed = false;

    player.handleInput(left, right, jump);

    // Kill player if they fall into a pit
    if (player.y > CONFIG.HEIGHT + 80) {
      if (player.takeDamage()) {
        this._updateHUD();
        if (player.lives <= 0) {
          this._gameOverSeq();
        } else {
          // Respawn
          player.setPosition(80, CONFIG.GROUND_TOP - 30);
          player.setVelocity(0, 0);
        }
      }
    }

    this._updateShieldBar();
  }
}
