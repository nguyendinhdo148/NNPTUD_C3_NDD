require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index.js');
var usersRouter = require('./routes/users.js');
var productsRouter = require('./routes/products.js');
var categoriesRouter = require('./routes/categories.js');
var rolesRouter = require('./routes/roles.js');  // Thêm roles router
var authRouter = require("./routes/auth");
var inventoryRouter = require("./routes/inventory");
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/roles', rolesRouter);  // Thêm route cho roles
app.use('/v1/roles', rolesRouter);
app.use("/auth", authRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use('/api/v1/upload', require('./routes/upload'));
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected', function () {
  console.log('MongoDB Atlas connected');
});

mongoose.connection.on('error', function (err) {
  console.log('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', function () {
  console.log('MongoDB disconnected');
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;