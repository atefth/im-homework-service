const multer = require("multer");
const { s3Uploader } = require("../utils/s3Uploader");
const maxFiles = s3Uploader.array("images", process.env.MAX_FILES);

const uploadImagesToS3 = (req, res, next) => {
  maxFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(500).send({ error: "File upload limit exceeded!" });
      }
    } else if (err) {
      return res.status(500).send({ error: err });
    }
    res
      .status(200)
      .send({ success: true, message: "Files were uploaded to S3!" });
  });
};

module.exports = {
  uploadImagesToS3,
};
