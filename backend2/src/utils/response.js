function success(res, data = {}, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function created(res, data = {}, message = "Created") {
  return success(res, data, message, 201);
}

function fail(res, message = "Request failed", status = 400, details) {
  const payload = { success: false, message };
  if (details) payload.details = details;
  return res.status(status).json(payload);
}

module.exports = { success, created, fail };
