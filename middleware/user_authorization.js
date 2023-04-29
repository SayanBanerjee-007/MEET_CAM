// All Required Modules & Packages =========================================
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../database/user.js");

// Exporting Functions =====================================================
function userAuthorization(req, res, next) {
  const UAT = req.cookies.UAT;
  if (!UAT) {
    req.isAuthorized = false;
    return next();
  }
  try {
    jwt.verify(UAT, process.env.ACCESS_TOKEN_SECRET, async (err, object) => {
      if (err || !object) {
        req.isAuthorized = false;
        console.log(err);
        return next();
      }
      const { email } = object;
      const user = await User.findOne({ Email: email });
      if (user == null) {
        req.isAuthorized = false;
        return next();
      }
      req.isAuthorized = true;
      req.email = email;
      req.name = user.Name;
      req.isEmailVerified = user.Verified;
      req.haveImage = user.HaveImage;
      return next();
    });
  } catch (err) {
    console.log(err);
    req.isAuthorized = false;
    return next();
  }
}

module.exports = userAuthorization;