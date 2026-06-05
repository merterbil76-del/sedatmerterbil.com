import { ScoreManager } from '../utils/ScoreManager.js';
import { CONFIG } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

    // Sky gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x5BA3D9, 0x5BA3D9, 0xA8D8EA, 0xA8D8EA, 1);
    bg.fillRect(0, 0, W, H);

    // Ground strip
    bg.fillStyle(0x5DAD4C);
    bg.fillRect(0, H - 40, W, 12);
    bg.fillStyle(0x8B5E3C);
    bg.fillRect(0, H - 28, W, 28);

    // Clouds
    this._drawCloud(bg, 60,  40, 0.9);
    this._drawCloud(bg, 240, 25, 1.1);
    this._drawCloud(bg, 400, 45, 0.8);

    // Decorative coins
    for (let i = 0; i < 5; i++) {
      this.add.image(80 + i * 30, H - 50, 'coin').setScale(0.9);
    }

    // Title card
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x000000, 0.45);
    titleBg.fillRoundedRect(W / 2 - 180, 28, 360, 68, 12);

    this.add.text(W / 2, 48, 'MATEMATİK', {
      fontSize: '28px', fontFamily: 'Arial Black, Impact, sans-serif',
      color: '#FFD700', stroke: '#B8860B', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 82, 'MACERASI', {
      fontSize: '20px', fontFamily: 'Arial Black, Impact, sans-serif',
      color: '#FFFFFF', stroke: '#333333', strokeThickness: 3,
    }).setOrigin(0.5);

    // High score
    const hs = ScoreManager.getHighScore();
    this.add.text(W / 2, 108, `En Yüksek Skor: ${hs}`, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif',
      color: '#FFFF99',
    }).setOrigin(0.5);

    // Play button
    const playBtn = this._makeButton(W / 2, 152, '▶  OYNA', 0x27AE60, 0x1E8449, () => {
      if (this.cache.audio.has('sfx_select')) this.sound.play('sfx_select', { volume: 0.5 });
      this.scene.start('GameScene', { level: 0 });
    });

    // Sound toggle
    this._soundOn = true;
    this._soundBtn = this._makeButton(W / 2, 198, '🔊  SES AÇIK', 0x2980B9, 0x1A5F7A, () => {
      this._soundOn = !this._soundOn;
      this.sound.mute = !this._soundOn;
      this._soundBtn.label.setText(this._soundOn ? '🔊  SES AÇIK' : '🔇  SES KAPALI');
    });

    // QR / Install button
    this._makeButton(W / 2, 244, '📱  Telefona Yükle', 0x8E44AD, 0x6C3483, () => {
      this._showQR();
    });

    // Version
    this.add.text(W - 4, H - 4, 'v1.0', {
      fontSize: '9px', color: '#AAAAAA',
    }).setOrigin(1, 1);

    // Generate background music loop (simple sine-wave via Web Audio)
    this._startBgMusic();

    // Bounce animation on player sprite near title
    const deco = this.add.image(W / 2 - 160, 65, 'player').setScale(1.5);
    this.tweens.add({
      targets: deco, y: 60, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // ── private helpers ───────────────────────────────────────────────────────

  _drawCloud(g, x, y, s) {
    g.fillStyle(0xFFFFFF, 0.85);
    g.fillCircle(x, y, 18 * s);
    g.fillCircle(x + 20 * s, y + 4, 14 * s);
    g.fillCircle(x - 14 * s, y + 6, 12 * s);
    g.fillRect(x - 14 * s, y + 4, 38 * s, 14 * s);
  }

  _makeButton(x, y, label, col, colHov, cb) {
    const W = 220, H = 34;
    const bg = this.add.graphics();
    const txt = this.add.text(x, y, label, {
      fontSize: '14px', fontFamily: 'Arial Black, Impact, sans-serif',
      color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(2);

    const draw = (c) => {
      bg.clear();
      bg.fillStyle(c, 1);
      bg.fillRoundedRect(x - W / 2, y - H / 2, W, H, 8);
      bg.lineStyle(2, 0xFFFFFF, 0.3);
      bg.strokeRoundedRect(x - W / 2 + 1, y - H / 2 + 1, W - 2, H - 2, 7);
    };

    draw(col);
    bg.setInteractive(new Phaser.Geom.Rectangle(x - W / 2, y - H / 2, W, H), Phaser.Geom.Rectangle.Contains)
      .on('pointerover',  () => { draw(colHov); this.input.setDefaultCursor('pointer'); })
      .on('pointerout',   () => { draw(col);    this.input.setDefaultCursor('default'); })
      .on('pointerdown',  () => { draw(colHov); })
      .on('pointerup',    cb);

    return { bg, label: txt };
  }

  _showQR() {
    const modal = document.getElementById('qr-modal');
    if (!modal) return;

    const gameUrl = window.location.origin + window.location.pathname;
    const canvas  = document.getElementById('qr-canvas');

    if (window.QRCode && canvas) {
      QRCode.toCanvas(canvas, gameUrl, { width: 180, margin: 1 }, (err) => {
        if (err) console.warn('QR error:', err);
      });
    }

    document.getElementById('qr-url-text').textContent = gameUrl;
    modal.classList.remove('hidden');
  }

  _startBgMusic() {
    // Simple procedural chime using Web Audio (no file needed)
    // Will be replaced by real audio in production
    if (!window.AudioContext && !window.webkitAudioContext) return;

    // Only play on user gesture (button clicks handle this)
    // Background music placeholder — add your own with:
    // this.sound.add('bgMusic').play({ loop: true, volume: 0.3 });
  }
}
