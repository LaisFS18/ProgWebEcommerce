const LocalStrategy = require("passport-local").Strategy;
const pool = require("./db");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (login, senha, done) => {
    console.log(login, senha);
    pool.query(
      `SELECT * FROM usuarios WHERE login = $1`,
      [login],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];

          bcrypt.compare(senha, user.senha, (err, isMatch) => {
            if (err) {
                throw err
            }
            if (isMatch) {
              return done(null, user);
            } else {
                if (user.senha === senha) { // Comparação direta de senhas em texto simples
                    return done(null, user);
                  } else {
                    return done(null, false, { message: "Senha incorreta" });
                }
            }
          });
        } else {
          return done(null, false, {
            message: "Nenhum usuario com esse login foi encontrado"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "login", passwordField: "senha" },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM usuarios WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID é ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;