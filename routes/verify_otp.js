// All Required Modules & Packages ========================================
const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../database/user.js");
const Otp = require("../database/otp.js");
const otpSenderViaEmail = require("../middleware/otp_sender_via_email.js");
const userAuthorization = require("../middleware/user_authorization.js");
const forgetPasswordAuthorization = require("../middleware/forget_password_authorization.js");

// All Routes =============================================================
// Verify Email Routes --------------
router
  .route("/verify_email")
  .get(userAuthorization, (req, res) => {
    if (req.isAuthorized && !req.emailVerified) {
      try {
        otpSenderViaEmail(req.email);
        return res
          .status(200)
          .render("verify_otp_verify_email", { layout: false });
      } catch (err) {
        return res
          .status(500)
          .send("SERVER ERROR !!! 😢 \nPlease try again later.");
      }
    }
    res.status(400).redirect("/home");
  })
  .put(userAuthorization, async (req, res) => {
    if (req.isAuthorized && !req.isEmailVerified) {
      try {
        const otpS = await Otp.find({ Email: req.email });
        console.log("otpS -> ", otpS);
        if (otpS && await bcrypt.compare(req.body.otp, otpS[otpS.length - 1].Otp)) {
          await User.findOneAndUpdate({ Email: req.email }, { Verified: true });
          await Otp.deleteMany({ Email: req.email });
          return res.status(200).json({});
        } else {
          return res.status(400).json({});
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({});
      }
    }
    res.status(401).json({});
  });

// Delete Account Routes ---------------
router
  .route("/delete_account")
  .get(userAuthorization, (req, res) => {
    if (req.isAuthorized) {
      try {
        otpSenderViaEmail(req.email);
        return res
          .status(200)
          .render("verify_otp_delete_account", { layout: false });
      } catch (err) {
        return res
          .status(500)
          .send("SERVER ERROR !!! 😢 \nPlease try again later.");
      }
    }
    res.status(401).redirect("/home");
  })
  .delete(userAuthorization, async (req, res) => {
    if (req.isAuthorized) {
      try {
        let otpS = await Otp.find({ Email: req.email });
        if (otpS && await bcrypt.compare(req.body.otp, otpS[otpS.length - 1].Otp)) {
          res.clearCookie("UAT");
          await User.findOneAndDelete({ Email: req.email });
          await Otp.deleteMany({ Email: req.email });
          return res.status(200).json({});
        } else {
          return res.status(400).json({});
        }
      } catch (err) {
        return res.status(500).json({});
      }
    }
    res.status(401).json({});
  });

// Forget Password Routes ----------------
router
  .route("/forget_password")
  .get(userAuthorization, forgetPasswordAuthorization, (req, res) => {
    if (!req.isAuthorized && req.isAuthorizedToChangePassword) {
      try {
        otpSenderViaEmail(req.userEmailToChangePassword);
        return res
          .status(200)
          .render("verify_otp_forget_password", { layout: false });
      } catch (err) {
        return res
          .status(500)
          .send("SERVER ERROR !!! 😢 \nPlease try again later.");
      }
    }
    res.status(401).redirect("/home");
  })
  .put(userAuthorization, forgetPasswordAuthorization, async (req, res) => {
    if (!req.isAuthorized && req.isAuthorizedToChangePassword) {
      try {
        let otpS = await Otp.find({ Email: req.userEmailToChangePassword });
        if (otpS && await bcrypt.compare(req.body.otp, otpS[otpS.length - 1].Otp)) {
          res.clearCookie("FPAT");
          await User.findOneAndUpdate(
            { Email: req.email_toChangePassword },
            { Password: await bcrypt.hash(req.body.newPassword, 10) }
          );
          await Otp.deleteMany({ Email: req.email });
          return res.status(200).json({});
        } else {
          return res.status(401).json({});
        }
      } catch (err) {
        return res.status(500).json({});
      }
    }
    res.clearCookie("FPAT");
    res.status(400).json({});
  });

module.exports = router;
