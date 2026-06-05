import { CONFIG }       from './config.js';
import { BootScene }    from './scenes/BootScene.js';
import { MenuScene }    from './scenes/MenuScene.js';
import { GameScene }    from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// ── Touch input state (shared with GameScene) ─────────────────────────────
window._gameInput = { left: false, right: false, jump: false, jumpPressed: false };

function bindTouchBtn(id, onStart, onEnd) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = (e) => { e.preventDefault(); onStart(); };
  const end   = (e) => { e.preventDefault(); onEnd?.();  };
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('touchend',   end,   { passive: false });
  el.addEventListener('mousedown',  start);
  el.addEventListener('mouseup',    end);
}

bindTouchBtn('btn-left',
  () => { window._gameInput.left  = true;  },
  () => { window._gameInput.left  = false; }
);
bindTouchBtn('btn-right',
  () => { window._gameInput.right = true;  },
  () => { window._gameInput.right = false; }
);
bindTouchBtn('btn-jump',
  () => { window._gameInput.jumpPressed = true; window._gameInput.jump = true;  },
  () => { window._gameInput.jump  = false; }
);

// ── Show touch controls only on touch devices ─────────────────────────────
function isTouchDevice() {
  return (navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
}
if (isTouchDevice()) {
  document.getElementById('touch-controls')?.classList.remove('hidden');
}

// ── QR modal close ────────────────────────────────────────────────────────
document.getElementById('close-qr-btn')?.addEventListener('click', () => {
  document.getElementById('qr-modal')?.classList.add('hidden');
});

// ── Phaser config ─────────────────────────────────────────────────────────
const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width:  CONFIG.WIDTH,
  height: CONFIG.HEIGHT,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: CONFIG.GRAVITY },
      debug: false,
    },
  },
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    disableWebAudio: false,
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
};

const game = new Phaser.Game(phaserConfig);

// ── PWA service worker ────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch((e) => console.warn('SW registration failed:', e));
  });
}
