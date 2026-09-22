const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    images: { type: [String], default: [] },
    size: { type: Number, required: true, default: 450 },
    maxAdults: { type: Number, required: true, default: 2 },
    maxChildren: { type: Number, required: true, default: 1 },
    maxOccupancy: { type: Number, required: true, default: 3 },
    beds: { type: String, required: true, default: "1 King Bed" },
    amenities: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    weekendPrice: { type: Number, required: true },
    taxRate: { type: Number, default: 0.18 },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "blocked"],
      default: "available",
    },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    floorLevel: { type: String, default: "" },
    view: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Room || mongoose.model("Room", RoomSchema);
