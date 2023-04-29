// All Required Modules & Packages ========================================
require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../database/user.js");
const userAuthorization = require("../middleware/user_authorization");

// All Routes =============================================================
// Root Routes --------------
router
  .route("/")
  .get(userAuthorization, (req, res) => {
    if (!req.isAuthorized) {
      return res.render("login", {
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
        if (user == null) {
          return res
            .status(400)
            .json({ message: "Invalid email or password." });
        }
        if (await bcrypt.compare(req.body.password, user.Password)) {
          const jwtValue = jwt.sign(
            { email: req.body.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10d" }
          );
          res.cookie("UAT", jwtValue, {
            maxAge: 1000 * 60 * 60 * 24 * 10,
            secure: true,
            httpOnly: true,
          });
          res.clearCookie("FPAT");
          return res.status(200).json({ message: "Login successful." });
        } else {
          return res
            .status(400)
            .json({ message: "Invalid email or password." });
        }
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Refresh the page or try again later." });
      }
    }
    res.status(403).json({});
  });

module.exports = router;
