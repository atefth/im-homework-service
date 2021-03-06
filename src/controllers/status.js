const { prober, signedUrl } = require("../services/s3");

const resizeStatus = (req, res, next) => {
  prober(req, true, (error, data) => {
    if (error) {
      res.status(500).send({ success: false, error });
    } else {
      res.status(200).send({ success: true, data });
    }
  });
};

const uploadedStatus = (req, res, next) => {
  prober(req, false, (error, data) => {
    if (error) {
      res.status(500).send({ success: false, error });
    } else {
      res.status(200).send({ success: true, data });
    }
  });
};

const getImage = (req, res, next) => {
  const key = req.query.key;
  signedUrl(key, (error, data) => {
    if (error) {
      res.status(500).send({ success: false, error });
    } else {
      res.status(200).send({ success: true, data });
    }
  });
};

const resizedImage = (req, res, next) => {
  const { originalKey, resizedKey } = req.query;
  res.io.emit("resizedImage", { originalKey, resizedKey });
  res.status(200).send({ success: true });
};

module.exports = {
  resizeStatus,
  uploadedStatus,
  getImage,
  resizedImage,
};
