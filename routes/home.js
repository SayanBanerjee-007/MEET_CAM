// All Required Modules & Packages ========================================
const router = require("express").Router();
const userAuthorization = require("../middleware/user_authorization");

// All Routes =============================================================
// Root Routes --------------
router.route("/").get(userAuthorization, (req, res) => {
  res.render("home", {
    isAuthorized: req.isAuthorized,
    isEmailVerified: req.isEmailVerified,
    extractStyles: true,
  });
});

module.exports = router;
