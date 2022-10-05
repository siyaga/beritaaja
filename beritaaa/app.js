var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var beritaRouter = require('./routes/berita');

var app = express();
app.set('trust proxy', 1)
app.use(session({
  secret: '12345',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false, // This will only work if you have https enabled!
  maxAge: 60*60*1000 // 1 min
 }
}))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const db = require('./models');
db.sequelize.sync()
.then(()=> {
    console.log("async db");
})
.catch((err)=> {
    console.log("error: "+ err.message);
})
app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/berita', beritaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
