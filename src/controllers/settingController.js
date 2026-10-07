const Setting = require("../models/Setting");
const cloudinary = require("../config/cloudinary");

const DEFAULT_CONFIG = {
  siteName: "Royal Gradin",
  tagline: "Where Wilderness Meets Luxury",
  description: "Nestled in the heart of pristine nature, Royal Gradin offers an unparalleled luxury escape surrounded by serene landscapes and breathtaking vistas.",
  logoUrl: "",
  phone: "+91 98765 43210",
  email: "reservations@royalgradin.com",
  address: "Survey No. 45, Chikmagalur-Koppa Road, Karnataka 577111, India",
  checkInTime: "02:00 PM",
  checkOutTime: "11:00 AM",
  taxRate: 18,
  currency: "INR",
  heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=90",
  heroTitle: "Luxury Escape at Royal Gradin",
  heroSubtitle: "Nestled amidst pristine nature, Royal Gradin is your sanctuary of calm, beauty, and refined hospitality.",
};

exports.getSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    let setting = await Setting.findOne({ key });

    if (!setting) {
      setting = await Setting.create({
        key,
        value: DEFAULT_CONFIG,
      });
      return res.json(setting.value);
    }

    // Auto-migrate old "Vanapriya" placeholder name if present
    let val = setting.value || {};
    if (val.siteName === "Vanapriya Resort" || !val.siteName) {
      val.siteName = "Royal Gradin";
    }
    if (val.email === "reservations@vanapriya.com" || !val.email) {
      val.email = "reservations@royalgradin.com";
    }

    const mergedValue = { ...DEFAULT_CONFIG, ...val };
    res.json(mergedValue);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch setting" });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const key = req.query.key || "site_config";
    const body = { ...req.body };

    // If logo data or base64 data URL is provided, upload directly to Cloudinary
    const logoToUpload = body.logoData || (body.logoUrl && body.logoUrl.startsWith("data:image/") ? body.logoUrl : null);
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

    let existing = await Setting.findOne({ key });
    const existingVal = existing && existing.value ? existing.value : DEFAULT_CONFIG;
    const updatedValue = { ...existingVal, ...body };

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

exports.uploadLogo = async (req, res) => {
  try {
    const { fileData, url } = req.body;
    const imageToUpload = fileData || url;

    if (!imageToUpload) {
      return res.status(400).json({ error: "No image file or URL provided" });
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
        return res.status(500).json({ error: "Cloudinary upload failed: " + cloudErr.message });
      }
    }

    // Save directly to site_config
    const key = "site_config";
    let existing = await Setting.findOne({ key });
    const existingVal = existing && existing.value ? existing.value : DEFAULT_CONFIG;
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
    res.status(500).json({ error: error.message || "Failed to upload logo" });
  }
};
