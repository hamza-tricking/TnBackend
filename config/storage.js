const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsRootDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsRootDir)) {
  fs.mkdirSync(uploadsRootDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let subfolder = 'others';
    if (file.mimetype.startsWith('image/')) subfolder = 'images';
    else if (file.mimetype.startsWith('video/')) subfolder = 'videos';
    const targetDir = path.join(uploadsRootDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

const getFileUrl = (file) => {
  const backendBaseUrl = process.env.BACKEND_URL || 'https://dmtart.pro/TnBackend';
  const rel = path.relative(uploadsRootDir, file.path).replace(/\\/g, '/');
  return `${backendBaseUrl}/uploads/${rel}`;
};

module.exports = {
  upload,
  uploadsRootDir,
  getFileUrl
};
