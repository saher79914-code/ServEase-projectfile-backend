const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "profile");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;

// ── CNIC uploader (separate folder) ──
const cnicDir = path.join(__dirname, "..", "uploads", "cnic");
if (!fs.existsSync(cnicDir)) fs.mkdirSync(cnicDir, { recursive: true });

const cnicStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, cnicDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

module.exports.cnicUpload = multer({ storage: cnicStorage });

// ── Security deposit uploader ──
const securityDir = path.join(__dirname, "..", "uploads", "security");
if (!fs.existsSync(securityDir)) fs.mkdirSync(securityDir, { recursive: true });

const securityStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, securityDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

module.exports.securityUpload = multer({ storage: securityStorage });