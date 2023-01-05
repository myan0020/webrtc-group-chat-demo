const mongoose = require("mongoose");
const chalk = require("chalk");

exports.connectMongDB = () => {
  const mongooseUrl = "mongodb://mingdongshensen:mingdongshensen@localhost/admin";
  const mongooseOptions = { dbName: "test" };

  mongoose.connect(mongooseUrl, mongooseOptions);
  mongoose.connection.on("connecting", function () {
    console.log(chalk.yellow`express-server's mongodb connecting...`);
  });
  mongoose.connection.on("connected", function () {
    console.log(chalk.yellow`express-server's mongodb connection established`);
    // send message through stdout write stream if mongodb connection is established
    console.log(chalk.yellow`express-server is running`);
    console.log(chalk.yellow`success`);
  });
  mongoose.connection.on("disconnected", function () {
    console.log(chalk.yellow`express-server's mongodb connection closed`);
  });
  mongoose.connection.on("error", () => {
    console.error(chalk.red`express-server's mongodb connection failed`);
  });
};
