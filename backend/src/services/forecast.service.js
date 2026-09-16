const { daysLeftInMonth } = require("../utils/date");

function forecastCategory({ spent, daysElapsed, daysLeft, budget }) {
  const velocity = daysElapsed > 0 ? spent / daysElapsed : spent;
  const projected = spent + velocity * daysLeft;
  const remaining = budget - spent;
  const daysUntilExhausted = velocity > 0 && remaining > 0 ? Math.floor(remaining / velocity) : daysLeft;
  return {
    velocity: Number(velocity.toFixed(2)),
    projected: Number(projected.toFixed(2)),
    daysUntilExhausted,
    willExceed: projected > budget,
  };
}

function monthProgress(date = new Date()) {
  const daysElapsed = date.getDate();
  return { daysElapsed, daysLeft: daysLeftInMonth(date) };
}

module.exports = { forecastCategory, monthProgress };
