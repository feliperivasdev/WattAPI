var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require('cors');


var indexRouter = require("./routes/index");
var electrodomesticostRouter = require("./routes/electrodomesticos");
var consumoRouter = require("./routes/consumo");
var usuariosRouter = require("./routes/usuarios");
var reporteRouter = require("./routes/reporte");
var authRouter = require('./routes/authRoutes')
var app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/electrodomesticos", electrodomesticostRouter);
app.use("/consumo", consumoRouter);
app.use("/usuarios", usuariosRouter);
app.use("/reporte", reporteRouter);
app.use('/auth', authRouter);

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
