const Setting = require("../models/Setting");

exports.getSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    let setting = await Setting.findOne({ key });

    const defaults = {
      siteName: "Vanapriya Resort",
      tagline: "Where Wilderness Meets Luxury",
      description: "Nestled in the heart of the Western Ghats, Vanapriya Resort offers an unparalleled luxury escape.",
      phone: "+91 98765 43210",
      email: "reservations@vanapriya.com",
      address: "Survey No. 45, Chikmagalur-Koppa Road, Karnataka 577111, India",
      taxRate: 18,
      currency: "INR",
      heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=90",
      heroTitle: "Luxury Escape in the Western Ghats",
      heroSubtitle: "Nestled amidst the pristine forests of the Western Ghats, Vanapriya Resort is your sanctuary of calm, beauty, and refined hospitality.",
    };

    if (!setting) {
      setting = await Setting.create({
        key,
        value: defaults,
      });
      return res.json(setting.value);
    }

    // Merge defaults with saved value to ensure heroImage and other fields are always present
    const mergedValue = { ...defaults, ...setting.value };
    res.json(mergedValue);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch setting" });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    const body = req.body;

    let existing = await Setting.findOne({ key });
    const updatedValue = existing && existing.value ? { ...existing.value, ...body } : body;

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value: updatedValue },
      { upsert: true, new: true }
    );

    res.json(setting.value);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update setting" });
  }
};
