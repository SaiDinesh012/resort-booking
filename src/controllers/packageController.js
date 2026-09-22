const Package = require("../models/Package");
const { mockPackages } = require("../data/mockData");

exports.getPackages = async (req, res) => {
  try {
    const { status, featured } = req.query;
    const query = {};
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    let packages = await Package.find(query).sort({ createdAt: -1 });

    if (packages.length === 0 && Object.keys(query).length === 0) {
      await Package.insertMany(mockPackages);
      packages = await Package.find({}).sort({ createdAt: -1 });
    }

    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch packages" });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    let pkg = await Package.findOne({ $or: [{ id }, { slug: id }] });

    if (!pkg) {
      const mockMatch = mockPackages.find((p) => p.id === id || p.slug === id);
      if (mockMatch) {
        await Package.create(mockMatch);
        pkg = await Package.findOne({ $or: [{ id }, { slug: id }] });
      }
    }

    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch package" });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.price) {
      return res.status(400).json({ error: "Name and Price are required." });
    }

    const id = body.id || `pkg-${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    const newPackage = await Package.create({
      ...body,
      id,
      slug,
      images: body.images?.length ? body.images : ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80"],
    });

    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create package" });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPackage = await Package.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: req.body },
      { new: true }
    );

    if (!updatedPackage) return res.status(404).json({ error: "Package not found" });
    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update package" });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPackage = await Package.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    if (!deletedPackage) return res.status(404).json({ error: "Package not found" });

    res.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete package" });
  }
};
