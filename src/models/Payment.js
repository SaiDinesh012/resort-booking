const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    paymentId: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true },
    bookingNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "bank_transfer"],
      default: "card",
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending", "refunded"],
      default: "pending",
    },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
      default: "manual",
    },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
