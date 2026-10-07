
const LegalPage = require("../models/LegalPage");

const defaultPolicies = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    subtitle: "How Royal Grand IN Resorts protects and respects your personal privacy",
    lastUpdated: "October 2026",
    status: "published",
    order: 1,
    content: "## 1. Introduction\\nAt Royal Grand IN Resorts (Maredumilli, Andhra Pradesh), we hold the privacy and trust of our guests in the highest regard.",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    subtitle: "General terms of residency, booking guidelines, and resort policies",
    lastUpdated: "October 2026",
    status: "published",
    order: 2,
    content: "## 1. Booking & Reservation Policy\\nAll bookings are confirmed upon receipt of valid advance payment.",
  },
  {
    slug: "cancellation-policy",
    title: "Cancellation & Refund Policy",
    subtitle: "Fair terms for reservation cancellations, date modifications, and refunds",
    lastUpdated: "October 2026",
    status: "published",
    order: 3,
    content: "## 1. Standard Cancellation Timeline\\nFull refund if cancelled 7+ days prior to check-in.",
  },
];

exports.getLegalPages = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    let pages = await LegalPage.find(query).sort({ order: 1 });
    if (pages.length === 0 && Object.keys(query).length === 0) {
      await LegalPage.insertMany(defaultPolicies);
      pages = await LegalPage.find({}).sort({ order: 1 });
    }
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch legal pages" });
  }
};

exports.getLegalPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let page = await LegalPage.findOne({ slug });
    if (!page) {
      const fallback = defaultPolicies.find((p) => p.slug === slug);
      if (fallback) {
        page = await LegalPage.create(fallback);
      }
    }
    if (!page) return res.status(404).json({ error: "Legal page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch legal page" });
  }
};

exports.updateLegalPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const body = req.body;
    const page = await LegalPage.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: "Legal page updated", page });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update legal page" });
  }
};

exports.createLegalPage = async (req, res) => {
  try {
    const body = req.body;
    const page = await LegalPage.create(body);
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create legal page" });
  }
};

exports.deleteLegalPage = async (req, res) => {
  try {
    const { slug } = req.params;
    await LegalPage.findOneAndDelete({ slug });
    res.json({ success: true, message: "Legal page deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete legal page" });
  }
};
