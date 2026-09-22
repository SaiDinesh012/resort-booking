const Room = require("../models/Room");
const Package = require("../models/Package");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const Media = require("../models/Media");
const { BlogPost, Review, FAQ, Attraction } = require("../models/Content");
const Setting = require("../models/Setting");
const { mockRooms, mockPackages, mockReviews, mockFAQs, mockAttractions } = require("../data/mockData");

exports.seedData = async (req, res) => {
  try {
    const force = req.query.force === "true";
    const roomCount = await Room.countDocuments();

    if (roomCount > 0 && !force) {
      return res.json({
        message: "Database already seeded.",
        counts: {
          rooms: roomCount,
          packages: await Package.countDocuments(),
          bookings: await Booking.countDocuments(),
          customers: await Customer.countDocuments(),
          payments: await Payment.countDocuments(),
          media: await Media.countDocuments(),
          blogPosts: await BlogPost.countDocuments(),
          reviews: await Review.countDocuments(),
          faqs: await FAQ.countDocuments(),
          attractions: await Attraction.countDocuments(),
        },
      });
    }

    if (force) {
      await Room.deleteMany({});
      await Package.deleteMany({});
      await Booking.deleteMany({});
      await Customer.deleteMany({});
      await Payment.deleteMany({});
      await Media.deleteMany({});
      await BlogPost.deleteMany({});
      await Review.deleteMany({});
      await FAQ.deleteMany({});
      await Attraction.deleteMany({});
      await Setting.deleteMany({});
    }

    await Room.insertMany(mockRooms);
    await Package.insertMany(mockPackages);
    await Review.insertMany(mockReviews);
    await FAQ.insertMany(mockFAQs);
    await Attraction.insertMany(mockAttractions);

    await Setting.create({
      key: "site_config",
      value: {
        siteName: "Vanapriya Resort",
        tagline: "Where Wilderness Meets Luxury",
        description: "Nestled in the heart of the Western Ghats, Vanapriya Resort offers an unparalleled luxury escape.",
        phone: "+91 98765 43210",
        email: "reservations@vanapriya.com",
        address: "Survey No. 45, Chikmagalur-Koppa Road, Karnataka 577111, India",
        taxRate: 18,
        currency: "INR",
        heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
        heroTitle: "Luxury Escape in the Western Ghats",
        heroSubtitle: "Where Wilderness Meets Unrivaled Sophistication",
      },
    });

    res.json({
      success: true,
      message: "Database seeded successfully!",
      counts: {
        rooms: mockRooms.length,
        packages: mockPackages.length,
        reviews: mockReviews.length,
        faqs: mockFAQs.length,
        attractions: mockAttractions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to seed database" });
  }
};
