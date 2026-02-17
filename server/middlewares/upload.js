const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
// const {uuid} = require("uuid")

const storage = multer.memoryStorage(); // keeps file in memory as buffer

const imgStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const outputDir = path.resolve("public/temp/");
    const exists = await fs
      .access(outputDir, fs.constants.F_OK)
      .catch(() => {});

    if (!exists) await fs.mkdir(outputDir, { recursive: true });
    cb(null, outputDir);
  },

  filename: (req, file, cb) => {
    // console.log(req.user)
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const img = multer({ storage: imgStorage });

const vid = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = { vid, img };
