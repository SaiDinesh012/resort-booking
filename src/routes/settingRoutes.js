const express = require("express");
const router = express.Router();
const { getSetting, updateSetting } = require("../controllers/settingController");

router.route("/").get(getSetting).post(updateSetting);

module.exports = router;
