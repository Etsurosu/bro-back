const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("errorhandler");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

mongoose.promise = global.Promise;
const isProduction = process.env.NODE_ENV === "production";
const app = express();

app.use(logger("dev"));
app.use(cors());
app.use(require("morgan")("dev"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "broback",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);

if (!isProduction) {
  app.use(errorHandler());
}

mongoose.connect("mongodb://localhost/brodb", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("debug", true);

require("./models/Users");
require("./config/passport");

const swaggerOpts = {
  customCss: ".swagger-ui .topbar { display: none }"
};

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOpts));
app.use(require("./routes"));

if (!isProduction) {
  app.use((err, req, res, next) => {
    res.status(err.status || 400);

    res.json({
      errors: {
        message: err.message,
        error: err
      }
    });
    next();
  });
}

module.exports = app;
