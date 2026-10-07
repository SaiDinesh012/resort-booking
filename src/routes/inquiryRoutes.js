const express = require("express");
const router = express.Router();
const { createInquiry, getInquiries, deleteInquiry } = require("../controllers/inquiryController");

router.route("/").get(getInquiries).post(createInquiry);
router.route("/:id").delete(deleteInquiry);

module.exports = router;
