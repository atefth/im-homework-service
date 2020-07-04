const express = require("express");
const router = express.Router();
const uploadController = require("../src/controllers/upload");

let routes = (app) => {
  router.get("/", (req, res, next) => {
    res.send({ status: "ok" });
  });
  router.post("/upload", uploadController.uploadImagesToS3);
  return app.use(router);
};

module.exports = routes;
