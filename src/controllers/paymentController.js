const Payment = require("../models/Payment");

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch payments" });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne({ $or: [{ id }, { paymentId: id }] });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch payment" });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const body = req.body;
    const id = body.id || `pay-${Date.now()}`;
    const paymentId = body.paymentId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment = await Payment.create({ ...body, id, paymentId });
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create payment" });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPayment = await Payment.findOneAndUpdate(
      { $or: [{ id }, { paymentId: id }] },
      { $set: req.body },
      { new: true }
    );

    if (!updatedPayment) return res.status(404).json({ error: "Payment not found" });
    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update payment" });
  }
};
