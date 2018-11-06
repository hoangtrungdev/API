const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const restfulsRouter = require('./routes/restfuls.js');


const app = express();

const favicon = require('serve-favicon');

app.use(favicon(__dirname + '/public/images/favicon.ico'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/restfuls', restfulsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// Catches uncaught exceptions
process.on('uncaughtException', function(err) {
  haveToExitHandler("uncaughtException", err);
});

function haveToExitHandler(event, err) {
  console.error('api:error:app-js:' + event, err);
}


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error(`api:error:app-js:${err.status}`, err);
  res.json({
    code: err.status ,
    message: err.message
  })
});

module.exports = app;
