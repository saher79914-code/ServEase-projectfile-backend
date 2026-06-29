const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── Allowed MIME types ──────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WEBP images are allowed"), false);
  }
};

// ── Helper: create storage ──────────────────────────────────────────
const makeStorage = (subfolder) => {
  const dir = path.join(__dirname, "..", "uploads", subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
};

// ── Profile image uploader ──────────────────────────────────────────
const upload = multer({
  storage: makeStorage("profile"),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ── CNIC uploader ───────────────────────────────────────────────────
const cnicUpload = multer({
  storage: makeStorage("cnic"),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ── Security deposit uploader ───────────────────────────────────────
const securityUpload = multer({
  storage: makeStorage("security"),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ── Commission screenshot uploader ─────────────────────────────────
const commissionUpload = multer({
  storage: makeStorage("commission"),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload, cnicUpload, securityUpload, commissionUpload };