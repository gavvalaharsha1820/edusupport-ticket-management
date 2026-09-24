const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["created", "status", "priority", "assignment", "comment", "resolution", "closure"],
    required: true
  },
  message: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
