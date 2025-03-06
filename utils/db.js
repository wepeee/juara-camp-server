require("dotenv").config();
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");

const uri = process.env.DB_URI;

console.log(uri);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

// const User = require("../models/User");

// const addAdmin = async () => {
//   const password = "admin";

//   hash = await bcrypt.hashSync(password, 10);

//   const newUser = new User({
//     username: "admin",
//     password: hash,
//     role: "admin",
//   });

//   await newUser.save();
//   console.log("selesai");
// };

// addAdmin();
