const { default: mongoose, mongo } = require("mongoose");
require("../utils/db");
const userScheme = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userScheme);

module.exports = User;
