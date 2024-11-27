require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cron = require("node-cron");
const db = require("./database/db");
const { CONFIG, setWords, setWord, Game } = require("./game");

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// ---------------------------------------------------

let words = [];
let word = "";

(async () => {
  try {
    words = await setWords();
    word = setWord(words);

    // To reload all words if they have been changed
    cron.schedule("0 0 * * *", async () => {
      words = await setWords();
      word = setWord(words);
    });

    app.listen(PORT, () =>
      console.log(`Serveur en écoute sur http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Erreur lors du chargement initial : ", error);
  }
})();

// ---------------------------------------------------

/**
 * Default route for the gameplay.
 */
app.get("/", async (req, res) => {
  if (req.session.last === new Date().toLocaleDateString("fr-FR")) {
    const scores = await new Promise((resolve) =>
      db.all(
        "SELECT pseudo, score, date FROM scores WHERE date(date / 1000, 'unixepoch') = date('now') ORDER BY score DESC, date ASC LIMIT 1000",
        (err, rows) => {
          if (err) {
            console.error(err);
          }
          resolve(rows || []);
        }
      )
    );

    return res.render("end", {
      scores,
      word,
      score: req.session.score,
      message: req.session.message,
    });
  }

  const game = req.session.game
    ? Object.assign(new Game(word), req.session.game)
    : new Game(word);

  game.setScore();

  const error = req.session.error || null;

  req.session.game = game;

  delete req.session.message;
  delete req.session.score;
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
app.post("/", (req, res) => {
  if (!req.session.game) return res.redirect("/");

  const game = Object.assign(new Game(word), req.session.game);
  const message = game.setGuess(req.body.letter, word);

  if (game.isWin()) {
    req.session.message = "Bravo, vous avez gagné ! 🎉 Revenez demain !";
    return res.redirect("/save");
  }

  if (game.isLoose()) {
    req.session.game.score = 0;
    req.session.message = "Vous avez perdu ! 😢 Revenez demain !";
    return res.redirect("/save");
  }

  req.session.game = game;
  req.session.error = message;

  res.redirect("/");
});

/**
 * To display the pseudo's form.
 */
app.get("/save", (req, res) => {
  if (!req.session.game) return res.redirect("/");

  res.render("save");
});

/**
 * To save the pseudo and the score in database.
 */
app.post("/save", (req, res) => {
  if (!req.session.game) return res.redirect("/");

  const pseudo = req.body.pseudo;
  const score = req.session.game.score;
  const date = Date.now();

  db.run(
    "INSERT INTO scores (pseudo, score, date) VALUES (?, ?, ?)",
    [pseudo, score, date],
    (err) => {
      if (err) console.error(err);
      req.session.score = score;
      req.session.last = new Date().toLocaleDateString("fr-FR");
      delete req.session.game;
      res.redirect("/");
    }
  );
});

/**
 * Route calls from the client when the timer is down.
 */
app.get("/end", (req, res) => {
  if (!req.session.game) return res.redirect("/");

  req.session.game.score = 0;
  req.session.message = "Vous avez perdu ! 😢 Revenez demain !";
  res.redirect("/save");
});
