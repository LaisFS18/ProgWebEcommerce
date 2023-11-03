const { Router } = require("express");
const controller = require("./controller");

const router = Router();

router.get("/", controller.getHome);
router.get("/users/login", controller.getLogin);
router.get("/users/register", controller.getRegister);
router.get("/users/dashboard", controller.getDashboard);
router.get("/users/logout", controller.logout);

router.post("/users/register", controller.register);

module.exports = router;