// All Required Modules & Packages ========================================
require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const userAuthorization = require("../middleware/user_authorization");
const UsersInfo = require("../database/user.js");
// Image Uploading Related Packages --------------
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const mongoURI = process.env.DATABASE_URI;
const conn = mongoose.connection;
let gfs, gridfsBucket;

// Multer, GridFS Storage Settings =========================================
conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "images",
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("images");
});
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: req.email,
      bucketName: "images",
    };
  },
});
const image_upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      return cb(null, true);
    } else {
      return cb("Only JPEG / JPG / PNG images are supported.", false);
    }
  },
});

// All Routes =============================================================
// Root Routes --------------
router.route("/").get(userAuthorization, async (req, res) => {
  if (req.isAuthorized) {
    const user = await UsersInfo.findOne({ Email: req.email });
    return res.render("profile", {
      isAuthorized: req.isAuthorized,
      haveImage: req.haveImage,
      name: user.Name,
      email: user.Email,
      phoneNumber: user.PhoneNumber,
      extractStyles: true,
    });
  }
  res.redirect("/home");
});

// Image Uploading Routes -------------------
router
  .route("/image_upload")
  .post(userAuthorization, image_upload.single("file"), async (req, res) => {
    if (req.isAuthorized) {
      try {
        await UsersInfo.findOneAndUpdate(
          { Email: req.email },
          { HaveImage: true }
        );
        return res.status(200).redirect("/profile");
      } catch (error) {
        return res.status(500).redirect("/profile");
      }
    }
    res.status(401).redirect("/home");
  });

//  Getting Image Routes ----------------
router.route("/image").get(userAuthorization, async (req, res) => {
  if (req.isAuthorized && req.haveImage) {
    gfs.files.findOne({ filename: req.email }, (err, file) => {
      if (err) {
        return res.status(500).json({ error: "server error." });
      }
      if (!file || file.length === 0) {
        return res.status(404).json({ err: "No file found" });
      }
      if (
        file.contentType === "image/jpeg" ||
        file.contentType === "image/png" ||
        file.contentType === "image/jpg"
      ) {
        const readstream = gridfsBucket.openDownloadStream(file._id);
        return readstream.pipe(res);
      } else {
        return res.status(404).json({ err: "Invalid file type." });
      }
    });
  } else {
    res.status(401).redirect("/home");
  }
});

// Delete Image Routes ------------------
router.route("/image_delete").delete(userAuthorization, (req, res) => {
  if (req.isAuthorized && req.haveImage) {
    gfs.files.findOne({ filename: req.email }, async (err, file) => {
      if (err) {
        return res.status(500).json({});
      }
      try {
        await gridfsBucket.delete(file._id);
        await UsersInfo.findOneAndUpdate(
          { Email: req.email },
          { HaveImage: false }
        );
        return res.status(200).json({});
      } catch (error) {
        return res.status(500).json({});
      }
    });
  } else {
    res.status(401).json({});
  }
});

// Change Password Routes ------------------
router.route("/change_password").put(userAuthorization, async (req, res) => {
  if (req.isAuthorized) {
    try {
      const user = await UsersInfo.findOne({ Email: req.email });
      if (user && await bcrypt.compare(req.body.oldPassword, user.Password)) {
        await UsersInfo.findOneAndUpdate(
          { Email: req.email },
          { Password: await bcrypt.hash(req.body.newPassword, 10) }
        );
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

module.exports = router;