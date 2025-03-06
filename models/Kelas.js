const mongoose = require("mongoose");

require("../utils/db");

const kelasScheme = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  imageLink: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Kelas = mongoose.model("Kelas", kelasScheme);

module.exports = Kelas;
