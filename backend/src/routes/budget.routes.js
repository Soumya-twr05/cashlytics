const router = require("express").Router();
const ctrl = require("../controllers/budget.controller");
const validate = require("../middleware/validate.middleware");
const { budgetSchema } = require("../validators/budget.validator");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use(authMiddleware);
router.get("/", ctrl.list);
router.post("/", validate(budgetSchema), ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
