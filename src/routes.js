const { Router } = require("express");
const controller = require("./controller");

const router = Router();

router.get("/", controller.getProducts);
router.get("/users/login", controller.getLogin);
router.get("/users/register", controller.getRegister);
router.get("/users/dashboard", controller.getDashboard);
router.get("/users/update-profile", controller.getUpdateUser);
router.get("/product/update/:id", controller.getUpdateProduct);
router.get("/users/logout", controller.logout);

router.post("/update-product/:id", controller.updateProduct);
router.post("/delete-product/:id", controller.deleteProduct);
router.post("/users/deleteAccount", controller.postDeleteAccount);
router.post("/users/register", controller.register);
router.post("/users/editProfile", controller.postEditProfile);

module.exports = router;