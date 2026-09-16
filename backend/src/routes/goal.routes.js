const router = require("express").Router();
const ctrl = require("../controllers/goal.controller");
const validate = require("../middleware/validate.middleware");
const { goalSchema } = require("../validators/goal.validator");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use(authMiddleware);
router.get("/", ctrl.list);
router.post("/", validate(goalSchema), ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
