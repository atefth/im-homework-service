const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("../routes/api");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["*"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

app.use(
  session({
    name: "im-homework",
    secret: "Ts]KB+Mpa8R`",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: new Date(Date.now() + 3600000),
      secure: false,
    },
    genid: function (req) {
      return uuidv4();
    },
  })
);
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(function (req, res, next) {
  res.io = io;
  next();
});
app.use(logger("dev"));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));

routes(app);

app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({
      message: err.message,
      error: err,
    });
  });
}

app.use(function (err, req, res, next) {
  res.status(err.status || 500).send({
    message: err.message,
    error: {},
  });
});

module.exports = { app, server, io };
