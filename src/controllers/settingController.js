const Setting = require("../models/Setting");

exports.getSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    let setting = await Setting.findOne({ key });

    if (key === "site_config") {
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
        // About Section
        aboutBadge: "About the Resort",
        aboutTitle: "A Forest Retreat Like No Other",
        aboutBody: "<p>Nestled in the heart of the Western Ghats, Vanapriya Resort offers an unparalleled luxury escape surrounded by pristine forests, cascading waterfalls, and breathtaking mountain vistas.</p><p>With luxury accommodations — from intimate cottages to expansive villas — every stay at Vanapriya Resort is a chapter in your personal story of discovery and renewal.</p><ul><li>Thoughtfully designed luxury accommodations</li><li>Award-winning farm-to-table restaurant</li><li>Full-service Ayurvedic spa &amp; wellness centre</li><li>Expert-guided nature walks &amp; wildlife safaris</li></ul>",
        aboutImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=85",
        aboutYearsNumber: "15+",
        aboutYearsLabel: "Years of Luxury Hospitality",
        aboutLink: "/resort",
        aboutLinkText: "Discover More About Us",
      };

      if (!setting) {
        setting = await Setting.create({ key, value: defaults });
        return res.json(setting.value);
      }

      return res.json({ ...defaults, ...setting.value });
    }

    if (!setting) {
      return res.json(null);
    }

    res.json(setting.value);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch setting" });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    const body = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value: body },
      { upsert: true, new: true }
    );

    res.json(setting.value);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update setting" });
  }
};
