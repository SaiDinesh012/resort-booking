const express = require("express");
const router = express.Router();
const { getContent, getContentById, createContent, updateContent, deleteContent } = require("../controllers/contentController");

router.route("/").get(getContent).post(createContent);
router.route("/:id").get(getContentById).put(updateContent).delete(deleteContent);

module.exports = router;
