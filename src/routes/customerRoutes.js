const express = require("express");
const router = express.Router();
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, loginCustomer } = require("../controllers/customerController");

router.route("/").get(getCustomers).post(createCustomer);
router.post("/login", loginCustomer);
router.route("/:id").get(getCustomerById).put(updateCustomer).delete(deleteCustomer);

module.exports = router;
