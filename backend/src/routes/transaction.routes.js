const router = require("express").Router();
const ctrl = require("../controllers/transaction.controller");
const validate = require("../middleware/validate.middleware");
const { transactionSchema, recategorizeSchema } = require("../validators/transaction.validator");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use(authMiddleware);
router.get("/", ctrl.list);
router.post("/", validate(transactionSchema), ctrl.create);
router.get("/smart-capture", ctrl.smartCapture);
router.post("/bulk-verify", ctrl.bulkVerify);
router.get("/:id", ctrl.getOne);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/:id/confirm", ctrl.confirm);
router.post("/:id/recategorize", validate(recategorizeSchema), ctrl.recategorize);

module.exports = router;
