const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// middleware
app.use(express.json());
app.use(cors());

const response = require("./response");

require("dotenv").config();
require("./utils/db");
const port = process.env.PORT;

// models
const User = require("./models/User");
const Kelas = require("./models/Kelas");
const User_Kelas = require("./models/User_Kelas");

const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json(response(null, 401, "tidak ada token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(response(null, 401, "unauthorized pepek"));
  }
};

const validateRole = (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin" && role !== "teacher") {
    return res.status(403).json(response(null, 403, "Forbidden"));
  }
  next();
};

app.get("/", validateToken, (req, res) => {
  res.json({ message: "home page" });
});

// masuk website
app.post("/api/register", async (req, res) => {
  try {
    const user = req.body;
    if (!user.username || !user.password || !user.role) {
      return res.status(400).json(response(null, 400, "Bad Request"));
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = new User({
      username: user.username,
      password: hashedPassword,
      role: user.role,
    });

    await newUser.save();
    return res.status(201).json(response(newUser, 201, "User created"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Internal Server Error"));
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const user = req.body;
    if (!user.username || !user.password) {
      return res.status(400).json(response(null, 400, "kosong cak"));
    }

    const found = await User.findOne({ username: user.username });

    if (!found) {
      return res.status(404).json(response(null, 404, "User tidak ditemukan"));
    }

    const match = await bcrypt.compare(user.password, found.password);

    if (!match) {
      return res.status(400).json(response(null, 400, "Password tidak sesuai"));
    }

    const token = jwt.sign(
      { id: found._id, username: found.username, role: found.role },
      process.env.SECRET_KEY
    );

    return res.status(200).json(response(token, 200, "Login berhasil"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// end masuk website

// get semua kelas
app.get("/api/kelas", validateToken, async (req, res) => {
  try {
    const kelas = await Kelas.find();
    if (!kelas || kelas.length === 0) {
      return res
        .status(404)
        .json(response(null, 404, "Data kelas tidak ditemukan"));
    }
    return res.status(200).json(response(kelas, 200, "Data kelas"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// tambah kelas
app.post("/api/kelas", validateToken, validateRole, async (req, res) => {
  try {
    const kelas = req.body;
    const { id, username } = req.user;

    console.log(id);
    if (
      !kelas.title ||
      !kelas.description ||
      !kelas.imageLink ||
      !kelas.price
    ) {
      return res.status(400).json(response(null, 400, "Bad Request"));
    }

    const newKelas = new Kelas({
      title: kelas.title,
      description: kelas.description,
      imageLink: kelas.imageLink,
      price: kelas.price,
      createdBy: username,
      createdById: id,
    });

    await newKelas.save();
    return res
      .status(201)
      .json(response(newKelas, 201, "Kelas berhasil dibuat"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// edit kelas
app.put("/api/kelas/:id", validateToken, validateRole, async (req, res) => {
  try {
    const { id } = req.params;
    const kelas = req.body;

    if (
      !kelas.title ||
      !kelas.description ||
      !kelas.imageLink ||
      !kelas.price
    ) {
      return res.status(400).json(response(null, 400, "Bad Request"));
    }

    const updatedKelas = await Kelas.findByIdAndUpdate(id, kelas, {
      new: true,
    });

    return res
      .status(200)
      .json(response(updatedKelas, 200, "Kelas berhasil diupdate"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// delete kelas
app.delete("/api/kelas/:id", validateToken, validateRole, async (req, res) => {
  try {
    const { id } = req.params;
    await Kelas.findByIdAndDelete(id);
    return res.status(200).json(response(null, 200, "Kelas berhasil dihapus"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// teacher lihat kelas sendiri
app.get("/api/teacher/kelas", validateToken, async (req, res) => {
  try {
    const { id } = req.user;
    const kelas = await Kelas.find({ createdById: id });

    if (!kelas || kelas.length === 0) {
      return res
        .status(404)
        .json(response(null, 404, "Data kelas tidak ditemukan"));
    }

    return res.status(200).json(response(kelas, 200, "Data kelas"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// lihat user kelas sudah bayar
app.get("/api/user/kelas", validateToken, async (req, res) => {
  try {
    const { id } = req.user;
    const userKelas = await User_Kelas.find({ user: id }).populate("kelas");

    if (!userKelas || userKelas.length === 0) {
      return res
        .status(404)
        .json(response(null, 404, "Data kelas tidak ditemukan"));
    }

    return res.status(200).json(response(userKelas, 200, "Data kelas"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// user join kelas
app.post("/api/user/kelas", validateToken, async (req, res) => {
  try {
    const { kelasId } = req.body;
    const { id } = req.user;

    const userKelas = new User_Kelas({
      user: id,
      kelas: kelasId,
    });

    await userKelas.save();
    return res
      .status(201)
      .json(response(userKelas, 201, "User berhasil join kelas"));
  } catch (error) {
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

// admin lihat semua user
app.get("/api/admin/user", validateToken, validateRole, async (req, res) => {
  console.log("Masuk ke endpoint /api/admin/user");

  try {
    const users = await User.find();
    console.log("Data user:", users); // Log data user dari database

    if (!users || users.length === 0) {
      console.log("Data user tidak ditemukan");
      return res
        .status(404)
        .json(response(null, 404, "Data user tidak ditemukan"));
    }

    return res.status(200).json(response(users, 200, "Data user"));
  } catch (error) {
    console.error("Error pada server:", error.message); // Log error server
    return res.status(500).json(response(null, 500, "Kesalahan pada server"));
  }
});

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}`)
);
