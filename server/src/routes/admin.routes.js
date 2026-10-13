const router = require("express").Router();
const ctrl = require("../controllers/admin.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");

// Enforce authentication followed by administrator authorization on every admin route
router.use(authMiddleware);
router.use(requireAdmin);

router.get("/overview", ctrl.overview);
router.get("/users", ctrl.listUsers);
router.get("/analytics", ctrl.analytics);
router.get("/ai-ml", ctrl.aiMl);
router.get("/health", ctrl.health);

module.exports = router;
