import { CONFIG } from '../config.js';

// BootScene creates all placeholder textures programmatically.
// Replace the textures here with real sprite assets later — just point
// PreloadScene to your image files and change the texture keys used in
// Player.js / Enemy.js / MysteryBox.js accordingly.

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this._makePlayer();
    this._makeEnemy();
    this._makeBox();
    this._makeCoin();
    this._makeGround();
    this._makePlatform();
    this._makeFlag();
    this._makeHeart();
    this._makeStar();

    this._makeAnimations();

    this.scene.start('MenuScene');
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  _rt(key, w, h, drawFn) {
    const rt = this.add.renderTexture(0, 0, w, h).setVisible(false);
    const g  = this.make.graphics({ x: 0, y: 0, add: false });
    drawFn(g, rt);
    g.destroy();
    rt.saveTexture(key);
    rt.destroy();
  }

  _text(rt, str, x, y, size, color) {
    const t = this.make.text({ x, y, text: str,
      style: { fontSize: `${size}px`, fontFamily: 'Arial Black, Impact, sans-serif',
               color, fontStyle: 'bold', resolution: 2 }, add: false });
    rt.draw(t, x, y);
    t.destroy();
  }

  // ── textures ─────────────────────────────────────────────────────────────

  _makePlayer() {
    // Single frame: body + face + eyes + shoes
    const W = 24, H = 36;
    const rt = this.add.renderTexture(0, 0, W, H).setVisible(false);
    const g  = this.make.graphics({ x: 0, y: 0, add: false });

    // Hair
    g.fillStyle(CONFIG.C.PLAYER_HAIR);
    g.fillRoundedRect(2, 0, 20, 10, 3);
    // Face
    g.fillStyle(CONFIG.C.PLAYER_FACE);
    g.fillRoundedRect(3, 6, 18, 16, 4);
    // Body
    g.fillStyle(CONFIG.C.PLAYER_BODY);
    g.fillRoundedRect(2, 20, 20, 12, 3);
    // Eyes
    g.fillStyle(0x111111);
    g.fillCircle(9,  13, 2.5);
    g.fillCircle(15, 13, 2.5);
    // Eye shine
    g.fillStyle(0xFFFFFF);
    g.fillCircle(10, 12, 1);
    g.fillCircle(16, 12, 1);
    // Shoes
    g.fillStyle(CONFIG.C.PLAYER_SHOE);
    g.fillRoundedRect(1,  31, 10, 5, 2);
    g.fillRoundedRect(13, 31, 10, 5, 2);

    rt.draw(g, 0, 0);
    g.destroy();
    rt.saveTexture('player');
    rt.destroy();
  }

  _makeEnemy() {
    const W = 32, H = 32;
    const rt = this.add.renderTexture(0, 0, W, H).setVisible(false);
    const g  = this.make.graphics({ x: 0, y: 0, add: false });

    // Body
    g.fillStyle(CONFIG.C.ENEMY_BODY);
    g.fillRoundedRect(4, 8, 24, 22, 5);
    // Head
    g.fillStyle(CONFIG.C.ENEMY_BODY);
    g.fillCircle(16, 10, 11);
    // Horns
    g.fillStyle(CONFIG.C.ENEMY_BODY);
    g.fillTriangle(8, 4, 4, -2, 12, 0);
    g.fillTriangle(24, 4, 28, -2, 20, 0);
    // Face
    g.fillStyle(CONFIG.C.ENEMY_FACE);
    g.fillCircle(16, 11, 8);
    // Eyes
    g.fillStyle(CONFIG.C.ENEMY_EYE);
    g.fillEllipse(11, 10, 5, 6);
    g.fillEllipse(21, 10, 5, 6);
    // Pupils
    g.fillStyle(0x550000);
    g.fillCircle(11, 11, 2);
    g.fillCircle(21, 11, 2);
    // Feet
    g.fillStyle(0x8B0000);
    g.fillRoundedRect(4,  28, 10, 4, 2);
    g.fillRoundedRect(18, 28, 10, 4, 2);

    rt.draw(g, 0, 0);
    g.destroy();
    rt.saveTexture('enemy');

    // Die frame (squished)
    const rt2 = this.add.renderTexture(0, 0, W, 16).setVisible(false);
    const g2  = this.make.graphics({ x: 0, y: 0, add: false });
    g2.fillStyle(CONFIG.C.ENEMY_BODY);
    g2.fillRoundedRect(4, 4, 24, 12, 3);
    g2.fillStyle(CONFIG.C.ENEMY_FACE);
    g2.fillEllipse(16, 9, 20, 10);
    g2.fillStyle(0x111111);
    g2.fillEllipse(10, 9, 4, 3);
    g2.fillEllipse(22, 9, 4, 3);
    rt2.draw(g2, 0, 0);
    g2.destroy();
    rt2.saveTexture('enemy_dead');
    rt2.destroy();
    rt.destroy();
  }

  _makeBox() {
    // Closed
    this._rt('box_closed', 32, 32, (g, rt) => {
      g.fillStyle(CONFIG.C.BOX_CLOSED);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(3, CONFIG.C.BOX_BORDER);
      g.strokeRect(1.5, 1.5, 29, 29);
      // Inner border
      g.lineStyle(1, 0xFFD080);
      g.strokeRect(4, 4, 24, 24);
      rt.draw(g, 0, 0);
      this._text(rt, '?', 7, 2, 22, '#FFFFFF');
    });

    // Open
    this._rt('box_open', 32, 32, (g, rt) => {
      g.fillStyle(CONFIG.C.BOX_OPEN);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(2, 0x5A300A);
      g.strokeRect(1, 1, 30, 30);
      rt.draw(g, 0, 0);
    });
  }

  _makeCoin() {
    this._rt('coin', 20, 20, (g, rt) => {
      g.fillStyle(CONFIG.C.COIN);
      g.fillCircle(10, 10, 9);
      g.fillStyle(CONFIG.C.COIN_SHINE);
      g.fillCircle(7, 7, 4);
      rt.draw(g, 0, 0);
      this._text(rt, '$', 4, 2, 14, '#D4AC0D');
    });
  }

  _makeGround() {
    // 48×48 tile: grass top + dirt body
    this._rt('ground', 48, 48, (g) => {
      g.fillStyle(CONFIG.C.GROUND_DIRT);
      g.fillRect(0, 0, 48, 48);
      g.fillStyle(CONFIG.C.GROUND_GRASS);
      g.fillRect(0, 0, 48, 12);
      // Texture lines
      g.lineStyle(1, 0x6BBF5A, 0.5);
      g.lineBetween(0, 4, 48, 4);
      g.lineStyle(1, 0x6B4028, 0.3);
      g.lineBetween(0, 20, 48, 20);
      g.lineBetween(0, 34, 48, 34);
    });
  }

  _makePlatform() {
    this._rt('platform', 32, 24, (g) => {
      g.fillStyle(CONFIG.C.PLATFORM_BODY);
      g.fillRect(0, 0, 32, 24);
      g.fillStyle(CONFIG.C.PLATFORM_TOP);
      g.fillRect(0, 0, 32, 8);
      g.lineStyle(1, 0x88D080, 0.4);
      g.lineBetween(0, 4, 32, 4);
    });
  }

  _makeFlag() {
    this._rt('flag_pole', 8, 160, (g) => {
      g.fillStyle(CONFIG.C.FLAG_POLE);
      g.fillRect(2, 0, 4, 160);
    });
    this._rt('flag_flag', 40, 28, (g) => {
      g.fillStyle(CONFIG.C.FLAG_FLAG);
      g.fillTriangle(0, 0, 40, 14, 0, 28);
    });
  }

  _makeHeart() {
    this._rt('heart', 20, 18, (g) => {
      g.fillStyle(0xFF4444);
      g.fillCircle(6,  5, 6);
      g.fillCircle(14, 5, 6);
      g.fillTriangle(0, 8, 20, 8, 10, 18);
    });
  }

  _makeStar() {
    this._rt('star', 20, 20, (g) => {
      g.fillStyle(0xFFD700);
      const cx = 10, cy = 10, r1 = 9, r2 = 4, pts = 5;
      const verts = [];
      for (let i = 0; i < pts * 2; i++) {
        const angle = (i * Math.PI) / pts - Math.PI / 2;
        const r = i % 2 === 0 ? r1 : r2;
        verts.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      g.fillPoints(
        Array.from({ length: verts.length / 2 }, (_, i) =>
          new Phaser.Geom.Point(verts[i * 2], verts[i * 2 + 1])
        ), true
      );
    });
  }

  // ── animations ────────────────────────────────────────────────────────────

  _makeAnimations() {
    // Player uses single-frame textures as placeholders
    // When you add a sprite sheet, create multi-frame animations here.

    if (!this.anims.exists('player_idle')) {
      this.anims.create({ key: 'player_idle', frames: [{ key: 'player' }], frameRate: 1 });
    }
    if (!this.anims.exists('player_run')) {
      this.anims.create({ key: 'player_run', frames: [{ key: 'player' }], frameRate: 8 });
    }
    if (!this.anims.exists('player_jump')) {
      this.anims.create({ key: 'player_jump', frames: [{ key: 'player' }], frameRate: 1 });
    }

    if (!this.anims.exists('enemy_walk')) {
      this.anims.create({ key: 'enemy_walk', frames: [{ key: 'enemy' }], frameRate: 6, repeat: -1 });
    }
    if (!this.anims.exists('enemy_die')) {
      this.anims.create({ key: 'enemy_die', frames: [{ key: 'enemy_dead' }], frameRate: 1 });
    }
  }
}
