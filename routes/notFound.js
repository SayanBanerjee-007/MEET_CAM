// All Required Modules & Packages ========================================
const router = require("express").Router();

// All Routes =============================================================
// Root Routes --------------
router.route("/").get((req, res) => {
  res.status(404).render("not_found_404", { layout: false });
});

module.exports = router;