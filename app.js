var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var walletsRouter = require('./routes/wallets.js');
const { default: Moralis } = require('moralis');
const { MORALIS_API_KEY } = require('./constants.js');
const cors = require('cors');

var app = express();
app.use(cors());

Moralis.start({
    apiKey: MORALIS_API_KEY,
    // ...and any other configuration
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/wallet', walletsRouter);

module.exports = app;
