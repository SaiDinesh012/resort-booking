const Room = require("../models/Room");
const Package = require("../models/Package");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const Media = require("../models/Media");
const { BlogPost, Review, FAQ, Attraction } = require("../models/Content");
const Setting = require("../models/Setting");

exports.seedData = async (req, res) => {
  try {
    const [
      rooms,
      packages,
      bookings,
      customers,
      payments,
      media,
      blogPosts,
      reviews,
      faqs,
      attractions,
      settings,
    ] = await Promise.all([
      Room.countDocuments(),
      Package.countDocuments(),
      Booking.countDocuments(),
      Customer.countDocuments(),
      Payment.countDocuments(),
      Media.countDocuments(),
      BlogPost.countDocuments(),
      Review.countDocuments(),
      FAQ.countDocuments(),
      Attraction.countDocuments(),
      Setting.countDocuments(),
    ]);

    res.json({
      status: "connected",
      message: "MongoDB Atlas live database connected. All collections are persistent.",
      counts: {
        rooms,
        packages,
        bookings,
        customers,
        payments,
        media,
        blogPosts,
        reviews,
        faqs,
        attractions,
        settings,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to check database status" });
  }
};
