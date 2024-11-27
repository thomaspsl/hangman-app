const fs = require("fs");
const csv = require("csv-parser");

const CONFIG = {
  MINUS: 1,
  TRIES: 5,
  SCORE: 1000,
  ERROR: 50,
};

class Game {
  constructor(word) {
    this.hide = word.replace(/./g, "#");
    this.tries = CONFIG.TRIES;
    this.guesses = [];
    this.score = CONFIG.SCORE;
    this.time = Date.now();
    this.nberror = 0;
  }

  isWin() {
    return !this.hide.includes("#") && this.tries > 0 && this.score > 0;
  }

  isLoose() {
    return this.hide.includes("#") && (this.tries <= 0 || this.score <= 0);
  }

  setScore() {
    const timePenalty = Math.floor((Date.now() - this.time) / 1000);
    this.score = CONFIG.SCORE - timePenalty - this.nberror * CONFIG.ERROR;
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
        this.nberror += 1;

        this.tries = Math.max(0, this.tries - CONFIG.MINUS);
        this.score = Math.max(0, this.score - CONFIG.ERROR);
      }
    } catch (error) {
      return error.message;
    }
  }
}

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

function setWord(words) {
  const index = Math.floor(Math.random() * words.length);
  return words[index].toUpperCase();
}

module.exports = { CONFIG, setWords, setWord, Game };
