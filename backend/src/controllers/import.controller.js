const { importCsv } = require("../services/import.service");
const { success, fail } = require("../utils/response");

async function importFile(req, res, next) {
  try {
    if (!req.file) return fail(res, "CSV file is required", 400);
    const result = await importCsv(req.userId, req.file.path);
    return success(res, result, "Import complete");
  } catch (err) {
    return next(err);
  }
}

module.exports = { importFile };
