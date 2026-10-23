const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");

router.post("/", newsletterController.subscribe);
router.get("/", newsletterController.getSubscribers);
router.patch("/", newsletterController.updateSubscriber);
router.delete("/", newsletterController.deleteSubscriber);

module.exports = router;

