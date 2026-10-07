const Setting = require("../models/Setting");
const cloudinary = require("../config/cloudinary");

// Initial site configuration seeded into MongoDB on first run.
// This is stored in DB, NOT used as a static fallback on every request.
const INITIAL_SITE_CONFIG = {
  siteName: "Royal Grand IN Resorts",
  tagline: "Stay Once, Carry Memories Forever",
  description:
    "Nestled amidst the lush forests and serene landscapes of Maredumilli, Royal Grand IN Resorts offers an unparalleled luxury escape where royalty meets the wild.",
  footerDescription:
    "Nestled amidst the lush forests and tranquil canopy of Maredumilli, Royal Grand IN Resorts offers a refined sanctuary where luxury harmonizes with pristine nature.",
  logoUrl: "",
  phone: "+91 98765 43210",
  alternatePhone: "+91 94949 12345",
  email: "reservations@royalgrandin.com",
  address: "Maredumilli, East Godavari District, Andhra Pradesh 533288, India",
  googleMapsUrl: "https://maps.google.com/?q=Royal+Grand+IN+Resorts+Maredumilli+Andhra+Pradesh",
  instagramUrl: "https://instagram.com/royalgrandinresorts",
  facebookUrl: "https://facebook.com/royalgrandinresorts",
  youtubeUrl: "https://youtube.com/@royalgrandinresorts",
  whatsappNumber: "+91 98765 43210",
  tripadvisorUrl: "",
  newsletterHeading: "Subscribe to our Newsletter",
  newsletterSubheading: "Seasonal offers, curated packages and resort stories — in your inbox.",
  copyrightText: "© {year} Royal Grand IN Resorts. All rights reserved.",
  footerLocationNote: "Maredumilli, East Godavari District, Andhra Pradesh, India",
  checkInTime: "02:00 PM",
  checkOutTime: "11:00 AM",
  taxRate: 18,
  currency: "INR",
  heroImage:
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90",
  heroTitle: "Where Royalty Meets the Wild",
  heroSubtitle:
    "A luxurious retreat surrounded by lush forests, misty hills and the untouched beauty of Maredumilli.",
};

/**
 * GET /api/settings?key=site_config
 * Fetch settings from MongoDB. If no record exists, seed the initial config into DB first.
 */
exports.getSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    let setting = await Setting.findOne({ key });

    if (!setting) {
      // First time: seed initial config into MongoDB so all future data comes from DB
      setting = await Setting.create({
        key,
        value: INITIAL_SITE_CONFIG,
      });
    }

    // Auto-migrate legacy placeholder names if they were previously stored in DB
    let val = setting.value ? { ...setting.value } : {};
    let needsMigration = false;

    if (val.siteName === "Vanapriya Resort" || val.siteName === "Royal Gradin" || !val.siteName) {
      val.siteName = "Royal Grand IN Resorts";
      needsMigration = true;
    }
    if (val.tagline === "Where Wilderness Meets Luxury" || val.tagline === "Mothugudem, Andhra Pradesh" || !val.tagline) {
      val.tagline = "Stay Once, Carry Memories Forever";
      needsMigration = true;
    }
    if (val.email === "reservations@vanapriya.com" || val.email === "reservations@royalgradin.com" || !val.email) {
      val.email = "reservations@royalgrandin.com";
      needsMigration = true;
    }
    if (!val.address || val.address.includes("Chikmagalur") || val.address.includes("Mothugudem")) {
      val.address = "Maredumilli, East Godavari District, Andhra Pradesh 533288, India";
      needsMigration = true;
    }
    if (!val.heroTitle || val.heroTitle.includes("Western Ghats") || val.heroTitle.includes("Royal Gradin")) {
      val.heroTitle = "Where Royalty Meets the Wild";
      val.heroSubtitle = "A luxurious retreat surrounded by lush forests, misty hills and the untouched beauty of Maredumilli.";
      needsMigration = true;
    }

    // Persist migration back to DB so it's clean from now on
    if (needsMigration) {
      await Setting.findOneAndUpdate(
        { key },
        { value: val },
        { new: true }
      );
    }

    res.json(val);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch setting" });
  }
};

/**
 * POST /api/settings?key=site_config
 * Update settings in MongoDB. Optionally handles base64 logo upload to Cloudinary.
 */
exports.updateSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    const body = { ...req.body };

    // If logo data or base64 data URL is provided, upload directly to Cloudinary
    const logoToUpload =
      body.logoData ||
      (body.logoUrl && body.logoUrl.startsWith("data:image/")
        ? body.logoUrl
        : null);

    if (logoToUpload) {
      try {
        const uploadRes = await cloudinary.uploader.upload(logoToUpload, {
          folder: "resort-booking/logo",
          resource_type: "auto",
        });
        body.logoUrl = uploadRes.secure_url;
        delete body.logoData;
      } catch (cloudErr) {
        console.warn("Cloudinary logo upload fallback:", cloudErr.message);
      }
    }

    // Fetch existing value from DB (no static fallback)
    const existing = await Setting.findOne({ key });
    const existingVal = existing && existing.value ? { ...existing.value } : {};
    const updatedValue = { ...existingVal, ...body };

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value: updatedValue },
      { upsert: true, new: true }
    );

    res.json(setting.value);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Failed to update setting" });
  }
};

/**
 * POST /api/settings/logo
 * Upload a logo image (base64 or URL) to Cloudinary and save the URL to MongoDB.
 */
exports.uploadLogo = async (req, res) => {
  try {
    const { fileData, url } = req.body;
    const imageToUpload = fileData || url;

    if (!imageToUpload) {
      return res
        .status(400)
        .json({ error: "No image file or URL provided" });
    }

    let finalLogoUrl = url;

    if (imageToUpload.startsWith("data:image/") || !url) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageToUpload, {
          folder: "resort-booking/logo",
          resource_type: "auto",
        });
        finalLogoUrl = uploadRes.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
        return res
          .status(500)
          .json({ error: "Cloudinary upload failed: " + cloudErr.message });
      }
    }

    // Fetch existing DB value (no static defaults — only what's in DB)
    const key = "site_config";
    const existing = await Setting.findOne({ key });
    const existingVal = existing && existing.value ? { ...existing.value } : {};
    const updatedValue = { ...existingVal, logoUrl: finalLogoUrl };

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value: updatedValue },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      logoUrl: finalLogoUrl,
      settings: setting.value,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Failed to upload logo" });
  }
};
