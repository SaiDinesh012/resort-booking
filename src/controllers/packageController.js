const mongoose = require("mongoose");
const Package = require("../models/Package");

// @desc    Get all packages
// @route   GET /api/packages
exports.getPackages = async (req, res) => {
  try {
    const { status, featured } = req.query;
    const query = {};
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    const packages = await Package.find(query).sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch packages" });
  }
};

// @desc    Get package by ID or slug
// @route   GET /api/packages/:id
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { slug: id }, { _id: id }] }
      : { $or: [{ id }, { slug: id }] };

    const pkg = await Package.findOne(filter);
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch package" });
  }
};

// @desc    Create new package
// @route   POST /api/packages
exports.createPackage = async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.price) {
      return res.status(400).json({ error: "Name and Price are required." });
    }

    const id = body.id || `pkg-${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const durationNights = Number(body.durationNights) || 3;
    const durationDays = Number(body.durationDays) || (durationNights + 1);

    const newPackage = await Package.create({
      ...body,
      id,
      slug,
      durationNights,
      durationDays,
      price: Number(body.price),
      images: body.images?.length ? body.images : ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80"],
    });

    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create package" });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const updatedPackage = await Package.findOneAndUpdate(
      filter,
      { $set: req.body },
      { new: true }
    );

    if (!updatedPackage) return res.status(404).json({ error: "Package not found" });
    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update package" });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const deletedPackage = await Package.findOneAndDelete(filter);
    if (!deletedPackage) return res.status(404).json({ error: "Package not found" });

    res.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete package" });
  }
};
