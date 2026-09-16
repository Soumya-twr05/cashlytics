const path = require("path");
const multer = require("multer");
const env = require("../config/env");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve(__dirname, "../../", env.uploadDir)),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(csv|txt)$/i.test(file.originalname) || file.mimetype.includes("csv") || file.mimetype === "text/plain";
    cb(ok ? null : new Error("Only CSV files are allowed"), ok);
  },
});

module.exports = upload;
