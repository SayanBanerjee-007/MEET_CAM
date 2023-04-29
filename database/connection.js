require('dotenv').config();
const mongoose = require("mongoose");
const URI = process.env.DATABASE_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
