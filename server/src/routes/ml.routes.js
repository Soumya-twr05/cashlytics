const router = require("express").Router();
const ctrl = require("../controllers/ml.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// All ML proxy routes require a valid JWT so the service cannot be
// called anonymously from the public internet.
router.use(authMiddleware);

router.post("/predict-category", ctrl.predictCategory);

module.exports = router;
