const express = require("express");
const pool = require("./db");
const path = require("path");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");

const initializePassport = require("./passportConfig");
const app = express();

initializePassport(passport);
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "views", "styles")));

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.get("/users", (req, res) =>{
    pool.query("SELECT * FROM usuarios", (error, results) =>{
        if(error) throw error;
        res.status(200).json(results.rows);
    });
});



app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
    res.render("register.ejs");
});
  
app.get("/users/login", checkAuthenticated, (req, res) => {
    res.render("login.ejs");
});
  
app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    console.log(req.isAuthenticated());
    res.render("dashboard", { user: req.user });
});
  
app.get("/users/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error(err);
            return res.redirect("/users/dashboard"); 
        }
        req.flash("success_msg", "Você deslogou com sucesso")
        res.render("login");
    });
});


app.post("/users/register", async (req, res) => {
    const { nome, endereco, email, login, senha, senha2, adm = false } = req.body;
  
    const errors = [];
  
    console.log({
      nome,
      endereco,
      email,
      login,
      senha,
      senha2,
    });
  
    if (!nome || !endereco || !email || !login || !senha || !senha2) {
      errors.push({ message: "Preencha todos os campos" });
    }
  
    if (senha.length < 6) {
      errors.push({ message: "Senhas precisam ter ao menos 6 caracteres" });
    }
  
    if (senha !== senha2) {
      errors.push({ message: "As senhas inseridas são diferentes" });
    }
  
    if (errors.length > 0) {
      res.render("register", { errors, nome, endereco, email, login, senha, senha2 });
    } else {
      hashedPassword = await bcrypt.hash(senha, 10);
      console.log(hashedPassword);
  
      pool.query(
        `SELECT * FROM usuarios
          WHERE email = $1`, [email],
        (err, results) => {
          if (err) {
            console.log(err);
          }
          console.log(results.rows);
  
          if (results.rows.length > 0) {
            return res.render("register", {
              message: "Email em uso"
            });
          } else {
            pool.query(
              `INSERT INTO usuarios (nome, endereco, email, login, senha, adm)
                  VALUES ($1, $2, $3, $4, $5, $6)
                  RETURNING id, senha`,
              [nome, endereco, email, login, hashedPassword, adm],
              (err, results) => {
                if (err) {
                  throw err;
                }
                console.log(results.rows);
                req.flash("success_msg", "Você está registrado, faça login");
                res.redirect("/users/login");
              }
            );
          }
        }
      );
    }
});

app.post("/users/login", passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}));

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/dashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login");
  }


app.listen(port, () => console.log(`ouvindo na porta ${port}`));