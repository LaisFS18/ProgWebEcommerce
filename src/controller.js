const pool = require("../db");
const bcrypt = require("bcrypt");

const getLogin = (req, res) => {
    res.render("login.ejs");
};

const getRegister = (req, res) => {
    res.render("register.ejs");
};

const getDashboard = (req, res) => {
    console.log(req.isAuthenticated());
    res.render("dashboard", { user: req.user });
};

const logout = (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error(err);
            return res.redirect("/users/dashboard"); 
        }
        req.flash("success_msg", "Você deslogou com sucesso")
        res.render("login");
    });
};

const register = async (req, res) => {
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
};

const getProducts = (req, res, next) => {
  pool.query(
    'SELECT produtos.*, categorias.nome as categoria_nome FROM produtos JOIN categorias ON produtos.categoria_id = categorias.id',
    (err, results) => {
      if (err) {
        return next(err);
      }

      const products = results.rows;

      res.render("index", { products });
    }
  );
};


module.exports = {
  getLogin,
  getRegister,
  getDashboard,
  logout,
  register,
  getProducts,
};