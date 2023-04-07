import dotenv from "dotenv";
dotenv.config();

import express from "express";

import { client } from "./db.js";

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";



const app = express();
import multer from "multer";

// MIDDLEWARE

// Untuk mengelola cookie
app.use(cookieParser());

// Untuk memeriksa otorisasi
app.use((req, res, next) => {
  if (req.path.startsWith("/api/login") || req.path.startsWith("/assets")|| req.path.startsWith("/login")|| req.path.startsWith("/home")|| req.path.startsWith("/daftar")|| req.path.startsWith("/api/daftar")) {
    next();
  } else {
    let authorized = false;
    if (req.cookies.token) {
      try {
        jwt.verify(req.cookies.token, process.env.SECRET_KEY);
        authorized = true;
      } catch (err) {
        res.setHeader("Cache-Control","no-store"); // khusus Vercel
        res.clearCookie("token");
      }
    }
    if (authorized) {
      if (req.path.startsWith("/home")) {
        res.redirect("/");
      } else {
        next();
      }
    } else {
      if (req.path.startsWith("/home")) {
        next();
      } else {
        if (req.path.startsWith("/api")) {
          res.status(401);
          res.send("Anda harus login terlebih dahulu.");
        } else {
          res.redirect("/home");
        }
      }
    }
  }
});



// Untuk mengakses file statis
app.use(express.static("public"));

const upload = multer({ dest: "public/photo" });
// Untuk mengakses file statis (khusus Vercel)
// import path from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const _dirname = path.dirname(_filename);
// app.use(express.static(path.join(__dirname, "public")));
// Untuk membaca body berformat JSON
app.use(express.json());

// ROUTE OTORISASI

// Login (dapatkan token)
app.post("/api/login", async (req, res) => {
    const results = await client.query(
      `SELECT * FROM login where username='${req.body.username}'`
    );
    if (results.rows.length > 0) {
      if (await bcrypt.compare(req.body.password,results.rows[0].password)) {
        const token = jwt.sign(results.rows[0], process.env.SECRET_KEY);
        res.cookie("token", token);
        res.send("Login berhasil.");
      } else {
        res.status(401);
        res.send("Kata sandi salah.");
      }
    } else {
      res.status(401);
      res.send("Mahasiswa tidak ditemukan.");
    }
  });
// Dapatkan mahasiswa saat ini (yang sedang login)

// Logout (hapus token)
app.get("/api/logout", (_req, res) => {
  res.setHeader("Cache-Control", "no-store"); // khusus Vercel
  res.clearCookie("token");
  res.send("Logout berhasil.");
});

// ROUTE BARANG 

// Dapatkan semua
app.get("/api/barang", async (_req, res) => {
  const results = await client.query("SELECT * FROM barang ORDER BY id");
  res.json(results.rows);
});


// Tambah daftar
app.post("/api/daftar", async (req, res) => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(req.body.password, salt);
  await client.query(
    `INSERT INTO login (username,password) VALUES ('${req.body.username}','${hash}')`
  );
  res.send("Mahasiswa berhasil ditambahkan.");
});


//tambah barang
app.post("/api/barang",upload.single("foto"), async (req, res) => {
  await client.query(
    `INSERT INTO barang(nama_barang,harga,deskripsi,id_kategori,foto)VALUES('${req.body.nama_barang}',${req.body.harga},'${req.body.deskripsi}', ${req.body.id_kategori},'${req.file.filename}')`
  );
  res.send("barang berhasil ditambahkan.");
});



// Edit
app.put("/api/barang/:id",upload.single("foto"), async (req, res) => {
  console.log(req.body);
  console.log(req.params.id);
  await client.query(
    `UPDATE barang SET nama_barang = '${req.body.nama_barang}', harga = ${req.body.harga}, deskripsi = '${req.body.deskripsi}', id_kategori = ${req.body.id_kategori},foto = '${req.file.filename}'  WHERE id=${req.params.id}`
  );
  res.send("barang berhasil diedit.");
});

// Hapus
app.delete("/api/barang/:id", async (req, res) => {
  await client.query(`
  DELETE FROM barang WHERE id = ${req.params.id}`);
  res.send("barang berhasil dihapus.");
});

//keluar
app.get("/api/keluar", (_req, res) => {
  res.clearCookie("token");
  res.redirect("/home");
});


// MEMULAI SERVER

app.listen(3000, () => {
  console.log("Server berhasil berjalan.");
});
