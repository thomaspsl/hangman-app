require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cron = require("node-cron");
const db = require("./database/db");

const { CONFIG, setWords, setWord, Game } = require("./game");

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// -------------------------------------------------

let words = [];
let word = "";

(async () => {
  try {
    words = await setWords();
    word = setWord(words);

    // Reload words daily
    cron.schedule("0 0 * * *", async () => {
      words = await setWords();
      word = setWord(words);
    });

    app.listen(PORT, () =>
      console.log(`Listening on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Failed to load words / word and start the server:", error);
  }
})();

// -------------------------------------------------

/**
 * Default route for the gameplay.
 */
app.get("/", async (req, res) => {
  const today = new Date().toLocaleDateString("fr-FR");

  // Reset session data if the date has changed
  if (req.session.last && req.session.last !== today) {
    delete req.session.game;
    delete req.session.last;
    delete req.session.saved;
  }

  const game = req.session.game
    ? Object.assign(new Game(word), req.session.game)
    : new Game(word);

  if (!game.isFinish()) game.updateScore();

  req.session.game = game;

  if (game.isFinish()) {
    if (game.isLoose()) game.score = 0;

    if (!req.session.saved) return res.render("save");

    const state = {
      win: "Bravo, vous avez gagné ! 🎉 Revenez demain !",
      loose: "Vous avez perdu ! 😢 Revenez demain !",
    };

    const scores = await new Promise((resolve) =>
      db.all(
        "SELECT pseudo, score, date FROM scores WHERE DATE(date, '+1 hour') = DATE('now', '+1 hour') ORDER BY score DESC, date ASC LIMIT 1000",
        (err, rows) => {
          if (err) console.error(err);
          resolve(rows || []);
        }
      )
    );

    return res.render("end", {
      scores,
      word,
      score: game.score,
      message: game.isWin() ? state.win : state.loose,
    });
  }

  const error = req.session.error || null;
  delete req.session.error;

  res.render("index", {
    game,
    minus: CONFIG.MINUS,
    error: error,
  });
});

/**
 * Principal logic for the gameplay.
 */
app.post("/guess", (req, res) => {
  if (!req.session.game) return res.redirect(400, "/");

  const game = Object.assign(new Game(word), req.session.game);
  const message = game.setGuess(req.body.letter, word);

  req.session.game = game;
  req.session.error = message;

  res.redirect("/");
});

/**
 * Save the pseudo and the score in the database.
 */
app.post("/save", (req, res) => {
  if (!req.session.game) return res.redirect(400, "/");

  const pseudo = req.body.pseudo;
  const score = req.session.game.score;
  const date = new Date().toISOString();

  db.run(
    "INSERT INTO scores (pseudo, score, date) VALUES (?, ?, ?)",
    [pseudo, score, date],
    (err) => {
      if (err) console.error(err);

      req.session.saved = true;
      req.session.last = new Date().toLocaleDateString("fr-FR");

      res.redirect("/");
    }
  );
});
