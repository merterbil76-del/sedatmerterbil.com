import { CONFIG } from '../config.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, speed, patrolHalf) {
    const y = CONFIG.GROUND_TOP - 18; // stand on ground
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(26, 28);
    this.body.setOffset(3, 4);
    this.body.setAllowGravity(true);
    this.body.setMaxVelocityY(800);
    this.setDepth(9);
    this.setCollideWorldBounds(false);

    this.speed = speed;
    this.patrolStart = x - patrolHalf;
    this.patrolEnd   = x + patrolHalf;
    this.alive = true;

    this.setVelocityX(this.speed);
    this.play('enemy_walk', true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.alive) return;

    if (this.body.velocity.x > 0 && this.x >= this.patrolEnd) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
    } else if (this.body.velocity.x < 0 && this.x <= this.patrolStart) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
    }

    // Turn at edges (if walking off a platform)
    if (this.body.blocked.down) {
      if (!this._wasOnGround) this._wasOnGround = true;
    } else if (this._wasOnGround) {
      this.setVelocityX(-this.body.velocity.x);
      this.setFlipX(this.body.velocity.x < 0);
    }
  }

  stomp() {
    if (!this.alive) return;
    this.alive = false;
    this.body.enable = false;
    this.play('enemy_die', true);
    this.scene.tweens.add({
      targets: this,
      y: this.y + 20,
      alpha: 0,
      duration: 400,
      onComplete: () => this.destroy(),
    });
  }
}
