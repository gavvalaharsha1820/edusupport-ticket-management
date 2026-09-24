const router = require("express").Router();
const controller = require("../controllers/tickets");
const { protect, allow } = require("../middleware/auth");

router.use(protect);
router.get("/dashboard", controller.dashboard);
router.get("/staff", allow("staff", "admin"), controller.staff);
router.get("/", controller.list);
router.post("/", allow("student"), controller.create);
router.get("/:id", controller.get);
router.patch("/:id", controller.update);

module.exports = router;
