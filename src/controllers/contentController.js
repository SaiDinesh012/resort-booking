const { BlogPost, Review, FAQ, Attraction } = require("../models/Content");

exports.getContent = async (req, res) => {
  try {
    const { type, status } = req.query;
    const contentType = type || "blog";

    if (contentType === "blog") {
      const query = {};
      if (status) query.status = status;
      const posts = await BlogPost.find(query).sort({ createdAt: -1 });
      return res.json(posts);
    }

    if (contentType === "review") {
      const query = {};
      if (status) query.status = status;
      const reviews = await Review.find(query).sort({ createdAt: -1 });
      return res.json(reviews);
    }

    if (contentType === "faq") {
      const faqs = await FAQ.find({}).sort({ order: 1 });
      return res.json(faqs);
    }

    if (contentType === "attraction") {
      const attractions = await Attraction.find({}).sort({ createdAt: -1 });
      return res.json(attractions);
    }

    res.status(400).json({ error: "Invalid content type" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch content" });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const contentType = type || "blog";

    if (contentType === "blog") {
      const post = await BlogPost.findOne({ $or: [{ id }, { slug: id }] });
      if (!post) return res.status(404).json({ error: "Blog post not found" });
      return res.json(post);
    }

    if (contentType === "review") {
      const review = await Review.findOne({ id });
      if (!review) return res.status(404).json({ error: "Review not found" });
      return res.json(review);
    }

    if (contentType === "faq") {
      const faq = await FAQ.findOne({ id });
      if (!faq) return res.status(404).json({ error: "FAQ not found" });
      return res.json(faq);
    }

    if (contentType === "attraction") {
      const attraction = await Attraction.findOne({ id });
      if (!attraction) return res.status(404).json({ error: "Attraction not found" });
      return res.json(attraction);
    }

    res.status(400).json({ error: "Invalid content type" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch content item" });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { type } = req.query;
    const contentType = type || "blog";
    const body = req.body;

    if (contentType === "blog") {
      const id = body.id || `blog-${Date.now()}`;
      const slug = body.slug || body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      const newPost = await BlogPost.create({ ...body, id, slug });
      return res.status(201).json(newPost);
    }

    if (contentType === "review") {
      const id = body.id || `rev-${Date.now()}`;
      const newReview = await Review.create({ ...body, id });
      return res.status(201).json(newReview);
    }

    if (contentType === "faq") {
      const id = body.id || `faq-${Date.now()}`;
      const newFAQ = await FAQ.create({ ...body, id });
      return res.status(201).json(newFAQ);
    }

    if (contentType === "attraction") {
      const id = body.id || `att-${Date.now()}`;
      const newAttraction = await Attraction.create({ ...body, id });
      return res.status(201).json(newAttraction);
    }

    res.status(400).json({ error: "Invalid content type" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create content item" });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const contentType = type || "blog";
    const body = req.body;

    if (contentType === "blog") {
      const updated = await BlogPost.findOneAndUpdate({ $or: [{ id }, { slug: id }] }, { $set: body }, { new: true });
      return res.json(updated);
    }

    if (contentType === "review") {
      const updated = await Review.findOneAndUpdate({ id }, { $set: body }, { new: true });
      return res.json(updated);
    }

    if (contentType === "faq") {
      const updated = await FAQ.findOneAndUpdate({ id }, { $set: body }, { new: true });
      return res.json(updated);
    }

    if (contentType === "attraction") {
      const updated = await Attraction.findOneAndUpdate({ id }, { $set: body }, { new: true });
      return res.json(updated);
    }

    res.status(400).json({ error: "Invalid content type" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update content item" });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const contentType = type || "blog";

    if (contentType === "blog") {
      await BlogPost.findOneAndDelete({ $or: [{ id }, { slug: id }] });
      return res.json({ success: true, message: "Blog post deleted" });
    }

    if (contentType === "review") {
      await Review.findOneAndDelete({ id });
      return res.json({ success: true, message: "Review deleted" });
    }

    if (contentType === "faq") {
      await FAQ.findOneAndDelete({ id });
      return res.json({ success: true, message: "FAQ deleted" });
    }

    if (contentType === "attraction") {
      await Attraction.findOneAndDelete({ id });
      return res.json({ success: true, message: "Attraction deleted" });
    }

    res.status(400).json({ error: "Invalid content type" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete content item" });
  }
};
