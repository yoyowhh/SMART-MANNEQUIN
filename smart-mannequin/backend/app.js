let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
// let logger = require("morgan");
const swaggerjsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

// routing
let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users");
let statusRouter = require("./routes/status");
let sensorRouter = require("./routes/sensor");
let authRouter = require("./routes/auth");
let mannequinRouter = require("./routes/mannequin");
let sensorReadingRouter = require("./routes/sensorReading");
const { initSmartskinTables } = require("./src/migration/smartskinMigration");
const { seedLoadcellData } = require("./src/migration/loadcellSeeder");
const { seedMannequin2Data } = require("./src/migration/mannequin2Seeder");

// Initialize Smart Skin database tables & seed loadcell and mannequin 2 if needed
initSmartskinTables();
seedLoadcellData();
seedMannequin2Data();

const { verifyToken, cLogger } = require("./src/middleware");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());

// app.use(logger('dev', {
//   skip: function (req, res) { return res.statusCode < 400 }
// }))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cLogger);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/status", statusRouter);
app.use("/lora", require("./routes/sensor/lora"));
app.use("/sensor-reading", sensorReadingRouter);
app.use("/sensor", verifyToken, sensorRouter);
app.use("/mannequin", verifyToken, mannequinRouter);
app.use("/auth", authRouter);

const options = {
  definition: {
    openapi: "3.0.0",
    servers: [
      {
        url: process.env.URL,
      },
    ],
    info: {
      title: "STAS-RG Smart Mannequin API docs",
      version: "1.0.0",
      description: "API for Smart Mannequin project",
      contact: {
        name: "STAS-RG",
        url: "https://www.stas-rg.com/",
      },
    },
  },
  apis: ["./routes/*.js", "./routes/sensor/*.js"],
};
const spacs = swaggerjsdoc(options);
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(spacs));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
