module.exports = {
  apps: [
    {
      name: "hangman-app",
      script: "./index.js",
      env: {
        PORT: 9000,
        SECRET_KEY: "hangman-session",
      },
    },
  ],
};
