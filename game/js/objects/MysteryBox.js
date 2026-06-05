export class MysteryBox extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'box_closed');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body

    this.setDepth(8);
    this.isOpen = false;
    this._triggering = false;
  }

  open(scene) {
    if (this.isOpen || this._triggering) return;
    this._triggering = true;

    // Bump animation
    scene.tweens.add({
      targets: this,
      y: this.y - 8,
      duration: 80,
      yoyo: true,
      ease: 'Power1',
      onComplete: () => {
        this.setTexture('box_open');
        this.isOpen = true;
        this._triggering = false;
        scene.events.emit('box_opened', this);
      },
    });
  }
}
