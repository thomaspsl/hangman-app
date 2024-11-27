const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/sqlite.db", (err) => {
  if (err) {
    console.error(
      "Erreur lors de la connexion à la base de données:",
      err.message
    );
  } else {
    console.log("Connexion à la base de données SQLite réussie.");
  }
});

db.run(
  ` 
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pseudo TEXT NOT NULL,
      score INTEGER NOT NULL,
      date TEXT NOT NULL
    )
  `,
  (err) => {
    if (err) {
      console.error("Erreur lors de la création de la table:", err.message);
    } else {
      console.log('Table "players" vérifiée/créée.');
    }
  }
);

module.exports = db;
