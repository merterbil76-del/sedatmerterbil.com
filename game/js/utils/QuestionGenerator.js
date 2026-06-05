import { CONFIG } from '../config.js';

export class QuestionGenerator {
  constructor(difficulty = 1) {
    this.difficulty = Math.min(Math.max(difficulty, 1), 3);
  }

  setDifficulty(d) {
    this.difficulty = Math.min(Math.max(d, 1), 3);
  }

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generate() {
    const { min, max } = CONFIG.MATH[this.difficulty];
    const isAddition = Math.random() < 0.5;

    let a, b, answer, text;

    if (isAddition) {
      a = this._rand(min, max);
      b = this._rand(min, max);
      answer = a + b;
      text = `${a} + ${b} = ?`;
    } else {
      // Ensure positive result
      a = this._rand(min, max);
      b = this._rand(min, a - 1 < min ? min : Math.min(a - 1, max));
      if (a <= b) { const tmp = a; a = b + 1; b = tmp; }
      if (a > max) a = max;
      if (b < min) b = min;
      if (a <= b) { a = b + this._rand(1, 5); }
      answer = a - b;
      text = `${a} - ${b} = ?`;
    }

    return { text, answer, isAddition };
  }
}
