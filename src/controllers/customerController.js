const Customer = require("../models/Customer");

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch customers" });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findOne({ $or: [{ id }, { email: id }] });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch customer" });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const body = req.body;
    if (!body.firstName || !body.email || !body.phone) {
      return res.status(400).json({ error: "First Name, Email, and Phone are required." });
    }

    const id = body.id || `cust-${Date.now()}`;
    const newCustomer = await Customer.create({ ...body, id });

    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create customer" });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCustomer = await Customer.findOneAndUpdate(
      { $or: [{ id }, { email: id }] },
      { $set: req.body },
      { new: true }
    );

    if (!updatedCustomer) return res.status(404).json({ error: "Customer not found" });
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update customer" });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findOneAndDelete({ $or: [{ id }, { email: id }] });
    if (!deletedCustomer) return res.status(404).json({ error: "Customer not found" });

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete customer" });
  }
};
