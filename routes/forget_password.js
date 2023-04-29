// All Required Modules & Packages ========================================
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const userAuthorization = require("../middleware/user_authorization");
const User = require("../database/user.js");

// All Routes =============================================================
// Root Routes --------------
router
  .route("/")
  .get(userAuthorization, (req, res) => {
    if (!req.isAuthorized) {
      return res.status(200).render("forget_password", {layout: false});
    }
    res.status(401).redirect("/home");
  })
  .post(userAuthorization, async (req, res) => {
    if (!req.isAuthorized) {
      try {
        const user = await User.findOne({ Email: req.body.email });
        if (user === null) {
          return res.status(400).json({});
        }
        const jwtValue = jwt.sign(
          { email: req.body.email },
          process.env.FORGET_PASSWORD_OTP_PAGE_ACCESS_TOKEN_SECRET,
          { expiresIn: "7m" }
        );
        res.cookie("FPAT", jwtValue, {
          maxAge: 1000 * 60 * 7,
          secure: false,
          httpOnly: true,
        });
        return res.status(200).json({});
      } catch (err) {
        return res.status(500).json({});
      }
    }
    res.status(401).json({});
  });

module.exports = router;