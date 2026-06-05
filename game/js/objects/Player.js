import { CONFIG } from '../config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(22, 34);
    this.body.setOffset(1, 2);
    this.setDepth(10);
    this.setCollideWorldBounds(false);

    this.lives = CONFIG.PLAYER_LIVES;
    this.shielded = false;
    this.invincible = false;

    // Shield visual
    this.shieldGfx = scene.add.graphics().setDepth(11);
    this._shieldTween = null;
    this._invTimer = null;

    // Flip sprite when moving left
    this._facingRight = true;
  }

  // ------------------------------------------------------------------ update
  handleInput(left, right, jumpPressed) {
    if (left) {
      this.setVelocityX(-CONFIG.MOVE_SPEED);
      if (this._facingRight) { this.setFlipX(true); this._facingRight = false; }
      this.play('player_run', true);
    } else if (right) {
      this.setVelocityX(CONFIG.MOVE_SPEED);
      if (!this._facingRight) { this.setFlipX(false); this._facingRight = true; }
      this.play('player_run', true);
    } else {
      this.setVelocityX(0);
      if (this.body.blocked.down) this.play('player_idle', true);
    }

    if (jumpPressed && this.body.blocked.down) {
      this.setVelocityY(CONFIG.JUMP_VELOCITY);
      this.play('player_jump', true);
    }

    if (!this.body.blocked.down && this.anims.currentAnim?.key !== 'player_jump') {
      this.play('player_jump', true);
    }
  }

  // ------------------------------------------------------------------ shield
  activateShield(scene) {
    this.shielded = true;
    this._drawShield(scene);
    if (this._shieldTween) this._shieldTween.stop();
    this._shieldTween = scene.tweens.add({
      targets: this.shieldGfx,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  deactivateShield() {
    this.shielded = false;
    if (this._shieldTween) { this._shieldTween.stop(); this._shieldTween = null; }
    this.shieldGfx.setAlpha(1).clear();
  }

  _drawShield(scene) {
    this.shieldGfx.clear();
    this.shieldGfx.lineStyle(3, CONFIG.C.SHIELD_FILL, 1);
    this.shieldGfx.strokeCircle(this.x, this.y, 24);
  }

  // ------------------------------------------------------------------ damage
  takeDamage() {
    if (this.invincible || this.shielded) return false;
    this.lives--;
    this.invincible = true;
    this._blinkInvincible();
    if (this._invTimer) this._invTimer.remove();
    this._invTimer = this.scene.time.delayedCall(CONFIG.INVINCIBLE_DURATION, () => {
      this.invincible = false;
      this.clearTint();
    });
    return true; // damage taken
  }

  _blinkInvincible() {
    const blink = this.scene.time.addEvent({
      delay: 120,
      repeat: Math.floor(CONFIG.INVINCIBLE_DURATION / 120) - 1,
      callback: () => {
        if (this.visible) this.setTint(0xFF4444);
        else this.clearTint();
        this.setVisible(!this.visible);
      },
    });
    this.scene.time.delayedCall(CONFIG.INVINCIBLE_DURATION, () => {
      blink.remove();
      this.setVisible(true);
      this.clearTint();
    });
  }

  // ------------------------------------------------------------------ preUpdate
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // Keep shield graphic centered on player
    if (this.shielded) {
      this.shieldGfx.clear();
      this.shieldGfx.lineStyle(3, CONFIG.C.SHIELD_FILL, 1);
      this.shieldGfx.strokeCircle(this.x, this.y, 24);
    }
  }

  destroy(fromScene) {
    if (this.shieldGfx) this.shieldGfx.destroy();
    super.destroy(fromScene);
  }
}
