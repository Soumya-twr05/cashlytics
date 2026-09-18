const router = require("express").Router();
const ctrl = require("../controllers/transaction.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { transactionSchema, recategorizeSchema } = require("../validators/transaction.validator");
const { fail } = require("../utils/response");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return fail(res, "Validation failed", 422, error.details.map((d) => d.message));
    req.body = value;
    return next();
  };
}

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
