const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    images: { type: [String], default: [] },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
    price: { type: Number, required: true },
    priceType: {
      type: String,
      enum: ["per_person", "per_couple", "per_group"],
      default: "per_couple",
    },
    maxGuests: { type: Number, default: 2 },
    includedRoom: { type: String, default: "" },
    activities: { type: [String], default: [] },
    meals: {
      type: { type: String, default: "MAP" },
      label: { type: String, default: "Breakfast & Dinner Included" },
      description: { type: String, default: "Daily buffet breakfast and multi-course dinner." },
    },
    sightseeing: { type: [String], default: [] },
    transport: { type: Boolean, default: false },
    itinerary: [
      {
        day: { type: Number },
        title: { type: String },
        activities: { type: [String] },
        meals: { type: [String] },
      },
    ],
    whatsIncluded: { type: [String], default: [] },
    whatsExcluded: { type: [String], default: [] },
    terms: { type: [String], default: [] },
    cancellationPolicy: { type: String, default: "Free cancellation up to 7 days before check-in." },
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 4.9 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Package || mongoose.model("Package", PackageSchema);
