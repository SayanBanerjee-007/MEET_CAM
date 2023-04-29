// All Required Modules & Packages ========================================
const router = require("express").Router();
const userAuthorization = require("../middleware/user_authorization");

// All Routes =============================================================
// Root Routes --------------
router.route("/").get(userAuthorization, (req, res) => {
  res.status(200).render("features", {
    isAuthorized: req.isAuthorized,
    extractStyles: true,
  });
});

module.exports = router;