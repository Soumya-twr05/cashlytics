const adminService = require("../services/admin.service");
const { success } = require("../utils/response");

async function overview(req, res, next) {
  try {
    const data = await adminService.getOverviewMetrics();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { page, limit, search, role } = req.query;
    const data = await adminService.getUsersList({ page, limit, search, role });
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function analytics(req, res, next) {
  try {
    const data = await adminService.getPlatformAnalytics();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function aiMl(req, res, next) {
  try {
    const data = await adminService.getAiMlMonitoring();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function health(req, res, next) {
  try {
    const data = await adminService.getSystemHealth();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  overview,
  listUsers,
  analytics,
  aiMl,
  health,
};
