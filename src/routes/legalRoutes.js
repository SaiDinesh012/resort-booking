const express = require("express");
const router = express.Router();
const {
  getLegalPages,
  getLegalPageBySlug,
  updateLegalPage,
  createLegalPage,
  deleteLegalPage,
} = require("../controllers/legalController");

router.route("/").get(getLegalPages).post(createLegalPage);
router.route("/:slug").get(getLegalPageBySlug).put(updateLegalPage).delete(deleteLegalPage);

module.exports = router;
