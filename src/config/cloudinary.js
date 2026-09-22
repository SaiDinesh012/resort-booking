const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dewdakkvj",
  api_key: process.env.CLOUDINARY_API_KEY || "885692934117445",
  api_secret: process.env.CLOUDINARY_API_SECRET || "3Klx9NQywZsF6KdV8_3wlxf9rr0",
});

module.exports = cloudinary;
