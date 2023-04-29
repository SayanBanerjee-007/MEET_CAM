// All Required Modules & Packages ========================================
const router = require("express").Router();
const { v4: uuidV4 } = require("uuid");
var validateUUID = require("uuid-validate");
const userAuthorization = require("../middleware/user_authorization");

// All Routes =============================================================
// Root Routes --------------
router.route("/").get(userAuthorization, (req, res) => {
  if (req.isAuthorized) {
    if (req.isEmailVerified) {
      return res.status(200).redirect(`room/${uuidV4()}`);
    }
    return res.status(401).redirect("/home");
  }
  res.status(401).redirect("/login");
});

// roomID Routes ---------------
router.route("/:roomID").get(userAuthorization, (req, res) => {
  if (req.isAuthorized) {
    if (req.isEmailVerified && validateUUID(req.params.roomID, 4)) {
      return res
        .status(200)
        .render("room", {
          roomID: req.params.roomID,
          myName: req.name,
          layout: false,
        });
    }
    return res.status(404).redirect("/home");
  }
  res.status(401).redirect("/login");
});

module.exports = router;
