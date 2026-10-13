const mongoose = require("mongoose");

const assistantMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    insights: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    chart: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    source: {
      type: String,
      default: "ollama",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AssistantMessage", assistantMessageSchema);
