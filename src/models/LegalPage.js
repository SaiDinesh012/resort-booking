const mongoose = require("mongoose");

const LegalPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String, required: true },
    lastUpdated: { type: String, default: "October 2026" },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.LegalPage || mongoose.model("LegalPage", LegalPageSchema);
