const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, default: "General Inquiry" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "in-progress", "replied", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);
