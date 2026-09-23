const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    altText: { type: String, default: "" },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    category: {
      type: String,
      default: "resort",
    },
    width: { type: Number, default: 1200 },
    height: { type: Number, default: 800 },
    fileSizeKb: { type: Number, default: 250 },
    format: {
      type: String,
      default: "jpg",
    },
    usedIn: { type: [String], default: [] },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

delete mongoose.models.Media;
module.exports = mongoose.model("Media", MediaSchema);
