const express = require("express");
const router = express.Router();
const { getMedia, getMediaById, createMedia, updateMedia, deleteMedia } = require("../controllers/mediaController");

router.route("/").get(getMedia).post(createMedia);
router.route("/:id").get(getMediaById).put(updateMedia).delete(deleteMedia);

module.exports = router;
