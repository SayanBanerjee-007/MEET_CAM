// All Required Modules & Packages ========================================
const router = require("express").Router();
const userAuthorization = require("../middleware/user_authorization");

// All Routes =============================================================
// Root Routes --------------
router.route("/").get(userAuthorization, (req, res) => {
  if (req.isAuthorized) {
    res.clearCookie("UAT");
  }
  res.redirect("/home");
});

module.exports = router;
