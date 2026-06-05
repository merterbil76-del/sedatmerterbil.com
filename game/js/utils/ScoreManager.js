const KEY = 'matMac_highScore';

export const ScoreManager = {
  getHighScore() {
    return parseInt(localStorage.getItem(KEY) || '0', 10);
  },

  setHighScore(score) {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem(KEY, String(score));
      return true; // new record
    }
    return false;
  },

  reset() {
    localStorage.removeItem(KEY);
  },
};
