const NewsletterSubscriber = require("../models/NewsletterSubscriber");

// POST /api/newsletter - Subscribe a guest
exports.subscribe = async (req, res) => {
  try {
    const { email, source = "website_footer" } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    let subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

    if (subscriber) {
      if (subscriber.status === "unsubscribed") {
        subscriber.status = "active";
        subscriber.subscribedAt = new Date();
        await subscriber.save();
        return res.status(200).json({
          success: true,
          message: "Welcome back! Your newsletter subscription has been reactivated.",
        });
      }
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: "You are already subscribed to our newsletter! Thank you for staying connected.",
      });
    }

    subscriber = await NewsletterSubscriber.create({
      email: normalizedEmail,
      source,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing! Seasonal offers and resort stories will arrive in your inbox.",
      subscriber,
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return res.status(500).json({ error: "Failed to process subscription. Please try again." });
  }
};

// GET /api/newsletter - Admin view all subscribers
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    return res.status(200).json({
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    return res.status(500).json({ error: "Failed to fetch subscribers." });
  }
};
