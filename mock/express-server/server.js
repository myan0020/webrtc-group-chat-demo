// const createError = require('http-errors');
const express = require('express');
// const path = require('path');
const { expressServerPort } = require('../../config/url');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const chalk = require('chalk');
const author_controller = require('./controllers/authorController');

const app = express();

/**
 * ??? middleware setup
 */

app.use(logger('dev'));

/**
 * ??? middleware setup
 */

app.use(express.json());

/**
 * ??? middleware setup
 */

app.use(express.urlencoded({ extended: false }));

/**
 * cookieParser middleware setup
 */

// app.use(cookieParser());


/**
 * router setup
 */

// testing paths: setup the allowed url paths for webpack-dev-server proxy
const paths = ['/hello', '/world', '/author'];

// testing path
app.use('/hello', (req, res) => {
  res.json({ hello: 'A polite English greeting word' })
})

// testing path
app.use('/world', (req, res) => {
  res.send('world!')
})

// testing path: GET author information by author id
app.get('/author/:id', author_controller.author_detail);

// testing path: GET author information list
app.get('/authors', author_controller.author_list);

/**
 * error handling middleware setup
 */

app.use(function (req, res, next) {
  next(new Error('Something Broke!'));
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(400).send(err.message)
})

/**
 * start server listening & mongoose connection setup
 */

app.listen(expressServerPort, () => {
  const mongooseUrl = 'mongodb://mingdongshensen:mingdongshensen@localhost/admin';
  const mongooseOptions = { dbName: 'test' };

  mongoose.connect(mongooseUrl, mongooseOptions);
  mongoose.connection.on('connecting', function () {
    console.log(chalk.yellow`express-server's mongodb connecting...`);
  });
  mongoose.connection.on('connected', function () {
    console.log(chalk.yellow`express-server's mongodb connection established`);
    // send message through stdout write stream if mongodb connection is established
    console.log(chalk.yellow`express-server is running on http://localhost:${expressServerPort}`)
    console.log(chalk.yellow`success`)
  });
  mongoose.connection.on('disconnected', function () {
    console.log(chalk.yellow`express-server's mongodb connection closed`);
  });
  mongoose.connection.on('error', () => {
    console.error(chalk.red`express-server's mongodb connection failed`)
  });
})

module.exports = {
  expressServerPaths: paths,
}
