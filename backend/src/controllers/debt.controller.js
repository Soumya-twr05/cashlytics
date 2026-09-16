const Debt = require("../models/Debt");
const { success, created, fail } = require("../utils/response");

async function list(req, res, next) {
  try {
    const items = await Debt.find({ user: req.userId });
    return success(res, { items });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await Debt.create({ ...req.body, user: req.userId });
    return created(res, { item });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await Debt.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
    if (!item) return fail(res, "Debt not found", 404);
    return success(res, { item });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await Debt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return fail(res, "Debt not found", 404);
    return success(res, {}, "Deleted");
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };
