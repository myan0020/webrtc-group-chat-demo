

// const createError = require('http-errors');
const express = require('express');
// const path = require('path');
const { expressServerPort } = require('../../config/url');
// const cookieParser = require('cookie-parser');
// const logger = require('morgan');
// const mongoose = require('mongoose');
// const indexRouter = require('./routes/index');
// const catalogRouter = require('./routes/catalog'); // 导入 catalog 路由

const app = express();

/**
 * mongoose connection setup
 */
// const mongooseUrl = process.env.MONGODB_URI || 'mongodb://mingdongshensen:mingdongshensen@localhost/admin';
// const mongooseOptions = { dbName: 'test' };
// mongoose.connect(mongooseUrl, mongooseOptions);
// mongoose.connection.on('connecting', function () {
//   console.log("mongodb connecting...");
// });
// mongoose.connection.on('connected', function () {
//   console.log("mongodb connection established");
// });
// mongoose.connection.on('disconnected', function () {
//   console.log('mongodb connection closed');
// });
// mongoose.connection.on('error', console.error.bind(console, 'MongoDB 连接错误：'));


/**
 * ??? middleware setup
 */
// app.use(logger('dev'));


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
 const paths = ['/hello', '/world'];
// app.use('/', indexRouter);
// app.use('/catalog', catalogRouter);

app.use('/hello', (req, res) => {
  res.json({ hello: 'A polite English greeting word' })
})

app.use('/world', (req, res) => {
  res.send('world!')
})


/**
 * error handling middleware setup
 */
app.use((err, req, res, next) => {
  res.status(400).send(err.message)
})

/**
 * start listening
 */
app.listen(expressServerPort, () => {
  // console.log(`express server is running on port ${expressServerPort}`)
  process.stdout.write(`express-server is running on http://localhost:${expressServerPort}\n`)
})

module.exports = {
  expressServerPaths: paths,
}
