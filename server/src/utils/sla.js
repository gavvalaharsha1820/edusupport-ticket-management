const HOURS = { Low: 72, Medium: 48, High: 24, Urgent: 8 };

function getSlaDue(priority, from = new Date()) {
  return new Date(from.getTime() + HOURS[priority] * 60 * 60 * 1000);
}

module.exports = { HOURS, getSlaDue };
