const { prober } = require("../services/s3");

const resizeStatus = (req, res, next) => {
  prober(req, res, (error, data) => {
    if (error) {
      res.status(500).send({ success: false, error });
    } else {
      res.status(200).send({ success: true, data });
    }
  });
};

module.exports = {
  resizeStatus,
};
