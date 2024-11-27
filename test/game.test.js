const { CONFIG, setWords, setWord, Game } = require("../game");

let game;

beforeAll(() => {
  game = new Game("DAMIEN");
});

describe("Game Module", () => {
  test('The word must be "DAMIEN"', () => {
    expect(game.hide).toBe("######");
  });

  test("should be 5 tries at the beginning of the game", () => {
    expect(game.tries).toBe(5);
  });

  test("test the try mechanic with a correct guess", () => {
    const initialTries = game.tries;
    game.setGuess("A", "DAMIEN");
    expect(game.tries).toBe(initialTries);
    expect(game.hide).toBe("#A####");
  });

  test("test the try mechanic with an incorrect guess", () => {
    const initialTries = game.tries;
    const initialScore = game.score;
    game.setGuess("Z", "DAMIEN");
    expect(game.tries).toBe(initialTries - CONFIG.MINUS);
    expect(game.score).toBe(initialScore - CONFIG.ERROR);
  });

  test('should show only "A" letter', () => {
    expect(game.hide).toBe("#A####");
  });

  test("should not allow invalid input", () => {
    const error = game.setGuess("123", "DAMIEN");
    expect(error).toBe("Entrée invalide");
  });

  test("should not allow already guessed letter", () => {
    game.guesses = ["A"];
    const error = game.setGuess("A", "DAMIEN");
    expect(error).toBe("Lettre déjà essayée");
  });

  test("isWin should return true when all letters are guessed", () => {
    game.setGuess("D", "DAMIEN");
    game.setGuess("M", "DAMIEN");
    game.setGuess("I", "DAMIEN");
    game.setGuess("E", "DAMIEN");
    game.setGuess("N", "DAMIEN");
    expect(game.isWin()).toBe(true);
  });

  test("isLoose should return true when tries are exhausted", () => {
    game = new Game("DAMIEN");
    const letters = ["Z", "X", "C", "B", "K"];
    for (let i = 0; i < 5; i++) {
      game.setGuess(letters[i], "DAMIEN");
    }
    expect(game.isLoose()).toBe(true);
  });

  test("setWords should load words from file", async () => {
    const words = await setWords();
    expect(words).toBeInstanceOf(Array);
    expect(words.length).toBeGreaterThan(0);
  });

  test("setWord should return a word for the day", async () => {
    const words = ["apple", "banana", "cherry"];
    const wordOfDay = setWord(words);
    expect(words).toContain(wordOfDay.toLowerCase());
  });

  test("setScore should apply time penalty", () => {
    game = new Game("DAMIEN");
    const initialScore = game.score;
    game.time -= 10000;
    game.setScore();
    expect(game.score).toBe(initialScore - 10);
  });

  test("should not allow score to go below zero", () => {
    game.score = 249;
    const letters = ["Z", "X", "C", "B", "K"];
    for (let i = 0; i < 5; i++) {
      game.setGuess(letters[i], "DAMIEN");
    }
    expect(game.score).toBeGreaterThanOrEqual(0);
  });
});
