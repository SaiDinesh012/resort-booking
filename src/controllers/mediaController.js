const mongoose = require("mongoose");
const Media = require("../models/Media");
const cloudinary = require("../config/cloudinary");

exports.getMedia = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category && category !== "all") query.category = category;

    const mediaItems = await Media.find(query).sort({ createdAt: -1 });
    res.json(mediaItems);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch media" });
  }
};

exports.getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const media = await Media.findOne(filter);
    if (!media) return res.status(404).json({ error: "Media item not found" });

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch media item" });
  }
};

exports.createMedia = async (req, res) => {
  try {
    const body = req.body;
    let finalUrl = body.url;
    let finalThumbnail = body.thumbnailUrl || body.url;
    let width = body.width || 1200;
    let height = body.height || 800;
    let fileSizeKb = body.fileSizeKb || 250;
    let format = body.format || "jpg";

    // If base64 file data or image URL is provided, upload directly to Cloudinary
    const imageToUpload = body.fileData || body.url;
    if (imageToUpload) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageToUpload, {
          folder: "resort-booking",
          resource_type: "auto",
        });
        finalUrl = uploadRes.secure_url;
        finalThumbnail = uploadRes.secure_url;
        width = uploadRes.width;
        height = uploadRes.height;
        fileSizeKb = Math.round(uploadRes.bytes / 1024);
        format = uploadRes.format || "jpg";
      } catch (cloudErr) {
        console.warn("Cloudinary upload fallback to standard URL:", cloudErr.message);
      }
    }

    if (!body.title || !finalUrl) {
      return res.status(400).json({ error: "Title and valid image or URL are required." });
    }

    const id = body.id || `med-${Date.now()}`;
    const newMedia = await Media.create({
      ...body,
      id,
      url: finalUrl,
      thumbnailUrl: finalThumbnail,
      width,
      height,
      fileSizeKb,
      format,
      fileName: body.fileName || `resort-${Date.now()}.${format}`,
    });

    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create media item" });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const updatedMedia = await Media.findOneAndUpdate(filter, { $set: req.body }, { new: true });
    if (!updatedMedia) return res.status(404).json({ error: "Media item not found" });

    res.json(updatedMedia);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update media item" });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const deletedMedia = await Media.findOneAndDelete(filter);
    if (!deletedMedia) return res.status(404).json({ error: "Media item not found" });

    res.json({ success: true, message: "Media item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete media item" });
  }
};
