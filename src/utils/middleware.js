const multer = require("multer");

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

const uploadLimits = {
  fileSize: 1024 * 1024 * process.env.MAX_FILE_SIZE,
};

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
  fileFilter: imageFilter,
  limits: uploadLimits,
});

const uploaderMiddleware = multer({ storage: storage }).array(
  "uploads",
  process.env.MAX_FILE
);

module.exports = {
  uploaderMiddleware,
};
