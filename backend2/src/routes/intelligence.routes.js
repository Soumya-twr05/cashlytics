const router = require("express").Router();
const ctrl = require("../controllers/intelligence.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use(authMiddleware);
router.get("/dashboard", ctrl.dashboard);
router.get("/snapshot", ctrl.snapshot);
router.get("/anomalies", ctrl.anomalies);
router.get("/trends", ctrl.trends);
router.get("/learning", ctrl.learning);
router.get("/forecast", ctrl.forecast);

module.exports = router;
