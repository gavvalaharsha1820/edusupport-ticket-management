const router = require("express").Router();
const controller = require("../controllers/users");
const { protect, allow } = require("../middleware/auth");

router.use(protect, allow("admin"));
router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id/toggle", controller.toggle);

module.exports = router;
