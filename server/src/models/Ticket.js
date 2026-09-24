const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  ticketNo: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: {
    type: String,
    enum: ["Fees", "Attendance", "ID Card", "Documents", "Certificates", "Technical", "Other"],
    required: true
  },
  priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
  status: {
    type: String,
    enum: ["Open", "Assigned", "In Progress", "Pending Student", "Resolved", "Closed"],
    default: "Open"
  },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  slaDueAt: { type: Date, required: true },
  resolvedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null }
}, { timestamps: true });

ticketSchema.pre("validate", function(next) {
  if (!this.ticketNo) {
    this.ticketNo = `TKT-${Date.now().toString().slice(-7)}-${Math.floor(Math.random() * 90 + 10)}`;
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
