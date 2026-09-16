const router = require("express").Router();
const ctrl = require("../controllers/bill.controller");
const validate = require("../middleware/validate.middleware");
const { billSchema } = require("../validators/bill.validator");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use(authMiddleware);
router.get("/", ctrl.list);
router.post("/", validate(billSchema), ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
