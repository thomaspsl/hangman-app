const fs = require("fs");
const csv = require("csv-parser");

/**
 * Configuration of the gameplay.
 */
const CONFIG = {
  MINUS: 1,
  TRIES: 5,
  SCORE: 1000,
  ERROR: 50,
};

/**
 * Game Class.
 */
class Game {
  constructor(word) {
    this.hide = word.replace(/./g, "#");
    this.tries = CONFIG.TRIES;
    this.guesses = [];
    this.score = CONFIG.SCORE;
    this.time = Date.now();
  }

  isWin() {
    return !this.hide.includes("#") && this.tries > 0 && this.score > 0;
  }

  isLoose() {
    return this.hide.includes("#") && (this.tries <= 0 || this.score <= 0);
  }

  isFinish() {
    return this.isWin() || this.isLoose();
  }

  updateScore() {
    const timePenalty = Math.floor((Date.now() - this.time) / 1000);
    this.score =
      CONFIG.SCORE - timePenalty - this.guesses.length * CONFIG.ERROR;
  }

  setGuess(letter, word) {
    try {
      const guess = letter.toUpperCase();

      if (!/^[A-ZÀ-Ÿ]$/.test(guess)) throw new Error("Entrée invalide");

      if (this.guesses.includes(guess)) throw new Error("Lettre déjà essayée");

      if (word.includes(guess)) {
        this.hide = word
          .split("")
          .map((char, i) => (char === guess ? char : this.hide[i]))
          .join("");
      } else {
        this.guesses.push(guess);
        this.tries = Math.max(0, this.tries - CONFIG.MINUS);
        this.score = Math.max(0, this.score - CONFIG.ERROR);
      }
    } catch (error) {
      return error.message;
    }
  }
}

/**
 * Function to load all words.
 */
function setWords() {
  return new Promise((resolve, reject) => {
    const loadedWords = [];
    fs.createReadStream("words.txt")
      .pipe(csv())
      .on("data", (row) => loadedWords.push(row.word.toLowerCase()))
      .on("end", () => resolve(loadedWords))
      .on("error", reject);
  });
}

/**
 * Function to set the current word of the day.
 */
function setWord(words) {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  let hash = 0;
  for (let i = 0; i < day; i++) {
    hash = (hash * 31 + day * month) % words.length;
  }
  return words[hash].toUpperCase();
}

module.exports = { CONFIG, setWords, setWord, Game };
