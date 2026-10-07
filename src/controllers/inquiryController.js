const Inquiry = require("../models/Inquiry");

exports.createInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const id = `inq-${Date.now()}`;
    const newInquiry = await Inquiry.create({
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject ? subject.trim() : "General Inquiry",
      message: message.trim(),
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "Your message has been received. Our concierge desk will contact you within 2 hours.",
      inquiry: newInquiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to process inquiry" });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch inquiries" });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await Inquiry.findOneAndDelete({ id });
    res.json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete inquiry" });
  }
};
