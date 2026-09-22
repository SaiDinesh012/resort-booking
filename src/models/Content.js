const mongoose = require("mongoose");

const BlogPostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, required: true, default: "Resort Editorial" },
    authorAvatar: { type: String },
    publishedAt: { type: String },
    status: {
      type: String,
      enum: ["published", "draft", "scheduled"],
      default: "published",
    },
    seoTitle: { type: String },
    seoDescription: { type: String },
    tags: { type: [String], default: [] },
    readTime: { type: Number, default: 5 },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerAvatar: { type: String },
    bookingId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    body: { type: String, required: true },
    roomId: { type: String },
    packageId: { type: String },
    status: {
      type: String,
      enum: ["published", "pending", "rejected"],
      default: "published",
    },
    reply: { type: String },
    repliedAt: { type: String },
  },
  { timestamps: true }
);

const FAQSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "General" },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const AttractionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    distance: { type: String, required: true },
    duration: { type: String, required: true },
    type: {
      type: String,
      enum: ["nature", "heritage", "adventure", "town", "religious"],
      default: "nature",
    },
    image: { type: String },
  },
  { timestamps: true }
);

const BlogPost = mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
const FAQ = mongoose.models.FAQ || mongoose.model("FAQ", FAQSchema);
const Attraction = mongoose.models.Attraction || mongoose.model("Attraction", AttractionSchema);

module.exports = { BlogPost, Review, FAQ, Attraction };
