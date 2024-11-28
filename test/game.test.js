const { CONFIG, setWords, setWord, Game } = require("../game");

describe("Game Module", () => {
  test("Start - SetWords should load words from file", async () => {
    const words = await setWords();
    expect(words).toBeInstanceOf(Array);
    expect(words.length).toBeGreaterThan(0);
  });

  test("Start - SetWord should return a word for the day", async () => {
    const words = ["apple", "banana", "cherry"];
    const wordOfDay = setWord(words);
    expect(words).toContain(wordOfDay.toLowerCase());
  });

  test("Start - Should be X caracteres at the beginning", () => {
    const word = "DAMIEN";
    const game = new Game(word);
    expect(game.hide).toBe(word.replace(/./g, "#"));
  });

  test("Start - Should be X tries at the beginning", () => {
    const game = new Game("DAMIEN");
    expect(game.tries).toBe(CONFIG.TRIES);
  });

  test("Gameplay - Test the try mechanic with a correct guess", () => {
    const game = new Game("DAMIEN");
    const initialTries = game.tries;
    game.setGuess("A", "DAMIEN");
    expect(game.tries).toBe(initialTries);
    expect(game.hide).toBe("#A####");
  });

  test("Gameplay - Test the try mechanic with an incorrect guess", () => {
    const game = new Game("DAMIEN");
    game.score = 1000;
    const initialTries = game.tries;
    const initialScore = game.score;
    game.setGuess("Z", "DAMIEN");
    expect(game.tries).toBe(initialTries - CONFIG.MINUS);
    expect(game.score).toBe(initialScore - CONFIG.ERROR);
  });

  test("Gameplay - Should not allow score to go below zero", () => {
    const game = new Game("DAMIEN");
    game.score = 1000;
    const letters = ["Z", "X", "C", "B", "K"];
    for (let i = 0; i < 5; i++) {
      game.setGuess(letters[i], "DAMIEN");
    }
    expect(game.score).toBeGreaterThanOrEqual(0);
  });

  test("Gameplay - updateScore should apply time penalty", () => {
    const game = new Game("DAMIEN");
    game.score = 1000;
    const initialScore = game.score;
    game.time -= 10000;
    game.updateScore();
    expect(game.score).toBe(initialScore - 10);
  });

  test("Erreur - Should not allow invalid input", () => {
    const game = new Game("DAMIEN");
    const error = game.setGuess("123", "DAMIEN");
    expect(error).toBe("Entrée invalide");
  });

  test("Erreur - Should not allow already guessed letter", () => {
    const game = new Game("DAMIEN");
    game.guesses = ["A"];
    const error = game.setGuess("A", "DAMIEN");
    expect(error).toBe("Lettre déjà essayée");
  });

  test("Fin - IsWin should return true when all letters are guessed", () => {
    const game = new Game("DAMIEN");
    game.setGuess("D", "DAMIEN");
    game.setGuess("A", "DAMIEN");
    game.setGuess("M", "DAMIEN");
    game.setGuess("I", "DAMIEN");
    game.setGuess("E", "DAMIEN");
    game.setGuess("N", "DAMIEN");
    expect(game.isWin()).toBe(true);
  });

  test("Fin - IsLoose should return true when tries are exhausted", () => {
    const game = new Game("DAMIEN");
    const letters = ["Z", "X", "C", "B", "K"];
    for (let i = 0; i < 5; i++) {
      game.setGuess(letters[i], "DAMIEN");
    }
    expect(game.isLoose()).toBe(true);
  });

  test("Fin - IsFinish should return true when the game is won", () => {
    const game = new Game("DAMIEN");
    game.setGuess("D", "DAMIEN");
    game.setGuess("A", "DAMIEN");
    game.setGuess("M", "DAMIEN");
    game.setGuess("I", "DAMIEN");
    game.setGuess("E", "DAMIEN");
    game.setGuess("N", "DAMIEN");
    expect(game.isFinish()).toBe(true);
  });

  test("Fin - IsFinish should return true when the game is lost", () => {
    const game = new Game("DAMIEN");
    const letters = ["Z", "X", "C", "B", "K"];
    for (let i = 0; i < 5; i++) {
      game.setGuess(letters[i], "DAMIEN");
    }
    expect(game.isFinish()).toBe(true);
  });
});
