import { ScoreManager } from '../utils/ScoreManager.js';
import { CONFIG } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.finalScore = data.score ?? 0;
    this.won        = data.won   ?? false;
  }

  create() {
    const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
    const hs = ScoreManager.getHighScore();

    // Background
    const bg = this.add.graphics();
    if (this.won) {
      bg.fillGradientStyle(0x1A5276, 0x1A5276, 0x0E2D3D, 0x0E2D3D, 1);
    } else {
      bg.fillGradientStyle(0x641E16, 0x641E16, 0x1A0808, 0x1A0808, 1);
    }
    bg.fillRect(0, 0, W, H);

    // Stars (win) or falling particles (lose)
    this._spawnDecorations();

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(W / 2 - 170, H / 2 - 100, 340, 200, 14);
    panel.lineStyle(2, this.won ? 0xFFD700 : 0xFF4444, 0.6);
    panel.strokeRoundedRect(W / 2 - 170, H / 2 - 100, 340, 200, 14);

    // Title
    const title = this.won
      ? '🏆 TEBRİKLER!'
      : '💀 OYUN BİTTİ';
    this.add.text(W / 2, H / 2 - 78, title, {
      fontSize: '22px', fontFamily: 'Arial Black, Impact, sans-serif',
      color: this.won ? '#FFD700' : '#FF6B6B',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    const subtitle = this.won
      ? 'Tüm bölümleri tamamladın!'
      : 'Daha iyi şanslar diliyorum!';
    this.add.text(W / 2, H / 2 - 50, subtitle, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif',
      color: '#CCCCCC',
    }).setOrigin(0.5);

    // Score rows
    this._row(W / 2, H / 2 - 18, 'PUANINIZ', this.finalScore, '#FFFFFF', '#FFD700');
    this._row(W / 2, H / 2 + 10, 'EN YÜKSEK PUAN', hs, '#AAAAAA',
      this.finalScore >= hs ? '#00FF88' : '#CCCCCC');

    if (this.finalScore >= hs && this.finalScore > 0) {
      this.add.text(W / 2, H / 2 + 34, '✨ Yeni Rekor!', {
        fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
        color: '#00FF88',
      }).setOrigin(0.5);
    }

    // Buttons
    this._makeBtn(W / 2 - 82, H / 2 + 68, 'Tekrar Oyna', 0x27AE60, () => {
      this.scene.start('GameScene', { level: 0 });
    });
    this._makeBtn(W / 2 + 82, H / 2 + 68, 'Ana Menü', 0x2980B9, () => {
      this.scene.start('MenuScene');
    });
  }

  _row(x, y, label, value, labelCol, valCol) {
    this.add.text(x - 10, y, label + ':', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: labelCol,
    }).setOrigin(1, 0.5);
    this.add.text(x + 10, y, String(value), {
      fontSize: '16px', fontFamily: 'Arial Black, sans-serif', color: valCol,
    }).setOrigin(0, 0.5);
  }

  _makeBtn(x, y, label, col, cb) {
    const W = 140, H = 32;
    const bg = this.add.graphics();
    bg.fillStyle(col, 1);
    bg.fillRoundedRect(x - W / 2, y - H / 2, W, H, 8);
    bg.setInteractive(new Phaser.Geom.Rectangle(x - W / 2, y - H / 2, W, H),
      Phaser.Geom.Rectangle.Contains).on('pointerup', cb);

    this.add.text(x, y, label, {
      fontSize: '13px', fontFamily: 'Arial Black, sans-serif', color: '#FFFFFF',
    }).setOrigin(0.5);
  }

  _spawnDecorations() {
    if (this.won) {
      for (let i = 0; i < 12; i++) {
        const s = this.add.image(
          Phaser.Math.Between(20, CONFIG.WIDTH - 20),
          Phaser.Math.Between(10, CONFIG.HEIGHT - 10),
          'star'
        ).setAlpha(0.4 + Math.random() * 0.4).setScale(0.6 + Math.random() * 0.8);
        this.tweens.add({
          targets: s, alpha: 0, scale: s.scaleX * 1.5,
          duration: 800 + Math.random() * 1200,
          delay: Math.random() * 1000,
          yoyo: true, repeat: -1,
        });
      }
    }
  }
}
