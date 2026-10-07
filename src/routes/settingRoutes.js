const express = require("express");
const router = express.Router();
const { getSetting, updateSetting, uploadLogo } = require("../controllers/settingController");

router.route("/").get(getSetting).post(updateSetting);
router.route("/logo").post(uploadLogo);

module.exports = router;
