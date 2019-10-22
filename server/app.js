'use strict';

const createError = require('http-errors');
const express = require('express');
const app = express();

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//For Passport
const passport   = require('passport');
const session    = require('express-session');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

// getting the local authentication type
const LocalStrategy = require('passport-local').Strategy

const env = require('dotenv').config();
// -----


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//-------

// For Passport
//app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
app.use(cookieSession({name: 'mysession', keys: ['vueauthrandomkey'], maxAge: 24 * 60 * 60 * 1000 })); // 24 hours
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//-------


const indexRouter = require('./routes/index');
//const usersRouter = require('./routes/users');

app.use('/', indexRouter);
//app.use('/users', usersRouter);

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

// test models

console.log('APP.JS <---------------------------');
module.exports = app;
