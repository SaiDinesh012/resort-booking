const express = require("express");
const router = express.Router();
const { getSetting, updateSetting, adminLogin } = require("../controllers/settingController");

router.post("/admin-login", adminLogin);
router.route("/").get(getSetting).post(updateSetting);

module.exports = router;
