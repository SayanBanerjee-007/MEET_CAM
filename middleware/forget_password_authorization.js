// All Required Modules & Packages =========================================
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../database/user.js");
require("dotenv").config();

// Exporting Functions =====================================================
function forgetPasswordAuthorization(req, res, next) {
    const FPAT = req.cookies.FPAT;  
    if (!FPAT) {
      req.isAuthorizedToChangePassword = false;
      return next();
    }
    try {
      jwt.verify(FPAT, process.env.FORGET_PASSWORD_OTP_PAGE_ACCESS_TOKEN_SECRET, async (err, object) => {
        if (err || !object) {
          req.isAuthorizedToChangePassword = false;
          return next();
        }
        const {email} = object;
        const user = await User.findOne({ Email: email });
        if (user === null) {
          req.isAuthorizedToChangePassword = false;
          return next();
        }
        req.isAuthorizedToChangePassword = true;
        req.userEmailToChangePassword = email;
        return next();
      });
    } catch (err) {
      req.isAuthorizedToChangePassword = false;
      return next();
    }
  }
  
  module.exports = forgetPasswordAuthorization;