// All Required Modules & Packages =========================================
require("dotenv").config();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Otp = require("../database/otp.js");

// Private Functions =======================================================
async function saveOtpToDatabase(email, otp) {
  try {
    let setOtp = new Otp({
      Email: email,
      Otp: await bcrypt.hash(otp, 10),
    });
    await setOtp.save();
  } catch (err) {
    return new Error(err);
  }
}

// Exporting Functions =====================================================
function otpSenderViaEmail(email) {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: true,
    upperCaseAlphabets: true,
    specialChars: false,
  });
  saveOtpToDatabase(email, otp);
  const msg = {
    from: "sayankb.001@gmail.com",
    to: `${email}`,
    subject: "MEET CAM otp!!!",
    html: `<h1>Welcome</h1><br><p>Your OTP(one time password) is: <strong>${otp}</strong></p><br>
    <p>It is valid for 2 minutes form now.</p><br><h4>Thank you😊.</h4>`,
  };
  nodemailer
    .createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD_SECRET,
      },
    })

    .sendMail(msg, (err) => {
      if (err) {
        return new Error(err);
      }
    });
}

module.exports = otpSenderViaEmail;
