const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },\n    password: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    country: { type: String, default: "India" },
    avatar: { type: String },
    totalBookings: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    lastBookingDate: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    notes: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
