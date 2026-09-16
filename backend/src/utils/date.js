function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function daysLeftInMonth(date = new Date()) {
  const end = endOfMonth(date);
  return Math.max(1, Math.ceil((end - date) / (1000 * 60 * 60 * 24)));
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function rangeFromPreset(preset = "30D") {
  const end = new Date();
  const start = new Date();
  if (preset === "7D") start.setDate(end.getDate() - 7);
  else if (preset === "3M") start.setMonth(end.getMonth() - 3);
  else if (preset === "6M") start.setMonth(end.getMonth() - 6);
  else if (preset === "1Y") start.setFullYear(end.getFullYear() - 1);
  else start.setDate(end.getDate() - 30);
  return { start, end };
}

module.exports = { startOfMonth, endOfMonth, daysLeftInMonth, addMonths, rangeFromPreset };
