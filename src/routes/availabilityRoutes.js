const express = require("express");
const router = express.Router();
const { checkAvailability } = require("../controllers/availabilityController");

router.get("/", checkAvailability);

module.exports = router;
