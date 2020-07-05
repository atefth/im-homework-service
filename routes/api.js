const express = require("express");
const router = express.Router();
const uploadController = require("../src/controllers/upload");
const statusController = require("../src/controllers/status");
const { uploaderMiddleware } = require("../src/utils/middleware");

let routes = (app) => {
  router.get("/images", statusController.resizeStatus);
  router.post("/upload", uploaderMiddleware, uploadController.uploadImagesToS3);
  return app.use(router);
};

module.exports = routes;
