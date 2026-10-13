const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "▣" },
    target: { type: Number, required: true, min: 0 },
    current: { type: Number, default: 0, min: 0 },
    monthly: { type: Number, default: 0, min: 0 },
    color: { type: String, default: "#10b981" },
    deadline: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
