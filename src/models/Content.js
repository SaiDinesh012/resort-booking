const mongoose = require("mongoose");

const BlogPostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featuredImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
    },
    category: { type: String, default: "Experiences" },
    author: { type: String, default: "Resort Editorial" },
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
    customerId: { type: String, default: () => `cust-${Date.now()}` },
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

delete mongoose.models.BlogPost;
delete mongoose.models.Review;
delete mongoose.models.FAQ;
delete mongoose.models.Attraction;

const BlogPost = mongoose.model("BlogPost", BlogPostSchema);
const Review = mongoose.model("Review", ReviewSchema);
const FAQ = mongoose.model("FAQ", FAQSchema);
const Attraction = mongoose.model("Attraction", AttractionSchema);

module.exports = { BlogPost, Review, FAQ, Attraction };
