const multer = require("multer");
const path = require("path");
const fs = require("fs");

const proDir = path.join(__dirname, "../../teamnostruggle.com/uploads/");
const devDir = path.join(__dirname, "../../client/public/uploads/");
const uploadDir = devDir;

// Make sure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;
