// All Required Modules & Packages ========================================
const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../database/user.js");
const userAuthorization = require("../middleware/user_authorization");

// All Routes =============================================================
// Root Routes --------------
router
  .route("/")
  .get(userAuthorization, (req, res) => {
    if (!req.isAuthorized) {
      return res.render("signup", {
        isAuthorized: req.isAuthorized,
        extractStyles: true,
      });
    }
    res.redirect("/home");
  })
  .post(userAuthorization, async (req, res) => {
    if (!req.isAuthorized) {
      try {
        const user = await User.findOne({ Email: req.body.email });
        if (user) {
          return res
            .status(400)
            .json({ message: "Sign up with another email." });
        }
        const newUser = new User({
          Name: req.body.name,
          PhoneNumber: req.body.phoneNumber,
          Email: req.body.email,
          Password: await bcrypt.hash(req.body.password, 10),
          Verified: false,
          HaveImage: false,
        });
        await newUser.save();
        return res
          .status(200)
          .json({ message: "Login and verify to use MEET CAM" });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Refresh the page or try again later." });
      }
    }
    res.status(403).json({});
  });

module.exports = router;
