export const CONFIG = {
  WIDTH: 480,
  HEIGHT: 320,

  GRAVITY: 700,
  MOVE_SPEED: 220,
  JUMP_VELOCITY: -530,
  PLAYER_LIVES: 3,
  INVINCIBLE_DURATION: 2000,
  SHIELD_DURATION: 7000,

  ENEMY_SPEED: { SLOW: 75, MED: 110, FAST: 150 },

  SCORE: {
    COIN: 10,
    ENEMY: 50,
    CORRECT: 100,
    LEVEL: 500,
  },

  // World layout constants (pixels)
  GROUND_TOP: 272,   // y of ground surface
  TILE: 32,

  // Math question number ranges per difficulty
  MATH: {
    1: { min: 11, max: 30 },
    2: { min: 20, max: 40 },
    3: { min: 30, max: 50 },
  },

  // Placeholder texture colors
  C: {
    SKY_TOP:        0x5BA3D9,
    SKY_BOT:        0xA8D8EA,
    CLOUD:          0xFFFFFF,
    GROUND_GRASS:   0x5DAD4C,
    GROUND_DIRT:    0x8B5E3C,
    PLATFORM_TOP:   0x78C068,
    PLATFORM_BODY:  0xA07850,
    PLAYER_BODY:    0x2980B9,
    PLAYER_FACE:    0xFDE3A7,
    PLAYER_HAIR:    0x5D4037,
    PLAYER_SHOE:    0xC0392B,
    ENEMY_BODY:     0xC0392B,
    ENEMY_FACE:     0xFDE3A7,
    ENEMY_EYE:      0x111111,
    BOX_CLOSED:     0xE67E22,
    BOX_OPEN:       0x935116,
    BOX_BORDER:     0xD35400,
    COIN:           0xF1C40F,
    COIN_SHINE:     0xFFF08A,
    SHIELD_FILL:    0x00D2FF,
    FLAG_POLE:      0x95A5A6,
    FLAG_FLAG:      0x27AE60,
    GOAL_POST:      0xE74C3C,
  },
};
