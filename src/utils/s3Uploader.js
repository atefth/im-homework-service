const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // Bucket: process.env.AWS_BUCKET_NAME,
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

const multerS3Config = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  // acl: "public-read",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname, public: "yes" });
  },
  key: function (req, file, cb) {
    console.log(file);
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const s3Uploader = multer({
  storage: multerS3Config,
  fileFilter: imageFilter,
  limits: {
    fileSize: 1024 * 1024 * process.env.MAX_FILE_SIZE,
  },
});

module.exports = {
  s3Uploader,
};
