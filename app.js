const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const logger = require("morgan");
const Keygrip = require("keygrip");

const routes = require("./routes/api");

const app = express();
app.set("trust proxy", 1);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "image_resizer_session",
    keys: new Keygrip(["key1", "key2"], "SHA384", "base64"),
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(function (req, res, next) {
  req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
  next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

routes(app);

module.exports = app;
