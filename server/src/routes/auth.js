const router = require("express").Router();
const controller = require("../controllers/auth");
const { protect } = require("../middleware/auth");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/me", protect, controller.me);

module.exports = router;
