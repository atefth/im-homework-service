const multer = require("multer");
const { s3Uploader } = require("../services/s3Uploader");
const { resizeQueuer } = require("../services/resizeQueuer");
const uploadImagesToS3 = (req, res, next) => {
  const response = { uploaded: [], failed: [] };
  s3Uploader(req, res, (error, data) => {
    if (error) {
      response.failed.push(error);
      resizeQueuer(false, {
        ...data,
        visibility: req.body.visibility,
        resizeTo: req.body.resizeTo,
        sessionId: req.session.id,
      });
    } else {
      response.uploaded.push(data);
      resizeQueuer(true, {
        ...data,
        visibility: req.body.visibility,
        resizeTo: req.body.resizeTo,
        sessionId: req.session.id,
      });
    }
    if (
      response.uploaded.length + response.failed.length ===
      req.files.length
    ) {
      if (response.uploaded.length) {
        response.success = true;
        res.status(200).send(response);
      } else {
        response.success = false;
        res.status(500).send(response);
      }
    }
  });
};

module.exports = {
  uploadImagesToS3,
};
