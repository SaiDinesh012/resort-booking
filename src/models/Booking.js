const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    bookingNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ["room", "package"], required: true },
    roomId: { type: String },
    roomName: { type: String },
    packageId: { type: String },
    packageName: { type: String },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    nights: { type: Number, required: true },
    adults: { type: Number, required: true, default: 1 },
    children: { type: Number, default: 0 },
    guestDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String },
      city: { type: String },
      country: { type: String },
      idType: { type: String },
      idNumber: { type: String },
      specialRequests: { type: String },
    },
    priceBreakdown: {
      basePrice: { type: Number, required: true },
      nights: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxAmount: { type: Number, required: true },
      taxRate: { type: Number, required: true, default: 0.18 },
      discountAmount: { type: Number, default: 0 },
      couponCode: { type: String },
      total: { type: Number, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded", "partial"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "card" },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed", "no-show"],
      default: "confirmed",
    },
    notes: { type: String },
    timeline: [
      {
        timestamp: { type: String },
        event: { type: String },
        description: { type: String },
        actor: { type: String },
      },
    ],
    cancellationReason: { type: String },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
