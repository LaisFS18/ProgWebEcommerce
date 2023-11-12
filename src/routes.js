const { Router } = require("express");
const controller = require("./controller");

const router = Router();

router.get("/", controller.getProducts);
router.get("/users/login", controller.getLogin);
router.get("/users/register", controller.getRegister);
router.get("/users/dashboard", controller.getDashboard);
router.get("/users/logout", controller.logout);

router.post("/users/deleteAccount", controller.postDeleteAccount);
router.post("/users/register", controller.register);
router.post("/users/editProfile", controller.postEditProfile);

module.exports = router;