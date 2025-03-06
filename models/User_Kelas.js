const { default: mongoose } = require("mongoose");
require("../utils/db");
const userKelasScheme = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  kelas: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Kelas",
  },
});

const User_Kelas = mongoose.model("User_Kelas", userKelasScheme);

module.exports = User_Kelas;
