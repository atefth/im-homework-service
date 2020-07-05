const multer = require("multer");
const { s3Uploader } = require("../utils/s3Uploader");
const uploadImagesToS3 = (req, res, next) => {
  s3Uploader(req, res, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  // uploader(req, res, (err) => {
  //   if (err instanceof multer.MulterError) {
  //     if (err.code === "LIMIT_UNEXPECTED_FILE") {
  //       return res.status(500).send({ error: "File upload limit exceeded!" });
  //     }
  //   } else if (err) {
  //     return res.status(500).send({ error: err });
  //   }
  //   res
  //     .status(200)
  //     .send({ success: true, message: "Files were uploaded to S3!" });
  // });
};

module.exports = {
  uploadImagesToS3,
};
