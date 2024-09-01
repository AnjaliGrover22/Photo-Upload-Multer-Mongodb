const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  description: String,
  url: String,
});

const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;
