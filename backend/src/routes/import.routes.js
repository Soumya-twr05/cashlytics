const router = require("express").Router();
const ctrl = require("../controllers/import.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/csv", authMiddleware, upload.single("file"), ctrl.importFile);

module.exports = router;
